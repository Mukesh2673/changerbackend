const { User, Video, Issue,Impact, Campaign,campaignPhases,petitions,CampaignParticipant, donation } = require("../models");
const mongoose = require("mongoose");
require("dotenv").config();

exports.index = async (req, res, next) => {
  try {
    const impactData = await Impact.find().populate([{
      path: "campaigns",
      populate:[{
        path:"phases",
         populate:[
            { path: "donation", model: donation },
            { path: "petition", model: petitions },
            { path: "participation", model: CampaignParticipant },
          ],  
        },
        {
          path: "videos",
          populate: { path: "videos", model: Video },
        }
      ]
      }
    ]);
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
    const impacts = new Impact({
      user:data.user,
      campaigns:data.campaigns,
      description: data.description,
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
    await Impact.findByIdAndUpdate(
      { _id: impactId },
      {
        $set: {
          videos: videoId,
        },
      }
    );
    return res.json({
      status: 200,
      message: "impact added successfully",
      success: true,
    });
  } catch (err) {
    console.log('err is',err)
    return res.json({ status: 500, message: err, success: false });
  }
};
