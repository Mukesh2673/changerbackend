require("dotenv").config();
const {
  Campaign,
  CampaignVolunteering,
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
const { addCampaignInAlgolia, updateCampaignInAlgolia} = require("../algolia/campaignAlgolia");
const {campaigncommonPipeline, campignIdDonationPipeline, campignIdPetitionPipeline} =require("../constants/commonAggregations")

//get all Campaign
exports.showCampaigns = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query; 
    const pipline=[...campaigncommonPipeline,
      {
        $project: { hashtags: 0 , algolia: 0, updatedAt: 0, _v: 0 } 
      },
      { $sample: { size: parseInt(pageSize) } },
      { $skip: (parseInt(page) - 1) * parseInt(pageSize) },
      { $limit: parseInt(pageSize) }
    ]
    const  campaign = await Campaign.aggregate(pipline);
    if(campaign.length > 0)
    {
      const totalRecords = await Campaign.countDocuments();
      return res.json({ message: res.__("CAMPAIGN_RECORDS_MESSAGE"), data: campaign,  totalPage: Math.ceil(totalRecords / pageSize), status: 200});
    }
    else{
      return res.status(404).json({ message:res.__("CAMPAIGN_NOT_FOUND"),status:200 });

    }

  } catch (error) {
    console.log("err", error);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};

//get Campaing by Id
exports.showCampaign = async (req, res) => {
  try {
    const id= req.params.campaignId
    let pipeLine=campaigncommonPipeline
    pipeLine.unshift({ $match: { _id: mongoose.Types.ObjectId(id) }});
    pipeLine.push({$project: { hashtags: 0 , algolia: 0, updatedAt: 0, _v: 0 } });
    const campaign = await Campaign.aggregate(pipeLine);
    if (campaign.length > 0) {
      return res.json({ message: res.__("CAMPAIGN_RECORDS_MESSAGE"), data: campaign, status: 200});
    } else {
      return res.status(404).json({ message:res.__("CAMPAIGN_NOT_FOUND"), status:400,success: false });
    }
  } catch (error) {
    console.error("Error in showCampaign:", error);
    return res.status(500).json({ message: error.message });
  }
};

//trendingCampaign
exports.trendingCampaigns = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query; 
    const pipeline=[...campaigncommonPipeline,
      {
        $project: { hashtags: 0 , algolia: 0, updatedAt: 0, _v: 0 } 
      },
      { $sample: { size: parseInt(pageSize) } },
      { $skip: (parseInt(page) - 1) * parseInt(pageSize) },
      { $limit: parseInt(pageSize) }
    ]
    const campaign = await Campaign.aggregate(pipeline);
    if (campaign.length > 0) {
      const totalRecords = await Campaign.countDocuments();
      return res.json({ message: res.__("TRENDING_CAMPAIGN_RECORDS_MESSAGE"),data: campaign,  totalPage: Math.ceil(totalRecords / pageSize), status: 200});
    } else {
      return res.status(404).json({ message:  res.__("CAMPAIGN_NOT_FOUND") ,status:200 });
    }
  } catch (error) {
    console.error("Error in showCampaign:", error);
    return res.status(500).json({ message: error.message });
  }
};

//recommand the campaign based on users interested  cause in issue and user profile
exports.campaignForUser = async (req, res) => {
  try {
    const userId=req.user
    const { page = 1, pageSize = 10 } = req.query; 
    const auth = await User.findById({ _id: userId });
    let cause=[]
    if(auth)
    {
      let causeFromUser=auth.cause.map(item=>item.name)
      cause=causeFromUser.length>0?causeFromUser:[]
    }
    const issue= await Issue.find({ joined: { $in: [mongoose.Types.ObjectId(userId)] } })
    if(issue?.length>0)
    {
     causeFromIssue=issue.map(item=>item.cause)
     cause=causeFromIssue.length>0?[...cause,...causeFromIssue]:cause

    }
    //merge the cause from user profile and issue that he joined
    const commonCause=[...new Set([...cause])]
    //collect the campign Id that user  participated
    campignIdDonationPipeline.unshift({$match:{user: userId}})
    campignIdPetitionPipeline.unshift({$match:{user: userId}})
    const signedPetitions=await SignedPetitions.aggregate(campignIdPetitionPipeline)
    const appliedVolunteers= await Volunteers.find({user: userId, approved: true}).select('campaign')
    const donatedCampaign=await Donated.aggregate(campignIdDonationPipeline)
    const volunteersCampaignIDs=appliedVolunteers.map(volunteer => volunteer.campaign.toString());
    const signedPetitionsCampaignIds = signedPetitions.map(petition => petition.campaign.toString());
    const donationCampaignId=donatedCampaign.map(donation => donation.campaign.toString());
    const campaignParticipationId=[...new Set([...volunteersCampaignIDs,...signedPetitionsCampaignIds,...donationCampaignId])] 
    let pipeLine=campaigncommonPipeline
    if(cause.length>0)
    {
      pipeLine=[...campaigncommonPipeline,
        {
          $addFields: {
            sortKey: {
              $indexOfArray: [commonCause, "$cause"]
            }
          }
        },
        {
          $sort: { sortKey: -1 }
        },
      ]
    }
    //extract the campaign that user already participated
    pipeLine.unshift( {
      $match: { _id: { $nin: campaignParticipationId.map(id=> mongoose.Types.ObjectId(id))} }
    },)
    pipeLine.push({
    $project: { hashtags: 0 , algolia: 0, updatedAt: 0, _v: 0, sortKey:0} 
  },
  { $skip: (parseInt(page) - 1) * parseInt(pageSize) },
  { $limit: parseInt(pageSize) }
  )
  //create pipe line seperatly using $facet  
  const campaign = await Campaign.aggregate([
      {
        $facet: {
          paginatedResults: pipeLine,
          totalCount: [
            {
              $match: { _id: { $nin: campaignParticipationId.map(id => mongoose.Types.ObjectId(id)) } }
            },
            { $count: "count" }
          ]
        }
      }
    ]);
    const totalRecords=campaign[0].totalCount[0].count
    const campignRecords=campaign[0].paginatedResults
    if(campignRecords.length>0)
    {
      return res.json({ message:  res.__("CAMPAIGN_RECORDS_MESSAGE"),data: campignRecords,  totalPage: Math.ceil(totalRecords / pageSize), status: 200});

    }
    else{
      return res.json({ message:res.__("CAMPAIGN_NOT_FOUND"),data: campignRecords,  totalPage: Math.ceil(totalRecords / pageSize), status: 400});

    }
  } catch (error) {
    console.error("Error in showCampaign:", error);
    return res.status(500).json({ message: error.message });
  }
};

//create a campaign
exports.create = async (req, res) => {
  try {
    const userId=req.user
    const data = req.body;
    const tags = await generateTags(data.title);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: 400, error: "Invalid User ID format", success: false,
});
    }
    const auth = await User.findById({ _id: userId });
    if (!auth) {
      return res.json({
        status: 401,
        message:  res.__("INVALID_USER"),
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
          error: res.__("INVALID__ISSUE_ID_FORMAT"),
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
      location: req.body.location,
    });
    const savedVideo = await videos.save();
    const videoId = savedVideo._id;
    const savePhaseId = [];
    const phaseArr = data.phase;

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
      
      const volunteeringIds = [];
      const location = [];
      for (let j = 0; j < participation.length; j++) {
        participation[j].phaseId = savePhaseId[i];
        const participant = new CampaignVolunteering(participation[j]);
        const savedParticipant = await participant.save();
        let id = savedParticipant._id;
        let geoLocation = {
          lat: parseFloat(savedParticipant.location.coordinates[0]),
          lng: parseFloat(savedParticipant.location.coordinates[1]),
        };
        location.push(geoLocation);
        volunteeringIds.push(id);
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
            volunteering: volunteeringIds,
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
    }
    //add Records in Algolia
    await Promise.all([
      addCampaignInAlgolia(campaigns._id),
      addVideoInAlgolia(videoId),
      updateUsersInAlgolia(auth._id)
    ]);

    let records = await Campaign.findById(campaignsId);
    const message = `You received +100 karma Point for good intention of creating Campaign ${data.title}`;
    const notification = new Notification({
      messages: message,
      user: auth._id,
      campaign: campaignsId,
      notificationType: "karmaPoint",
    });
    sendMessage("karmaPoint", message, auth._id);
    await notification.save();
    return res.json({
      status: 200,
      message:  res.__("CAMPAIGN_ADDED_MESSAGE"),
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
      return res.status(404).json({ message:  res.__("DONATION_NOT_FOUND") });
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
        .json({ message:  res.__("DONATION_PHASE_NOT_FOUND") });
    }

    // check is campaign phase exist in campaign
    const campaign = await Campaign.findOne({
      phases: { $in: [mongoose.Types.ObjectId(campaignPhase._id)] },
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ message: res.__("DONATION_CAMPAIGN_NOT_FOUND")});
    }

    // Find the user and update karma points
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: res.__("INVALID_USER") });
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
        message:  res.__("DONATED_MESSAGE"),
        receiptUrl:  charge.receipt_url,
        success: true,
      });
    } else {
      return res.status(400).json({ message: res.__("DONATION_FAILED") });
    }
  } catch (err) {
    if (err.type === "StripeCardError") {
      return res.status(401).json({ message: res.__("CARD_ERROR") });
    }
    return res.status(500).json({ message: err.message });
  }
};

//get the campaign that you are volunteer
exports.volunteeringForUser = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, pageSize = 10 } = req.query;
    // Aggregate to find participations of the user
    const appliedVolunteers= await Volunteers.find({user: user, approved: true}).select('campaign')
    // get Volunter Id to find the campaign that user not volunteered yet
    const volunteeredCampaignIds = appliedVolunteers.map(volunteer => volunteer.campaign.toString());
    //collect the campign Id that user  participated
    campignIdPetitionPipeline.unshift({$match:{user: user}})
    campignIdDonationPipeline.unshift({$match:{user: user}})
    const signedPetitions= await SignedPetitions.aggregate(campignIdPetitionPipeline)
    const donatedCampaign=await Donated.aggregate(campignIdDonationPipeline)
    const signedPetitionsCampaignIds = signedPetitions.map(petition => petition.campaign.toString());
    const donationCampaignId=donatedCampaign.map(donation => donation.campaign.toString());
    const particiapationCampaignId=[...new Set([...signedPetitionsCampaignIds,...donationCampaignId])] 
    // Filter the campaigns by extract the volunteers ID from participation Id
    const recommendedCampaign = particiapationCampaignId.filter(element => !volunteeredCampaignIds.includes(element));
    const pipeLine=campaigncommonPipeline
    pipeLine.unshift({
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
    })
    pipeLine.push({
      $project: { hashtags: 0 , algolia: 0, updatedAt: 0, _v: 0, sortKey:0} 
    },
    { $skip: (parseInt(page) - 1) * parseInt(pageSize) },
    { $limit: parseInt(pageSize) })
    //const userParticipations = await Campaign.aggregate(pipeLine);
    const volunteeringRecords = await Campaign.aggregate([
      {
        $facet: {
          paginatedResults: pipeLine,
          totalCount: [
            {
              $match: { _id: { $nin: volunteeredCampaignIds.map(id => mongoose.Types.ObjectId(id)) } }
            },
            { $count: "count" }
          ]
        }
      }
    ]);
    const totalRecords=volunteeringRecords[0].totalCount[0].count
    const records=volunteeringRecords[0].paginatedResults
    if(records.length>0)
    {
      return res.json({ message: res.__("CAMPAIGN_RECORDS_MESSAGE"), data: records,  totalPage: Math.ceil(totalRecords / pageSize), status: 200});
    }
    else{
      return res.json({ message:  res.__("CAMPAIGN_NOT_FOUND"),data: records,  totalPage: Math.ceil(totalRecords / pageSize), status: 400});
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//send message to the campaign
exports.postMessages = async (req, res) => {
  try {
    let records = req.body;
    const { user } = req;
    const campaignId = req.params.campaignId;
    records.campaign=campaignId;
    records.sender = user;
    const message = new Message(records);
    const savedMessage = await message.save();
    sendMessage("campaignMessage", message, records.profile);
    return res.json({
      status: 200,
      message: res.__("CAMPAIGN_MESSAGE_SENT"),
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    return res.json({
      status: 500,
      message: res.__("SERVER_ERROR"),
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
      return res.status(404).json({ message: res.__("INVALID_CAMPAIGN") });
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
      message:  res.__("MESSAGE_RECORDS_SUCCESS"),
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
        message: res.__("PETITION_NOT_EXIST"),
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
        message: res.__("PETITION_SIGNED"),
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
      message:  res.__("PETITION_SIGNED_MESSAGE"),
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: res.__("SERVER_ERROR"),
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
      return res.status(404).json({ message: res.__("SERVER_ERROR") });
    }

    const existingParticipation = await Volunteers.findOne({
      campaign: campaignId,
      user: user,
    });
    if (!existingParticipation) {
      return res
        .status(404)
        .json({
          message: res.__("NOT_PARTICIPATED_CAMPAIGN"),
          status: 404,
          success: false,
        });
    }
    //get user Details
    const currentUser = await User.findById(user);
    if (!currentUser) {
      return res.status(404).json({ message: res.__("INVALID_USER") });
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
      message:  res.__("CAMPAIGN_IMPACT_SUCCESS"),
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message:  res.__("CAMPAIGN_IMPACT_ERROR"),
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
          from: "campaignVolunteers",
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
      const usersNearLocation = await CampaignVolunteering.aggregate(query);
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
      return res.status(200).json({status: 200,message:  res.__("NO_VOLUNTEERS"), data: userParticipations, success: false});

    }
    return res.status(200).json({status: 200,message:  res.__("VOLUNTEERS_RECORDS_MESSAGE"), data: userParticipations, success: true});
  } catch (error) {
    console.error("Error retrieving participation and volunteers:", error);
    return res.status(500).json({ error:res.__("VOLUNTEERS_RECORDS_MESSAGE") });
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
      message: res.__("REPORT_ADDED"),
      success: false,
      data: savedReports,
    });
  } catch (err) {
    console.log("erris",err)
    return res.json({
      status: 500,
      message:  res.__("SERVER_ERROR"),
      success: false,
    });
  }
};

//apply for Volunteers to campaign
exports.applyForVolunteers = async (req, res) => {
  try {
    const { user } = req;
    const { campaignId, volunteeringId } = req.params;
    //check is volunteering exist or not
    const volunteering = await CampaignVolunteering.findById(volunteeringId);
    
    if (!volunteering) {
      return res.status(404).json({status:404, message: "Participant not found."});
    }
    const {phaseId}=volunteering
    // Find the campaign
    const campaign = await Campaign.findById(campaignId).populate({
      path: "user",
      populate: { path: "user", model: User },
    });

    if (!campaign) {
      return res.status(404).json({status:404, message: res.__("INVALID_CAMPAIGN")});
    }
    const {phases}=campaign
    if(!phases.includes(phaseId))
    {
      return res.status(404).json({ message: res.__("PARTICIPATION_INVALID_CAMPAIGN"),status:400,success:false });

    }
    // Check if the user is already volunteers
     const existingVolunteers = await Volunteers.findOne({
      campaign: campaign._id,
      user: user._id,
      volunteering: volunteeringId,
    });

    if (existingVolunteers) {
      return res
        .status(422)
        .json({ message: res.__("EXISTING_VOLUNTEERS_MESSAGE")});
    }
    // Update Karma Points for the user's profile
    const currentUser = await User.findById(user._id);
    if (!currentUser) {
      return res.status(404).json({ message:  res.__("INVALID_USER") });
    }

    // Create a new participation record
    const newVolunteer = new Volunteers({
      user: user._id,
      campaign: campaign._id,
      volunteering: volunteeringId,
    });
    const savedVolunteer = await newVolunteer.save();

    // Add notification to campaign Admin about campaign volunteers 
    const volunteerMessage = `${currentUser.first_name} ${currentUser.last_name} apply for the  volunteers in the campaign ${campaign.title}`;
    const volunteerNotification = new Notification({
      messages: volunteerMessage,
      user: campaign.user._id,
      activity: currentUser._id,
      campaign: campaign._id,
      notificationType: "campaignVolunteering",
    });
    await volunteerNotification.save();
    sendMessage("campaignVolunteering", volunteerMessage, campaign.user._id);
    return res.status(200).json({
      status: 200,
      message:  res.__("PARTICIPATED_CAMPAIGN"),
      success: true,
      data: savedVolunteer,
    });
  } catch (error) {
    console.error("Error in participateInCampaign:", error);
    return res.status(500).json({ message: error.message });
  }
};

//approve Volunteer by campaign Admin 
exports.approveVolunteers= async (req, res)=>{
 try{
  const user=req.user
  const {campaignId,volunteerId}=req.params
  const campaign = await Campaign.find({_id: campaignId,user: user});
  //check is campainId Valid or Not
  if (campaign.length==0){
    return res.status(404).json({ message:  res.__("NOT_AUTHORIZE_CAMPAIGN") });
    }
  const volunteer = await Volunteers.findById(volunteerId);
  if (!volunteer) {
    return res.status(404).json({ message:  res.__("INVALID_PARTICIPATION") });
  }
  if (volunteer.approved === false) {
  volunteer.approved = true;
  await volunteer.save();

  // Send the approved message
  const approvedMessage = `You were approved for volunteering`;
  sendMessage("approvedMessage", approvedMessage, volunteer.user);
  //update User Karma Point to Approved participation
  const currentUser = await User.findById(volunteer.user);
  if (!currentUser) {
    return res.status(404).json({ message: "User not found." });
  }
  currentUser.karmaPoint += 50;
  await currentUser.save();
  updateUsersInAlgolia(volunteer.user);
  // send Notification to User about Karma Point
  const karmaMessage = `You have been approved as a volunteer and received +50 karma points for participating in the campaign ${campaign.title}.`;
  const karmaNotification = new Notification({
    messages: karmaMessage,
    user: currentUser._id,
    activity: user,
    campaign: volunteer.campaign,
    notificationType: "karmaPoint",
  });
  await karmaNotification.save();
  sendMessage("karmaPoint", karmaMessage, currentUser._id);
  
  //update campaign about karma Point
  const volunteerMessage = `${currentUser.first_name} ${currentUser.last_name} is a volunteers in the campaign ${campaign.title}`;
  const volunteerNotification = new Notification({
    messages: volunteerMessage,
    user: user,
    activity: currentUser._id,
    campaign:campaignId,
    notificationType: "campaignVolunteers",
  });
  await volunteerNotification.save();
  await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $push: { updates: volunteerNotification._id },
    },
    { new: true }
  );
  await updateCampaignInAlgolia(campaignId);
  sendMessage(
    "campaignVolunteers",
    volunteerMessage,
    user
    );
  return res.status(200).json({ message:  res.__("VOLUNTEER_APPROVED_MESSAGE"), status:200, success: true });
} else {

  return res.status(400).json({ message: res.__("VOLUNTEER_ALREADY_APPROVED") , status:400, success: false});
}    
  }
  catch(err)
  {
    return res.status(500).json({
      status: 500,
      message:  res.__("SERVER_ERROR"),
      error: err.message,
      success: false,
    });
  }
}

//get volunteers participation history
exports.volunteerParticipationHistory=async (req, res)=>{
  try{
    const user=req.user
    const volunteer=await Volunteers.aggregate([
      { $match: { user: mongoose.Types.ObjectId(user) } },
      {
        $lookup: {
          from: "campaignVolunteers",
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
        message:  res.__("PARTICIPATION_RECORDS_MESSAGE"),
        success: true,
        data: volunteer,
      });  
    }
    else{
      return res.json({
        status: 400,
        message:  res.__("PARTICIPATION_RECORDS_NOT_FOUND"),
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

//share the campaign
exports.shareCampaign = async(req, res)=>{
  try {
    const uid =req.user
    const campaignId=req.params.campaignId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ status: 400, error: "Invalid campaign id format", success: false,
     })}
    const isExist= await Campaign.find({_id: campaignId })  
    if (isExist) {
      const shared = isExist[0].shared;
      let exist = shared.includes(uid);
      if (exist) {
        return res.json({
          status: 200,
          message:  res.__("CAMPAIGN_SHARED"),
          success: true,
        });
      } else {
        const campaign = await Campaign.findByIdAndUpdate(
          { _id: campaignId },
          { $push: { shared: uid } },

          { new: true }
        );
        await updateCampaignInAlgolia(campaignId)     
        return res.json({
          status: 200,
          message:res.__("CAMPAIGN_SHARED"),
          success: true,
          data: campaign,
        });
      }
    } else {
      return res.json({
        status: 500,
        message: res.__("INVALID_ISSUE"),
        success: false,
      });
    }
  } catch (err) {
    console.log('uerrror',err)
    return res.json({
      status: 500,
      message: res.__("SERVER_ERROR"),
      success: false,
    });
  }
} 