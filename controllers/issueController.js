const { User, Video, Issue } = require("../models");
const mongoose = require("mongoose");
require("dotenv").config();
exports.index = async (req, res, next) => {
  try {
    const agg = await Issue.aggregate([
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
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
          video: videoId,
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
