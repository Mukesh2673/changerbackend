const { User, Video, Issue } = require("../models");
const { saveAlgolia } = require("../libs/algolia");
const { generateTags } = require("../controllers/hashtagController");
const mongoose = require("mongoose");
require("dotenv").config();

exports.issueRecords = async (query) => {
  let records = await Issue.find(query).populate([
    {
      path: "video",
      populate: { path: "videos", model: Video },
    },
  ]);
  return records;
};
exports.index = async (req, res, next) => {
  try {
    let issues = await this.issueRecords({});
    return res.json({
      status: 200,
      data: issues,
      success: true,
    });
  } catch (error) {
    console.log("err is", error);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};
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
    const issue = new Issue({
      title: data.title,
      user: data.user,
      cause: data.cause,
      location: data.location,
      _geoloc: data._geoloc,
    });
    const savedIssue = await issue.save();
    let issueTags = savedIssue?.hashtags;
    var tagsArray = [];
    if (issueTags?.length > 0) {
      let arr = [...issueTags, ...tags];
      tagsArray = arr.filter(
        (value, index, self) => self.indexOf(value) === index
      );
    } else {
      tagsArray = tags;
    }
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
    const videoRecords = await Video.find({ _id: videoId }).populate([
      {
        path: "issue",
        populate: { path: "issues", model: Issue },
      },
    ]);
    saveAlgolia(videoRecords, "videos");
    await Issue.findByIdAndUpdate(
      { _id: issueId },
      {
        $set: {
          hashtags: tagsArray,
          video: videoId,
        },
      }
    );
    const issueRecord = await this.issueRecords({ _id: issueId });
    saveAlgolia(issueRecord, "issues");
    return res.json({
      status: 200,
      message: "issue added successfully",
      success: true,
    });
  } catch (err) {
    console.log("err is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};
