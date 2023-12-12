const { User, Video, Issue } = require("../models");
const mongoose = require("mongoose");
const { endorseCampaign } = require("../libs/campaign");
const { ObjectId } = require("mongodb");
const issue = require("../models/issue/issue");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.index = async (req, res, next) => {
  try {
    const agg = await Issue.aggregate([
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
    ]);
    return res.json({
      status: 200,
      data: agg,
      success: true,
    });
  } catch (error) {
    console.log("err irs", error);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};
exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    if(!mongoose.Types.ObjectId.isValid(data.user)) {
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
    const issue = new Issue({
      title: data.title,
      user: data.user,
      cause: data.cause,
      location: data.location,
    });
    const savedIssue = await issue.save();
    const issueId = savedIssue._id;
    const videos = new Video({
      user: req.body.user,
      issue: issueId,
      title: data.title,
      video_url: data.video.videoUrl,
      type: data.video.type,
      thumbnail_url: data.thumbnailUrl,
    });
    const savedVideo = await videos.save();
    const videoId = savedVideo._id;
    await Issue.findByIdAndUpdate(
      { _id: issueId },
      {
        $set: {
          videos: videoId,
        },
      }
    );
    return res.json({
      status: 200,
      message: "issue added successfully",
      success: true,
    });
  } catch (err) {
    return res.json({ status: 500, message: err, success: false });
  }
};
