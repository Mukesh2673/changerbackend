const {
  saveAlgolia,
  searchAlgolia,
  updateAlgolia,
} = require("../libs/algolia");
const { User, Video, Impact, Campaign } = require("../models");
const mongoose = require("mongoose");
require("dotenv").config();

exports.index = async (req, res, next) => {
  try {
    const impactData = await Impact.find().populate();
    return res.json({
      status: 200,
      data: impactData,
      success: true,
    });
  } catch (error) {
    console.log("err", error);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};
exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    const isValidId = (id) => {
      return mongoose.Types.ObjectId.isValid(id);
    };
    const userId = isValidId(data.user);
    if (!userId) {
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
    const campaignId = isValidId(data.campaign);
    if (!campaignId) {
      return res.status(400).json({
        status: 400,
        error: "Invalid Campaign Id",
        success: false,
      });
    }
    const campaign = await Campaign.findById({ _id: data.campaign });
    {
      if (!campaign) {
        return res.json({
          status: 401,
          message: "campaign not exist",
          success: false,
        });
      }
    }
    const impacts = new Impact({
      user: data.user,
      campaign: data.campaign,
      description: data.description,
      cause: campaign.cause,
    });
    const savedImpact = await impacts.save();
    const impactId = savedImpact._id;
    const videos = new Video({
      user: req.body.user,
      impact: impactId,
      video_url: data.video.videoUrl,
      type: data.video.type,
      thumbnail_url: data.thumbnailUrl,
    });
    const savedVideo = await videos.save();
    const videoId = savedVideo._id;
    await Campaign.findByIdAndUpdate(
      { _id: data.campaign },
      {
        $push: {
          impacts: impactId,
        },
      }
    );
    await Impact.findByIdAndUpdate(
      { _id: impactId },
      {
        $set: {
          videos: videoId,
        },
      }
    );
    const impactData = await Impact.find({ _id: impactId });
    const campaignData = await Campaign.find({ _id: data.campaign });
    const query = campaignData[0]._id;
    const filter = { search: query, type: "campaigns" };
    const campaignAlgo = await searchAlgolia(filter);
    campaignAlgo[0].impacts = campaignData[0].impacts;
    await saveAlgolia(impactData, "impacts");
    let obj = {
      objectID: campaignAlgo[0].objectID,
      impacts: campaignAlgo[0].impacts,
    };
    await updateAlgolia(obj, "campaigns");
    return res.json({
      status: 200,
      message: "impact added successfully",
      success: true,
    });
  } catch (err) {
    console.log("err", err);
    return res.json({ status: 500, message: err, success: false });
  }
};
