const {Campaign} = require("../models");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  findObjectById,
} = require("../libs/algolia");

const mongoose = require("mongoose");
const campaignRecords = async (id) => {
  try {
    const aggregationPipeline = [
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
          from: "campaignPhase",
          localField: "phases",
          foreignField: "_id",
          as: "phases",
          pipeline: [
            {
              $lookup: {
                from: "campaignDonation",
                localField: "donation",
                foreignField: "_id",
                as: "donation",
              },
            },
            {
              $unwind: { path: "$donation", preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: "campaignPetition",
                localField: "petition",
                foreignField: "_id",
                as: "petition",
              },
            },
            {
              $unwind: { path: "$petition", preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: "campaignVolunteers",
                localField: "participation",
                foreignField: "_id",
                as: "participation",
              },
            },
          ],
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
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            }]
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
    ];
    // Run the aggregation
    return await Campaign.aggregate(aggregationPipeline);
  } catch (err) {
    console.log("value of err is", err);
  }
};

exports.updateCampaignInAlgolia = async (id) => {
  try {
    
    let records = await campaignRecords(id);
    const campaign = records[0];
    const algoliaObjectId = campaign?.algolia;
    let searchAlgo = []
    if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "campaigns");
    }
    else{
      let filtercampaignAlgolia = { search: id, type: "campaigns" };
      searchAlgo = await searchAlgolia(filtercampaignAlgolia);
    }
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == campaign?._id) {
      const campaignAlgoId = searchAlgo[0].objectID;
      const algoliaObject = {
        objectID: campaignAlgoId,
        title: campaign?.title,
        story: campaign?.story,
        cause: campaign?.cause,
        user: campaign?.user,
        image: campaign?.image,
        video: campaign?.video
          ? {
             _id: campaign?.video?.video?._id,
             user: campaign?.video?.user,
             title:  campaign?.video?.title,
             videoUrl:  campaign?.video?.video_url,
             type:  campaign?.video?.type   
          }:[],        
        impacts:
          campaign?.impacts?.length > 0
            ? campaign.impacts.map((impact) => ({
                _id: impact?._id,
                description: impact?.description,
                videoUrl: impact?.video_url,
                type: impact?.type,
                thumbnailUrl: impact?.thumbnail_url,
                impactHashtags: impact?.hashtags,
                user: impact?.user?.length>0?
                {
                  _id: impact?.user[0]?._id,
                  bio: impact?.user[0]?.bio,
                  firstName: impact?.user[0]?.firstName,
                  lastName: impact?.user[0]?.lastName,
                  profileImage: impact?.user[0]?.profileImage
                }:
                null
              }))
            : [],
        _geoloc: campaign?._geoloc,
        _id: campaign?._id,
        hashtags: campaign?.hashtags,
        updates:
          campaign?.updates?.length > 0
            ? campaign.updates.map((update) => ({
                _id: update?._id,
                messages: update?.message,
                notificationType: update?.notificationType,
                messages: update?.messages,
              }))
            : [],
        phases:
          campaign.phases?.length > 0
            ? campaign.phases.map((phase) => ({
                _id: phase._id,
                title: phase.title,
                donation: phase.donation
                  ? {
                      _id: phase.donation._id,
                      name: phase.donation.name,
                      amount: phase.donation.amount,
                      description: phase.donation.description,
                      karmaPoint: phase.donation.karmaPoint,
                    }
                  : null,
                petition: phase.petition
                  ? {
                      _id: phase.petition._id,
                      name: phase.petition?.name,
                      signature: phase.petition.signature,
                      description: phase.petition.description,
                      karmaPoint: phase.petition.karmaPoint,
                    }
                  : null,
                participation: phase.participation.map((participant) => ({
                  _id: participant?._id,
                  participant: participant?.participant,
                  location: participant?.location,
                  roleTitle: participant?.roleTitle,
                  description: participant?.description,
                  workplaceType: participant?.workplaceType,
                  startdate: participant?.startdate,
                  numberofDays: participant?.numberofDays,
                  time: participant?.time,
                  responsibilities: participant?.responsibilities,
                  skills: participant?.skills,
                  requirements: participant?.requirements,
                  provides: participant?.provides,
                  karmaPoint: participant?.karmaPoint,
                })),
              }))
            : [],
        advocate:
            campaign?.advocate?.length > 0
              ? campaign.advocate.map((advocate) => ({
                  _id: advocate?._id,
                  location: advocate?.location,
                  title: advocate?.title,
                  description: advocate?.description,
                }))
              : [],    
      };
      await updateAlgolia(algoliaObject, "campaigns");
      if (!algoliaObjectId) {
      await Campaign.updateOne({ _id: id }, { algolia:  searchAlgo[0].objectID });
      }
      return true;
    } else {
      let obj=await saveAlgolia(records, "campaigns");
      let objectID = obj.objectIDs[0];
      await Campaign.updateOne({ _id: id }, { algolia: objectID });
      return false;
    }
  } catch (err) {
    console.log("value of errr is=>>>>>", err);
    return false;
  }
};

exports.addCampaignInAlgolia = async (id) => {
  try {
    let records = await campaignRecords(id);
    const campaign = records[0];
    await saveAlgolia(campaign, "campaigns");
    return true;
  } catch (err) {
    return false;
  }
};
