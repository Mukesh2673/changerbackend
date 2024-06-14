require("dotenv").config();
const {
  Campaign,
  CampaignParticipant,
  User,
  Donated,
  Impact,
  Video,
  donation,
  petitions,
  campaignPhases,
  Volunteers,
  Message,
  SignedPetitions,
  Issue,
  Notification,
  Report
} = require("../models");

const mongoose = require("mongoose");
const { generateTags } = require("../controllers/hashtagController");
const { upload, uploadVideoThumbnail } = require("../libs/fileUpload");
const { sendMessage } = require("../libs/webSocket");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { addVideoInAlgolia } = require("../algolia/videoAlgolia");
const { updateUsersInAlgolia } = require("../algolia/userAlgolia");
const { updateIssueInAlgolia } = require("../algolia/issueAlgolia");
const {
  addCampaignInAlgolia,
  updateCampaignInAlgolia,
} = require("../algolia/campaignAlgolia");
//common function to get all campaign Records
exports.campaignRecords = async (query) => {
  const skip = query.skip !== undefined ? query.skip : 0;
  const limit = query.limit !== undefined ? query.limit : 0;
  delete query.skip;
  delete query.limit;
  let records = await Campaign.find(query)
    .populate([
      {
        path: "phases",
        populate: [
          { path: "donation", model: donation },
          { path: "petition", model: petitions },
          { path: "participation", model: CampaignParticipant },
        ],
      },
      {
        path: "videos",
        populate: { path: "videos", model: Video },
      },
      {
        path: "impacts",
        populate: { path: "impacts", model: Impact },
      },
    ])
    .skip(skip)
    .limit(limit);
  return records;
};
//get all Campaign
exports.showCampaigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;
    let campaignData = await this.campaignRecords({
      skip: skip,
      limit: pageSize,
    });
    return res.json({
      status: 200,
      data: campaignData,
      success: true,
    });
  } catch (error) {
    console.log("err irs", error);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};
//get Campaing by Id
exports.showCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "advocates",
          localField: "advocate",
          foreignField: "_id",
          as: "advocate",
        },
      },
      {
        $lookup: {
          from: "phases",
          localField: "phases",
          foreignField: "_id",
          as: "phases",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      { $unwind: { path: "$video", preserveNullAndEmptyArrays: true } }, // Video may be null, so preserve nulls
      {
        $lookup: {
          from: "videos",
          localField: "impacts",
          foreignField: "_id",
          as: "impacts",
        },
      },
      {
        $lookup: {
          from: "notifications",
          localField: "updates",
          foreignField: "_id",
          as: "updates",
        },
      },
    ]);

    if (campaign.length > 0) {
      return res.json(campaign);
    } else {
      return res.status(404).json({ message: "Campaign not found." });
    }
  } catch (error) {
    console.error("Error in showCampaign:", error);
    return res.status(500).json({ message: error.message });
  }
};

//create a campaign
exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    const tags = await generateTags(data.title);
    if (!mongoose.Types.ObjectId.isValid(data.user)) {
      return res.status(400).json({
        status: 400,
        error: "Invalid User ID format",
        success: false,
      });
    }
    const auth = await User.findById({ _id: data.user });
    if (!auth) {
      return res.json({
        status: 401,
        message: "invalid User",
        success: false,
      });
    }
    const karmaPoint = auth.karmaPoint + 100;
    await User.findByIdAndUpdate(
      { _id: auth._id },
      {
        $set: {
          karmaPoint: karmaPoint,
        },
      },
      { new: true }
    );
    await updateUsersInAlgolia(auth._id);
    const campaign = new Campaign({
      user: data.user,
      cause: data.cause,
      title: data.title,
      story: data.story,
      image: data.image,
    });
    const campaigns = await campaign.save();
    await addCampaignInAlgolia(campaigns._id);
    //if campaign is created from issue
    if (mongoose.Types.ObjectId.isValid(data.issue)) {
      let issue = await Issue.findByIdAndUpdate(
        {
          _id: data.issue,
        },
        {
          $push: {
            campaign: campaigns._id,
          },
        }
      );
      updateIssueInAlgolia(data.issue);
      if (!issue) {
        return res.status(400).json({
          status: 400,
          error: "Invalid issue ID format",
          success: false,
        });
      }
    }
    //add hastags to the campaign that are unique to each other
    let campaignTag = campaigns?.hashtags;
    var tagsArray = [];
    if (campaignTag?.length > 0) {
      let arr = [...campaignTag, ...tags];
      tagsArray = arr.filter(
        (value, index, self) => self.indexOf(value) === index
      );
    } else {
      tagsArray = tags;
    }
    //save campaign video to video collection
    const campaignsId = campaigns._id;
    const videos = new Video({
      user: req.body.user,
      campaign: campaignsId,
      description: req.body.campaignStory,
      title: req.body.title,
      video_url: req.body.video.videoUrl,
      type: req.body.video.type,
      thumbnail_url: req.body.thumbnailUrl,
      hashtags: tagsArray,
    });
    const savedVideo = await videos.save();
    await addVideoInAlgolia(savedVideo._id);
    const videoId = savedVideo._id;
    const phaseArr = data.phase;
    const savePhaseId = [];
    await addVideoInAlgolia(videoId);
    //save phase data to campaign Phase Collection
    for (let i = 0; i < phaseArr.length; i++) {
      const phaseItem = new campaignPhases({
        title: phaseArr[i].title,
        campaign: campaignsId,
      });
      const savePhaseItem = await phaseItem.save();
      savePhaseId[i] = savePhaseItem._id;
      const Action = req.body.phase[i].action;
      const donationCount = Action.filter((item) => item?.name == "donation");
      if (donationCount.length > 1) {
        return res.json({
          status: 400,
          message: "duplicate donation not allow",
        });
      }
      donationCount[0].phaseId = savePhaseId[i];
      const petitionData = Action.filter((item) => item?.name == "petition");
      if (petitionData.length > 1) {
        return res.json({
          status: 400,
          message: "duplicate petition not allow",
        });
      }

      petitionData[0].phaseId = savePhaseId[i];
      const participation = Action.filter(
        (item) => item?.name == "participation"
      );
      const participantionsId = [];
      const location = [];
      for (let j = 0; j < participation.length; j++) {
        participation[j].phaseId = savePhaseId[i];
        const participant = new CampaignParticipant(participation[j]);
        const savedParticipant = await participant.save();
        let id = savedParticipant._id;
        let geoLocation = {
          lat: parseFloat(savedParticipant.location.coordinates[0]),
          lng: parseFloat(savedParticipant.location.coordinates[1]),
        };
        location.push(geoLocation);
        participantionsId.push(id);
      }
      const donations = new donation(donationCount[0]);
      const savedDonation = await donations.save();
      const DonationId = savedDonation._id;
      const petition = new petitions(petitionData[0]);
      const savedPetitions = await petition.save();
      const petitionId = savedPetitions._id;
      await campaignPhases.findByIdAndUpdate(
        { _id: savePhaseId[i] },
        {
          $set: {
            donation: DonationId,
            petition: petitionId,
            participation: participantionsId,
          },
        },
        { new: true }
      );
      await Campaign.findByIdAndUpdate(
        { _id: campaignsId },
        {
          $set: {
            phases: savePhaseId,
            hashtags: tagsArray,
            video: videoId,
            _geoloc: location,
          },
        }
      );
      updateCampaignInAlgolia(campaignsId);
    }
    let records = await this.campaignRecords({ _id: campaignsId });

    const message = `You received +100 karma Point for good intention of creating Campaign ${records[0].title}`;
    const notification = new Notification({
      messages: message,
      user: auth._id,
      activity: records[0].user,
      notificationType: "karmaPoint",
    });
    sendMessage("karmaPoint", message, auth._id);
    await notification.save();
    return res.json({
      status: 200,
      message: "Campaign added successfully!",
      success: true,
      data: records,
    });
  } catch (err) {
    console.log("erro is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.donate = async (req, res) => {
  try {
    const userId = req.user; // Assuming req.user contains the authenticated user object
    const donationId = req.params.id;
    // Find the donation action added within campaign phase
    const campaignDonation = await donation.findById(donationId);
    if (!campaignDonation) {
      return res.status(404).json({ message: "Campaign donation not found" });
    }
    // check is  donation  exist in campaign phase
    const campaignPhase = await campaignPhases.findOne({
      donation: donationId,
    });

    if (!campaignPhase) {
      return res
        .status(404)
        .json({ message: "Donation is  not exist on phase" });
    }

    // check is campaign phase exist in campaign
    const campaign = await Campaign.findOne({
      phases: { $in: [mongoose.Types.ObjectId(campaignPhase._id)] },
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ message: "Donation and phase not exist in campaign" });
    }

    // Find the user and update karma points
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Create Stripe charge for donation
    const stripeToken = req.body.source;
    const charge = await stripe.charges.create({
      amount: parseInt(req.body.amount * 100), // Amount in cents
      currency: "usd",
      card: stripeToken,
      description: req.body.description,
    });

    // Handle the charge response
    if (charge.status === "succeeded") {
      let campaignDonation = new Donated({
        amount: req.body.amount,
        chargeId: charge.id,
        donation: donationId,
      });
      await campaignDonation.save();
      const karmaPoints = Math.round(req.body.amount * 10);
      user.karmaPoint += karmaPoints;
      await user.save();

      // Add notification to user who made doanation about karma points
      const karmaMessage = `You received +50 karma points for participating in the campaign ${campaign.title}`;
      const karmaNotification = new Notification({
        messages: karmaMessage,
        user: user._id,
        activity: campaign.user._id,
        notificationType: "karmaPoint",
      });
      await karmaNotification.save();
      sendMessage("karmaPoint", karmaMessage, user._id);

      //Add notification to user who create campaign about donation
      const donationMessage = `${user.first_name} ${user.last_name} donate ${req.body.amount} for Campaign ${campaign.title}`;
      const donationNotification = new Notification({
        messages: donationMessage,
        user: campaign.user._id,
        activity: user._id,
        notificationType: "campaignDonation",
      });
      await donationNotification.save();
      await Campaign.findByIdAndUpdate(
        campaign._id,
        {
          $push: { updates: donationNotification._id },
        },
        { new: true }
      );
      await updateCampaignInAlgolia(campaign._id);
      return res.status(200).json({
        status: 200,
        message: "campaign Donation Success Fully",
        success: true,
      });
    } else {
      return res.status(400).json({ message: "Payment failed" });
    }
  } catch (err) {
    console.log("valueof erro is", err);
    if (err.type === "StripeCardError") {
      return res.status(401).json({ message: "Card error" });
    }
    return res.status(500).json({ message: err.message });
  }
};

//add Volunteers to campaign
exports.participateInCampaign = async (req, res) => {
  try {
    const { user } = req;
    const { campaignId, participationId } = req.params;

    // Find the campaign
    const campaign = await Campaign.findById(campaignId).populate({
      path: "user",
      populate: { path: "user", model: User },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    // Update Karma Points for the user's profile
    const currentUser = await User.findById(user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    currentUser.karmaPoint += 50;
    await currentUser.save();
    updateUsersInAlgolia(user._id);
    // Check if the user is already participating
    const existingParticipation = await Volunteers.findOne({
      campaign: campaign._id,
      user: user._id,
      participation: participationId,
    });

    if (existingParticipation) {
      return res
        .status(422)
        .json({ message: "You are already participating in this campaign." });
    }

    // Create a new participation record
    const newVolunteer = new Volunteers({
      user: user._id,
      campaign: campaign._id,
      participation: participationId,
    });
    const savedVolunteer = await newVolunteer.save();

    // Add notification for karma points
    const karmaMessage = `You received +50 karma points for participating in the campaign ${campaign.title}`;
    const karmaNotification = new Notification({
      messages: karmaMessage,
      user: currentUser._id,
      activity: campaign.user._id,
      campaign: campaign._id,
      notificationType: "karmaPoint",
    });
    await karmaNotification.save();
    sendMessage("karmaPoint", karmaMessage, currentUser._id);

    // Add notification for campaign participation
    const participationMessage = `${currentUser.first_name} ${currentUser.last_name} participated in the campaign ${campaign.title}`;
    const participationNotification = new Notification({
      messages: participationMessage,
      user: campaign.user._id,
      activity: currentUser._id,
      campaign: campaign._id,
      notificationType: "campaignParticipation",
    });
    await participationNotification.save();

    await Campaign.findByIdAndUpdate(
      campaign._id,
      {
        $push: { updates: participationNotification._id },
      },
      { new: true }
    );
    updateCampaignInAlgolia(campaign._id);
    sendMessage(
      "campaignParticipation",
      participationMessage,
      campaign.user._id
    );

    return res.status(200).json({
      status: 200,
      message: "Successfully participated in the campaign.",
      success: true,
      data: savedVolunteer,
    });
  } catch (error) {
    console.error("Error in participateInCampaign:", error);
    return res.status(500).json({ message: error.message });
  }
};

//get the campaign that you are volunteer
exports.userVolunteersCompaign = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    // Aggregate to find participations of the user
    const userParticipations = await Volunteers.aggregate([
      {
        $match: { user: mongoose.Types.ObjectId(user._id) },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $lookup: {
          //participation form that have details about participation
          from: "campaignParticipation",
          localField: "participation",
          foreignField: "_id",
          as: "participationDetails",
        },
      },
      {
        $project: {
          _id: "$_id",
          campaign: "$campaign",
          participation: "$participationDetails",
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(pageSize, 10),
      },
    ]);

    return res.status(200).json(userParticipations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//send message to the campaign
exports.postMessages = async (req, res) => {
  try {
    let records = req.body;
    const { user } = req;
    records.sender = user;
    const message = new Message(records);
    const savedMessage = await message.save();
    sendMessage("campaignMessage", message, records.profile);
    return res.json({
      status: 200,
      message: "sent Message Successfully",
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    return res.json({
      status: 500,
      message: "Something Went wrong",
      success: false,
    });
  }
};

//get  Messages  between campaign creator and login user
exports.getMessages = async (req, res) => {
  try {
    const pid = req.user;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }
    const uid = campaign.user;
    let records = await Message.find({
      $or: [
        { sender: uid, profile: pid }, // Messages sent from uid to pid
        { sender: pid, profile: uid },
      ],
      $and: [
        { profile: { $exists: true, $ne: null } },
        { campaign: req.params.id },
      ],
    }).populate([
      {
        path: "sender",
        select: "_id first_name last_name email username profileImage", // Select specific fields
      },
      {
        path: "profile",
        select: "_id first_name last_name email username profileImage", // Select specific fields
      },
    ]);
    return res.json({
      status: 200,
      message: "messages records",
      success: true,
      data: records,
    });
  } catch (err) {
    return res.json({ status: 500, message: err, success: false });
  }
};

//add signPetitions
exports.signPetitions = async (req, res) => {
  try {
    const { petition, location } = req.body;

    // Check if the petition exists
    const petitionExists = await petitions.findById(petition);
    if (!petitionExists) {
      return res.status(404).json({
        status: 404,
        message: "Petition Not Exist",
        success: false,
      });
    }

    // Check if the petition is already signed by the user
    const alreadySigned = await SignedPetitions.findOne({
      user: req.user._id,
      petition,
    });
    if (alreadySigned) {
      return res.status(400).json({
        status: 400,
        message: "Petition already Signed",
        success: false,
      });
    }

    // Sign the petition
    const newSign = new SignedPetitions({
      user: req.user._id,
      petition,
      location,
    });
    await newSign.save();

    // Return success response
    return res.status(200).json({
      status: 200,
      message: "Petition Signed successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
};

//add impact video by Volunteers
exports.campaignImpactVideos = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { body, file: filedata, user, description } = req;

    //check is campaign exist or not
    const campaignDetails = await Campaign.findById(campaignId);
    if (!campaignDetails) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    const existingParticipation = await Volunteers.findOne({
      campaign: campaignId,
      user: user,
    });
    if (!existingParticipation) {
      return res
        .status(404)
        .json({
          message: "You are not participating in this campaign.",
          status: 404,
          success: false,
        });
    }
    //get user Details
    const currentUser = await User.findById(user);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const tags = await generateTags(body.description);
    // Upload video thumbnail
    const thumbnail = await uploadVideoThumbnail(req.file);
    // Upload video and get URL
    const videoUrl = await upload(req.file);
    // Save video details in the database
    const videos = new Video({
      user: user,
      location: JSON.parse(body.location),
      campaign: campaignId,
      description: body.description,
      video_url: videoUrl.encodedKey,
      type: "IMPACT",
      thumbnail_url: `thumbnail${thumbnail.key}`,
      hashtags: tags,
    });
    const savedVideo = await videos.save();
    addVideoInAlgolia(savedVideo._id);
    //Add Notification to Impact video
    const impactVideoMessage = `${currentUser.first_name} ${currentUser.last_name} added a Impact video in Campaign ${campaignDetails.title}`;
    const impactVideoNotification = new Notification({
      messages: impactVideoMessage,
      user: campaignDetails.user,
      activity: currentUser._id,
      campaign: campaignId,
      notificationType: "campaignImpactVideo",
    });
    //Update Campaign about it's impact and update
    await impactVideoNotification.save();
    await Campaign.findByIdAndUpdate(
      campaignId,
      {
        $push: {
          impacts: savedVideo._id,
          updates: impactVideoNotification._id,
        },
      },
      { new: true }
    );
    updateCampaignInAlgolia(campaignId);
    sendMessage(
      "campaignImpactVideo",
      impactVideoMessage,
      campaignDetails.user
    );
    return res.status(200).json({
      status: 200,
      message: "Campaign impact video added successfully.",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "An error occurred while adding the campaign impact video.",
      error: err.message,
      success: false,
    });
  }
};

//get Volunters based on Location, cause and filter on map
exports.volunteers = async (req, res) => {
  try {
    let pipline = [
      {
        $lookup: {
          from: "campaigns",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $unwind: "$campaign",
      },
      {
        $lookup: {
          from: "campaignParticipation",
          localField: "participation",
          foreignField: "_id",
          as: "participationDetails",
        },
      },
      {
        $unwind: "$participationDetails",
      },

      {
        $lookup: {
          from: "campaignVolunteers",
          localField: "campaign._id",
          foreignField: "campaign",
          as: "usersParticipated",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "usersParticipated.user",
          foreignField: "_id",
          as: "campaignParticipated",
        },
      },
    ];
    if (req.query.cause) {
      let causeToFilter = req.query.cause.toLowerCase();
      pipline.push({
        $match: {
          $expr: {
            $eq: [{ $toLower: "$campaign.cause" }, causeToFilter],
          },
        },
      });
    }
    if (req.query.location) {
      const query = [];
      const location = JSON.parse(decodeURIComponent(req.query.location));
      const longitude = parseFloat(location[0]);
      const latitude = parseFloat(location[1]);
      const coordinates = [longitude, latitude];
      const distance = 1; // in kilometers
      const unitValue = 1000; // 1 km in meters
      // Find users near the given location
      query.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates,
          },
          maxDistance: distance * unitValue,
          distanceField: "distance",
          spherical: true,
          key: "location",
        },
      });
      // Project to extract user IDs
      query.push({
        $project: {
          _id: 0,
          user: "$_id",
        },
      });
      const usersNearLocation = await CampaignParticipant.aggregate(query);
      const userIds = usersNearLocation.map((user) => user.user);
      const userParticipations = await Volunteers.aggregate([
        ...pipline,
        {
          $match: {
            "participation._id": { $in: userIds },
          },
        },
      ]);
      return res.status(200).json(userParticipations);
    }

    if (req.query.skill) {
      let skillToFilter = req.query.skill.toLowerCase();
      pipline.push({
        $match: {
          $expr: {
            $in: [
              skillToFilter,
              {
                $map: {
                  input: "$participationDetails.skills",
                  as: "skill",
                  in: { $toLower: "$$skill.skill" },
                },
              },
            ],
          },
        },
      });
    }
    pipline.push({
      $project: {
        _id: "$_id",
        campaign: "$campaign",
        participation: "$participationDetails",
        campaignVolunteers: {
          $map: {
            input: "$campaignParticipated",
            as: "volunteer",
            in: {
              first_name: "$$volunteer.first_name",
              last_name: "$$volunteer.last_name",
              username: "$$volunteer.username",
              profileImage: "$$volunteer.profileImage",
            },
          },
        },
      },
    });
    const userParticipations = await Volunteers.aggregate([...pipline]);
    return res.status(200).json(userParticipations);
  } catch (error) {
    console.error("Error retrieving participation and volunteers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//add user report
exports.report = async (req, res) => {
  try {
    const userId = req.user;
    let records = req.body;
    records.reportedBy=userId
    const report = new Report(records);
    const savedReports = await report.save();
    return res.json({
      status: 200,
      message: "Report added Successfully",
      success: false,
      data: savedReports,
    });
  } catch (err) {
    console.log("erris",err)
    return res.json({
      status: 500,
      message: "Something Went wrong",
      success: false,
    });
  }
};