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
    console.log("err", error);
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
          pipeline:[
            {
              $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
            }  
          ]
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
          from: "campaignPhase",
          localField: "phases",
          foreignField: "_id",
          as: "phases",
          pipeline:[
            {
              $lookup: {
                from: "campaignParticipation",
                localField: "_id",
                foreignField: "phaseId",
                as: "campaignVolunteering",
                pipeline:[
                    {
                      $lookup: {
                        from: "skills",
                        localField: "skills",
                        foreignField: "_id",
                        as: "skills",
                        pipeline:[
                          {
                            $project: { _id: 1 , name: 1 } 
                          }
                        ]
                      }
                    },
                    {
                      $project: { requirements: 0 , provides: 0,karmaPoint: 0, phaseId: 0, responsibilities: 0 } 
   
                    }
                  ]
              },
            },
            { 
              $lookup: {
                from: "campaignVolunteers",
                localField: "participation",
                foreignField: "participation",
                as: "volunteers",
                pipeline:[
                  {
                    $match: {
                      approved: true
                    }
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "user",
                      pipeline:[
                        {
                          $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
                        }
                      ]
                    },

                  },
                  { $project: { _id: 1 , user:1 } }
                  ]
              },
            },
            {
              $lookup: {
                from: "campaignSignedPetition",
                localField: "petition",
                foreignField: "petition",
                as: "signendPetitions",
                pipeline:[
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "user",
                      pipeline:[
                        {
                          $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
                        }
                      ]
                    },

                  },
                  { $project: { _id: 1 , user:1 } }
                  ]
              }
            },
            {
              $lookup: {
                from: "campaignDonation",
                localField: "_id",
                foreignField: "phaseId",
                as: "donation",
                pipeline:[
                  {
                    $project: { karmaPoint: 0 , phaseId:0, updatedAt:0, __v:0 } 
                  }
                ]
              }
            },
            {
              $lookup: {
                from: "campaignPetition",
                localField: "_id",
                foreignField: "phaseId",
                as: "petition",
                pipeline:[
                  {
                    $project: { karmaPoint: 0 , phaseId:0, updatedAt:0, __v:0 } 
                  }
                ]
              },
            },
            {
              $lookup: {
                from: "campaignDonated",
                localField: "campaignDonationId",
                foreignField: "donation",
                as: "donated",
                pipeline:[
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "donatedBy",
                      pipeline:[
                        {
                          $project: { _id: 1 , first_name:1, last_name:1, username:1,profileImage:1 } 
                        }  
                      ]
                    },    
                 
                  },
                    {$project: { amount: 1 , donatedBy:1 }}
                ]
              },
            },
            {
              $addFields: {
                totalDonatedAmount: { $sum: "$donated.amount" }
              }
            },
            {
              $project: { _id: 1 , title: 1, donation: 1, createdAt: 1, volunteers: 1, signendPetitions: 1, campaignVolunteering:1, donated: 1, totalDonatedAmount:1,petition:1 }
            }
          ]

        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline:[
            {
              $project: { _id: 1 , video_url: 1, thumbnail_url: 1, title: 1,likes: 1, comments: 1  } 
            }
          ]
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
      {
        $project: { hashtags: 0 , algolia: 0, updatedAt: 0, _v: 0 } 
      }
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
    const userId=req.user
    const data = req.body;
    const tags = await generateTags(data.title);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 400,
        error: "Invalid User ID format",
        success: false,
      });
    }
    const auth = await User.findById({ _id: userId });
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
      user:  userId,
      cause: data.cause,
      title: data.title,
      story: data.story,
      image: data.image,
      location: data.location,
      address: data.address
    });
    const campaigns = await campaign.save();
    
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
    if (campaignTag?.length > 0){
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
      user: userId,
      campaign: campaignsId,
      description: req.body.campaignStory,
      title: req.body.title,
      video_url: req.body.video.videoUrl,
      type: req.body.video.type,
      thumbnail_url: req.body.video.thumbnailUrl,
      hashtags: tagsArray,
    });
    const savedVideo = await videos.save();
    const videoId = savedVideo._id;
    const savePhaseId = [];
    const phaseArr = data.phase;
    //update Records in Algolia
    await addVideoInAlgolia(savedVideo._id);
    await addVideoInAlgolia(videoId);
    await addCampaignInAlgolia(campaigns._id);
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
  
      donationCount[0].phaseId = savePhaseId[i];//update donation payload with phaseId
      const petitionData = Action.filter((item) => item?.name == "petition");
      
      petitionData[0].phaseId = savePhaseId[i]; ////update petition payload with phaseId
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
      //save campaignPhases
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
      //update Campaign  
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
    let karmaPoint
    // Find the donation action added within campaign phase
    const campaignDonation = await donation.findById(donationId);
    if (!campaignDonation) {
      return res.status(404).json({ message: "Campaign donation not found" });
    }
    if(campaignDonation.karmaPoint)
    {
       karmaUnit=parseInt(campaignDonation.karmaPoint)
       karmaPoint=parseInt(req.body.amount)/karmaUnit 
    }
    else{
      karmaPoint=parseInt(req.body.amount)/10
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

    const stripeToken = req.body.source;
    const charge = await stripe.charges.create({
      amount: parseInt(req.body.amount * 100), // Amount in cents
      currency: "usd",
      card:stripeToken,
      description: req.body.description,
    });


    // Handle the charge response
    if (charge.status === "succeeded") {
      let campaignDonation = new Donated({
        user: userId,
        amount: req.body.amount,
        chargeId: charge.id,
        campaignDonationId: donationId,
        currency: charge.currency,
        created: new Date(charge.created * 1000), 
        paymentMethod: {
          brand: charge.payment_method_details.card.brand,
          expMonth: charge.payment_method_details.card.exp_month,
          expYear: charge.payment_method_details.card.exp_year,
          last4: charge.payment_method_details.card.last4
        },
        receiptUrl: charge.receipt_url,
        customerId: charge.customer,
        balanceTransactionId: charge.balance_transaction
      });
      await campaignDonation.save();
      user.karmaPoint += karmaPoint;
      await user.save();

      // Add notification to user who made doanation about karma points
      const karmaMessage = `You received +100 karma points for participating in the campaign ${campaign.title}`;
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
        message: "campaign Donation SuccessFully",
        receiptUrl:  charge.receipt_url,
        success: true,
      });
    } else {
      return res.status(400).json({ message: "Payment failed" });
    }
  } catch (err) {
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
    //check is participation exist or not
    const participant = await CampaignParticipant.findById(participationId);
    if (!participant) {
      return res.status(404).json({status:404, message: "Participant not found."});
    }
    const {phaseId}=participant
    // Find the campaign
    const campaign = await Campaign.findById(campaignId).populate({
      path: "user",
      populate: { path: "user", model: User },
    });

    if (!campaign) {
      return res.status(404).json({status:404, message: "Campaign not found." });
    }
    const {phases}=campaign
    if(!phases.includes(phaseId))
    {
      return res.status(404).json({ message: "Invalid campaign: campaign does not correspond to the participation" });

    }
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
    // Update Karma Points for the user's profile
    const currentUser = await User.findById(user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create a new participation record
    const newVolunteer = new Volunteers({
      user: user._id,
      campaign: campaign._id,
      participation: participationId,
    });
    const savedVolunteer = await newVolunteer.save();
    //update user Karma Point
    currentUser.karmaPoint += 50;
    await currentUser.save();
    updateUsersInAlgolia(user._id);
    // message to the  current user about notification for karma points
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

    // Add notification to campaign Admin about campaign participation 
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
    const appliedVolunteers= await Volunteers.find({user:user}).select('campaign')
    // get Volunter Id to find the campaign that user not volunteered yet
    const volunteeredCampaignIds = appliedVolunteers.map(volunteer => volunteer.campaign.toString());
   // get  petition to find the campaign that user Signed but not volunteered

    const campaignPetitions= await SignedPetitions.aggregate([
      {
        $match: {user: user}
      },
      {
        $lookup: {
          from: "campaignPetition",
          localField: "petition",
          foreignField: "_id",
          as: "campaignPetition",
        },
      },
      {
        $unwind: "$campaignPetition",
      },
      {
        $lookup: {
          from: "campaignPhase",
          localField: "campaignPetition.phaseId",
          foreignField: "_id",
          as: "campaign",
          pipeline:[
            {$project: {campaign:1 }}
          ]

        },
      },
      {$project: {campaign:'$campaign.campaign'}}
    ])
    // Flatten the nested campaign array and convert to strings
    const signedPetitionsCampaignIds = campaignPetitions.map(petition => petition.campaign.toString());
    // Filter the campaigns
    const recommendedCampaign = signedPetitionsCampaignIds.filter(element => !volunteeredCampaignIds.includes(element));
    const userParticipations = await Campaign.aggregate([
      {
        $match: { _id: { $nin: volunteeredCampaignIds.map(id => mongoose.Types.ObjectId(id)) } }
      },
      {
        $addFields: {
          sortIndex: {
            $indexOfArray: [recommendedCampaign.map(id => mongoose.Types.ObjectId(id)), '$_id']
          }
        }
      },
      {
        $sort: {
          sortIndex: -1 
        }
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
      message: "Message sent successfully.",
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    return res.json({
      status: 500,
      message: "Internal server error",
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
      message: "Message records retrieved successfully.",
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
    const { petition, location, address } = req.body;

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
      address,
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
      address: body.address,
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
    let pipeline = [
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
      pipeline.push({
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
          particiapation: "$_id",
        },
      });
      const usersNearLocation = await CampaignParticipant.aggregate(query);
      const userIds = usersNearLocation.map((particiapation) => particiapation.particiapation);
      pipeline.push({
          $match: {
            "participation": { $in: userIds },
          }
      })
    }

    if (req.query.skill) {
      let skillToFilter = req.query.skill.toLowerCase();
      pipeline.push({
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
    pipeline.push({
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
    const userParticipations = await Volunteers.aggregate([...pipeline]);
    if(userParticipations.length==0)
    {
      return res.status(200).json({status: 200,message: "No Volunteers records found", data: userParticipations, success: false});

    }
    return res.status(200).json({status: 200,message: "Volunteers records retrieved successfully.", data: userParticipations, success: true});
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

//add feature to approve participation request by admin
exports.approveParticipant= async (req, res)=>{
 try{
  const user=req.user
  const {campaignId,appliedParticipationId}=req.params
  const campaign = await Campaign.find({_id: campaignId,user: user});
  //check is campainId Valid or Not
  if (!campaign) {
    return res.status(404).json({ message: "You are Not Authorize to this campaign" });
    }
  const volunteers=  await Volunteers.findByIdAndUpdate(
      {_id: appliedParticipationId},
      {
        $set: {
          approved: true,
        },
      },
      { new: true }
    )    
    const approvedMessages = `You were approved for volunteering`;
    sendMessage("approvedMessage", approvedMessages, volunteers.user);
    if (!volunteers) {
      return res.status(404).json({ message: "Invalid participation applied Id" });
      }
  }
  catch(err)
  {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: err.message,
      success: false,
    });
  }
}

//get participation history
exports.participationHistory=async (req, res)=>{
  try{
    const user=req.user
    const volunteer=await Volunteers.aggregate([
      { $match: { user: mongoose.Types.ObjectId(user) } },
      {
        $lookup: {
          from: "campaignParticipation",
          localField: "participation",
          foreignField: "_id",
          as: "volunteering",
          pipeline:[
            {
              $project: { _id: 1 , location: 1 ,roleTitle: 1, participant: 1, description: 1 } 
            }  
          ]
        },
      },
      {
        $project:{_id:1, approved:1, campaign: 1, volunteering:1, createdAt: 1}
      }


    ])
    if(volunteer.length>0)
    {
      return res.json({
        status: 200,
        message: "Participation records retrieved successfully.",
        success: true,
        data: volunteer,
      });  
    }
    else{
      return res.json({
        status: 400,
        message: "Participation records Not found",
        success: false,
        data: volunteer,
      });   
    }
  }
  catch(err)
  {
    return res.json({ status: 500, message: err, success: false });

  }
}