const { ObjectId } = require("mongodb");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { VideoType } = require("../constants");
const Buffer = require("buffer/").Buffer;
const fs = require("fs");
const {
  Video,
  Comment,
  User,
  Issue,
  Notification,
  RepliesComment,
  CommentsLikes,
} = require("../models");
const { endorseCampaign } = require("../libs/campaign");
const { deleteFile } = require("../libs/utils");
const {
  upload,
  uploadVideoThumbnail,
  uploadImage,
} = require("../libs/fileUpload");
const { saveAlgolia } = require("../libs/algolia");
const { sendMessage } = require("../libs/webSocket");
exports.index = async (req, res, next) => {
  try {
    const {
      page = 1,
      campaign,
      user,
      type = VideoType.IMPACT,
      tab,
    } = req.query;

    var query = {};
    const pageSize = 10;
    const displayPage = parseInt(page);
    const skip = (displayPage - 1) * pageSize;
    if (!!type) {
      query = {
        $or: [{ type: "IMPACT" }, { type: "actionVideo" }],
      };
    }
    if (!!campaign) {
      query["campaign"] = campaign;
    }

    if (!!user) {
      query["user"] = user;
    }

    if (tab === "following" && req.user) {
      const following = req.user.following.map((_id) => new ObjectId(_id));

      query["user"] = { $in: following };
    }
    const result = await Video.find(query)
      .sort({ createdAt: "desc" })
      .populate([
        {
          path: "comments",
          populate: [
            {
              path: "sender",
              model: "User",
            },
            {
              path: "likes",
              model: "commentsLikes",
            },
            {
              path: "replies",
              populate: [
                {
                  path: "sender", // Assuming "sender" is the field referencing the user who posted the reply
                  model: "User",
                },
                {
                  path: "likes",
                  model: "commentsLikes",
                },
              ],

              model: "RepliesComments",
            },
          ],

          model: Comment,
        },

        {
          path: "issue",
          populate: [
            {
              path: "user",
              model: User,
            },
            {
              path: "joined",
              model: User,
            },
            {
              path:"votes",
              model:User
            }
          ],
          model: Issue,
        },
      ])
      .skip(skip)
      .limit(pageSize);
    return res.json(result);
  } catch (error) {
    console.log("err is", error);
    return res.json([]);
  }
};
exports.videosData=async(id)=>{
  return await Video.find({_id:new ObjectId(id)})
    .sort({ createdAt: "desc" })
    .populate([
      {
        path: "comments",
        populate: [
          {
            path: "sender",
            model: "User",
          },
          {
            path: "likes",
            model: "commentsLikes",
          },
          {
            path: "replies",
            populate: [
              {
                path: "sender", // Assuming "sender" is the field referencing the user who posted the reply
                model: "User",
              },
              {
                path: "likes",
                model: "commentsLikes",
              },
            ],

            model: "RepliesComments",
          },
        ],

        model: Comment,
      },

      {
        path: "issue",
        populate: [
          {
            path: "user",
            model: User,
          },
          {
            path: "joined",
            model: User,
          },
    
        ],
        model: Issue,
      },
    ])
}
exports.location = async (req, res, next) => {
  try {
    const longitude = req.body.lng;
    const latitude = req.body.lat;
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const distance = 1;
    const unitValue = 10000000;
    const query = [];
    query.push(
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates,
          },
          maxDistance: distance * unitValue,
          distanceField: "distance",
          distanceMultiplier: 1 / unitValue,
          key: "location",
        },
      }
    );
    const result = await Video.aggregate(query);
    return res.json({
      status: 200,
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("value of err is", err);
    return res.json({ status: 500, message: err, success: false });
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
    const sender = await User.findById({ _id: uid });

    if (video.likes.includes(uid)) {
      // remove like
      await Video.updateOne({ _id: vid }, { $pull: { likes: uid } });
      hasLiked = false;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;
      return res.status(200).json({ likedVideo: hasLiked, likes });
    } else {
      let data = await Video.findByIdAndUpdate(
        { _id: vid },
        { $push: { likes: uid } }
      );
      
      const result = await Video.find({_id:data._id})
      .sort()
      .populate([
        {
          path: "likes",
          model: User,
        },
    
      ])
      const messageData = result[0].likes.slice(0, 4).reverse().map(element => element?.first_name).join(', ');
      const message = `${messageData} liked your action video for ${data.title}`;
      const notification = new Notification({
        messages: message,
        user: result[0].user._id,
        activity: data.user._id,
        notificationType: "likedVideo",
      });
      await notification.save();
      hasLiked = true;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;
      sendMessage("likedVideo", message, uid);
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
    const thumbnail = await uploadImage(req.file, "thumbnail");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    return res.status(200).json({ message: "uploaded", image: data });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};
exports.uploadProfile = async (req, res) => {
  try {
    const thumbnail = await uploadImage(req.file, "profile");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    return res.status(200).json({ message: "Profile image uploaded successfully", image: data });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.commentVideo = async (req, res) => {
  try {
    let records = req.body;
    const message = new Comment(records);
    const savedMessage = await message.save();
    let messageId = savedMessage._id;
    let result = await Video.findByIdAndUpdate(
      { _id: records.video },
      { $push: { comments: messageId } },
      { new: true }
    );
    const userPostedVideo = await Video.find({_id:result._id})
    .sort()
    .populate([
      {
        path: "comments",
        model: User,
      },
  
    ]) 
    const issueId = result.issue;
    const issueRecords = await Issue.findById({ _id: issueId });
    const sender = await User.findById({ _id: records.sender });
    const notificationMessage = `${sender.first_name} ${sender.last_name} commented your action video for ${issueRecords.title}`;
    const notification = new Notification({
      messages: notificationMessage,
      user: userPostedVideo[0].user._id,
      activity: sender._id,
      notificationType: "commentVideo",
    });
    await notification.save();
    const uid = result?.user?._id.toString();
    const newRecords=await exports.videosData(records.video)
    sendMessage("commentVideo", notificationMessage, uid);
    return res.json({
      status: 200,
      message: "Sent message successfully",
      success: false,
      data: newRecords,
    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: "Something went wrong",
      success: false,
    });
  }
};
exports.replyCommentVideo = async (req, res) => {
  try {
    let records = req.body;
    const commentReplies = new RepliesComment(records);
    const saveReplies = await commentReplies.save();
    let result = await Comment.findByIdAndUpdate(
      {
        _id: records.comment,
      },
      {
        $push: { replies: saveReplies._id },
      },
      { new: true }
    );
    const sender = await User.findById({ _id: records.sender });
    const notificationMessage = `${sender.first_name} ${sender.last_name} replies  your comments`;
    const notification = new Notification({
      messages: notificationMessage,
      user: result.sender,
      activity: sender._id,
      notificationType: "commented",
    });
    await notification.save();
    const uid = sender._id.toString();
    const newRecords=await exports.videosData(records.video)
    sendMessage("repliesComment", notificationMessage, uid);
    return res.json({
      status: 200,
      message: "Reply successful!",
      success: false,
      data: newRecords,

    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: "Something went wrong",
      success: false,
    });
  }
};

exports.commentLikes = async (req, res) => {
  try {
    let records = req.body;
    const isLiked=await CommentsLikes.find({comments: new ObjectId(records.comments),user:new ObjectId(records.user)})
    var responseMessage=''
    if(isLiked.length>0){
      await Comment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.comments),
        },
        {
          $pull: { likes:isLiked[0]._id },
        },
        { new: true }
      );
      //delete like
     await CommentsLikes.deleteOne({ _id: isLiked[0]._id });
     responseMessage='unLikedComment'
    }
    else{
      const likes = new CommentsLikes(records);
      const savedLike = await likes.save();
      let result = await Comment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.comments) ,
        },
        {
          $push: { likes: savedLike._id},
        },
        { new: true }
      );
      responseMessage='Liked Comment'
      const sender = await User.findById({ _id: records.user });
      const likeMessage = `${sender.first_name} ${sender.last_name} likes  your comments`;
      const notification = new Notification({
        messages: likeMessage,
        user: result.sender,
        activity: sender._id,
        notificationType: "likeComment",
      });
      await notification.save();
      const uid = result.sender.toString();
      sendMessage("like", likeMessage, uid);

    }
 

    //
    const newRecords=await exports.videosData(records.video)
    return res.json({
      status: 200,
      message: responseMessage,
      success: false,
      data: newRecords,
    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: "Something went wrong",
      success: false,
    });
  }
};
exports.replyCommentLikes = async (req, res) => {
  try {
    let records = req.body;
    const isLiked=await CommentsLikes.find({repliesComments: new ObjectId(records.repliesComments),user:new ObjectId(records.user)})
    var responseMessage=''
    if(isLiked.length>0){
      await RepliesComment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.repliesComments),
        },
        {
          $pull: { likes:isLiked[0]._id },
        },
        { new: true }
      );
      //delete like
     await CommentsLikes.deleteOne({ _id: isLiked[0]._id });
     responseMessage='UnLiked Comment'
    }
    else{
      const likes = new CommentsLikes(records);
      const savedLike = await likes.save();
     const result= await RepliesComment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.repliesComments) ,
        },
        {
          $push: { likes: savedLike._id},
        },
        { new: true }
      );
      responseMessage='Liked Comment'
      const sender = await User.findById({ _id: records.user });
      const likeMessage = `${sender.first_name} ${sender.last_name} likes  your comments`;
      const notification = new Notification({
        messages: likeMessage,
        user: result.sender,
        activity: sender._id,
        notificationType: "like",
      });     
      await notification.save();
      const uid = result.sender.toString();
      sendMessage("like", likeMessage, uid);

    }
    //
    const newRecords=await exports.videosData(records.video)    
    return res.json({
      status: 200,
      message: responseMessage,
      success: false,
      data: newRecords,
    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: "Something went wrong",
      success: false,
    });
  } 
};

