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
  Volunteers
} = require("../models");
const { endorseCampaign } = require("../libs/campaign");
const { deleteFile } = require("../libs/utils");
const {
  upload,
  uploadVideoThumbnail,
  uploadImage,
} = require("../libs/fileUpload");
const {addVideoInAlgolia, updateVideosInAlgolia, deleteVideosInAlgolia } = require("../algolia/videoAlgolia")
const { sendMessage } = require("../libs/webSocket");

// get Impact videos
exports.getVideos = async (req, res, next) => {
  try {
    const { page = 1, userId, tab, pageSize = 10, location} = req.query;
    let users = []
    let  campaigns = []
    let issues = []
    let query = [] 
    let pipLine=[
      {
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender'
              }
            },
            {
              $unwind: '$sender'
            },
            {
              $lookup: {
                from: 'commentsLikes',
                localField: 'likes',
                foreignField: '_id',
                as: 'likes'
              }
            },
            {
              $lookup: {
                from: 'repliesComments',
                localField: 'replies',
                foreignField: '_id',
                as: 'replies',
                pipeline: [
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'sender',
                      foreignField: '_id',
                      as: 'sender'
                    }
                  },
                  {
                    $unwind: '$sender'
                  },
                  {
                    $lookup: {
                      from: 'commentsLikes',
                      localField: 'likes',
                      foreignField: '_id',
                      as: 'likes'
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'issues',
          localField: 'issue',
          foreignField: '_id',
          as: 'issue'
        }
      },
      {
        $unwind: {
          path: '$issue',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'issue.user',
          foreignField: '_id',
          as: 'issue.user'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'issue.joined',
          foreignField: '_id',
          as: 'issue.joined'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'issue.votes',
          foreignField: '_id',
          as: 'issue.votes'
        }
      },
     
    ]
    if(location)
    {
      const location = JSON.parse(decodeURIComponent(req.query.location));
      const longitude = parseFloat(location[0]);
      const latitude = parseFloat(location[1]);
      const coordinates = [longitude, latitude];
      const distance = 1; 
      const unitValue = 1000;
      pipLine.unshift({
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
    }
    if(userId)
    {
      if(ObjectId.isValid(userId))
      {
        let user=  await User.findOne({ _id: userId}, 'following');
        users.push(user.following)
        if(users.length > 0)
        {
          query.push({user: { $in: user.following }})
        }  
        if(!user)
        {
          return res.status(400).json({ message: "User Not found", status:400});
        }
        // get the campaign that user Participated
        let campaingVolunters= await Volunteers.find({user: userId}, 'campaign')
         campaigns =campaingVolunters.length>0?campaingVolunters?.map(volunteer => volunteer.campaign):[];
        if(campaigns.length > 0)
        {
          query.push({ campaign: { $in: campaigns } });
        }         
        //get the issue that user JOined
        let issue=await Issue.find({'joined':{$in: userId}},'_id');
        issues =issue.length>0?issue?.map(issue => issue._id):[];
        if(issues.length > 0)
        {
        query.push({issue: { $in: issues } });
        }
      
        pipLine=[...pipLine,{ $match: { $or: query } }]
        }
      else{
        return res.status(400).json({ message: "Invalid User Id"});
      }
    }
    if(tab=='supporting' && !userId)
    {
      return res.status(400).json({ message: "User Id required For Supporting Tab"});
    }
    pipLine=[...pipLine,{ $skip: (page - 1) * pageSize },{ $limit: pageSize }]
    const result = await Video.aggregate(pipLine)
    return res.json(result);
  } catch (error) {
    console.log("err is", error);
    return res.json([]);
  }
};

exports.videosData = async (id) => {
  return await Video.find({ _id: new ObjectId(id) })
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
    ]);
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
    await addVideoInAlgolia(videoId)
    if (req.body.campaign) {
      await endorseCampaign(user, req.body.campaign);
    }
    return res.status(200).json(savedVideo);
  }catch (error) {
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
      await updateVideosInAlgolia(vid)
      hasLiked = false;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;
      return res.status(200).json({ likedVideo: hasLiked, likes });
    } else {
      let data = await Video.findByIdAndUpdate(
        { _id: vid },
        { $push: { likes: uid } }
      );
      await updateVideosInAlgolia(vid); 
      const result = await Video.find({ _id: data._id })
        .sort()
        .populate([
          {
            path: "likes",
            model: User,
          },
        ]);
      const messageData = result[0].likes
        .slice(0, 4)
        .reverse()
        .map((element) => element?.first_name)
        .join(", ");
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


exports.delete = async (req, res, next) => {
  try {
    await Video.deleteOne({ _id: req.params.id });
    await deleteVideosInAlgolia(req.params.id)
    return res.json({ success: "Video deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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
    await updateVideosInAlgolia(records.video)
    const userPostedVideo = await Video.find({ _id: result._id })
      .sort()
      .populate([
        {
          path: "comments",
          model: User,
        },
      ]);
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
    const newRecords = await exports.videosData(records.video);
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
    const newRecords = await exports.videosData(records.video);
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
    const isLiked = await CommentsLikes.find({
      comments: new ObjectId(records.comments),
      user: new ObjectId(records.user),
    });
    var responseMessage = "";
    if (isLiked.length > 0) {
      await Comment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.comments),
        },
        {
          $pull: { likes: isLiked[0]._id },
        },
        { new: true }
      );
      //delete like
      await CommentsLikes.deleteOne({ _id: isLiked[0]._id });
      responseMessage = "unLikedComment";
    } else {
      const likes = new CommentsLikes(records);
      const savedLike = await likes.save();
      let result = await Comment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.comments),
        },
        {
          $push: { likes: savedLike._id },
        },
        { new: true }
      );
      responseMessage = "Liked Comment";
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
    const newRecords = await exports.videosData(records.video);
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
    const isLiked = await CommentsLikes.find({
      repliesComments: new ObjectId(records.repliesComments),
      user: new ObjectId(records.user),
    });
    var responseMessage = "";
    if (isLiked.length > 0) {
      await RepliesComment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.repliesComments),
        },
        {
          $pull: { likes: isLiked[0]._id },
        },
        { new: true }
      );
      //delete like
      await CommentsLikes.deleteOne({ _id: isLiked[0]._id });
      responseMessage = "UnLiked Comment";
    } else {
      const likes = new CommentsLikes(records);
      const savedLike = await likes.save();
      const result = await RepliesComment.findByIdAndUpdate(
        {
          _id: new ObjectId(records.repliesComments),
        },
        {
          $push: { likes: savedLike._id },
        },
        { new: true }
      );
      responseMessage = "Liked Comment";
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
    const newRecords = await exports.videosData(records.video);
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
