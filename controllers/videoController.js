const { ObjectId } = require("mongodb");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { VideoType } = require("../constants");
const Buffer = require("buffer/").Buffer;
const fs = require("fs");
const { Video } = require("../models");
const { endorseCampaign } = require("../libs/campaign");
const { deleteFile } = require("../libs/utils");
const {
  upload,
  uploadVideoThumbnail,
  uploadImage,
} = require("../libs/fileUpload");
const { saveAlgolia } = require("../libs/algolia");

exports.index = async (req, res, next) => {
  try {
    const {
      page = 1,
      campaign,
      user,
      type = VideoType.IMPACT,
      tab,
    } = req.query;

    const query = {
      encoding_status: "FINISHED",
    };

    if (!!campaign) {
      query["campaign"] = campaign;
    }

    if (!!user) {
      query["user"] = user;
    }

    if (!!type) {
      query["type"] = type;
    }

    if (tab === "following" && req.user) {
      const following = req.user.following.map((_id) => new ObjectId(_id));

      query["user"] = { $in: following };
    }

    const result = await Video.paginate(query, {
      page,
      sort: { createdAt: "desc" },
    });
    return res.json(result);
  } catch (error) {
    return res.json([]);
  }
};

exports.show = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!!video) {
      return res.json(video);
    }

    return res.status(404).json({ message: "Video not found." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.store = async (req, res, next) => {
  const user = req.user;

  const video = new Video({
    user: user?._id,
    campaign: req.body.campaign,
    description: req.body.description,
    likes: [],
    video_url: req.body.video_url,
    video_id: req.body.video_id,
    encoding_id: req.body.encoding_id,
    encoding_status: req.body.encoding_status,
    thumbnail_url: req.body.thumbnail_url,
    type: req.body.type,
  });
  try {
    const savedVideo = await video.save();
    const videoId = savedVideo._id;
    const videoRecords = await Video.find({ _id: videoId });
    saveAlgolia(videoRecords, "videos");
    if (req.body.campaign) {
      await endorseCampaign(user, req.body.campaign);
    }

    return res.status(200).json(savedVideo);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.likeVideo = async (req, res) => {
  const { vid, uid } = req.params;
  try {
    const video = await Video.findById({ _id: vid });
    let hasLiked = false;

    if (video.likes.includes(uid)) {
      // remove like
      await Video.updateOne({ _id: vid }, { $pull: { likes: uid } });
      hasLiked = false;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    } else {
      await Video.updateOne({ _id: vid }, { $push: { likes: uid } });
      hasLiked = true;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    }
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getVideoLikes = async (req, res) => {
  const { vid, uid } = req.params;
  try {
    const video = await Video.findById({ _id: vid });
    let hasLiked = false;

    const likes = video.likes.length;

    if (video.likes.includes(uid)) {
      hasLiked = true;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    } else {
      hasLiked = false;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    }
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.update = async (req, res, next) => {};

exports.delete = async (req, res, next) => {
  try {
    // TODO: delete video from AZURE
    // TODO: delete video encoding from BITMOVIN

    await Video.deleteOne({ _id: req.params.id });

    return res.json({ success: "Video deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.encodingFinishedHook = (req, res, next) => {
  const encodingId = req.body?.encoding?.id;

  if (encodingId) {
    try {
      const query = {
        encoding_id: encodingId,
        encoding_status: "CREATED",
      };

      Video.updateMany(query, { encoding_status: "FINISHED" }).exec();
    } catch (error) {
      return res.json([]);
    }
  }

  return res.json([]);
};

exports.thumbnail = async (req, res, next) => {
  try {
    const source = `uploads/${req.file.filename}`;
    //await upload(req.file);
    let data = await new ffmpeg({ source: source, nolog: true })
      .takeScreenshots(
        { timemarks: ["00:00:01.000"], size: "1150x1400" },
        "thumbnail/"
      )
      .on("end", async function () {
        const imageFiles = fs.readdirSync("thumbnail/");
        const imageData = fs.readFileSync("thumbnail/" + imageFiles[0]);
        const base64 = Buffer.from(imageData).toString("base64");
        deleteFile("uploads/");
        deleteFile("thumbnail");
        return res.json({
          success: "Video thumbnail generated",
          base64: base64,
          status: 200,
        });
      })
      .on("error", function () {
        deleteFile("uploads/");
        deleteFile("thumbnail");
        return res.json({ error: error, status: 400 });
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.upload = async (req, res, next) => {
  try {
    const thumbnail = await uploadVideoThumbnail(req.file);
    const uploadStatus = await upload(req.file);
    uploadStatus.thumbnailKey = thumbnail.key;
    return res.status(200).json(uploadStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const thumbnail = await uploadImage(req.file,"thumbnail");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    return res.status(200).json({ message: "uploaded", image: data });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};
exports.uploadProfile=async (req,res)=>{
  try {
    const thumbnail = await uploadImage(req.file,"profile");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    return res.status(200).json({ message: "uploaded", image: data });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
}


