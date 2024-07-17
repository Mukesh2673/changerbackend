const { ObjectId } = require("mongodb");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
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
const { videoCommonPipeline } = require('../constants/commonAggregations')

// get Impact videos
exports.getVideos = async (req, res) => {
  try {
    const { page = 1, userId, tab, pageSize = 10, location} = req.query;
    let users = []
    let  campaigns = []
    let issues = []
    let query = [] 
    let pipeLine=videoCommonPipeline
    if(location)
    {
      const location = JSON.parse(decodeURIComponent(req.query.location));
      const longitude = parseFloat(location[0]);
      const latitude = parseFloat(location[1]);
      const coordinates = [longitude, latitude];
      const distance = 1; 
      const unitValue = 1000;
      pipeLine.unshift({
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
      
        pipeLine=[...pipeLine,{ $match: { $or: query } }]
        }
      else{
        return res.status(400).json({ message: "Invalid User Id"});
      }
    }
    if(tab=='supporting' && !userId)
    {
      return res.status(400).json({ message: "User Id required For Supporting Tab"});
    }
    pipeLine=[...pipeLine,{ $skip: (page - 1) * pageSize },{ $limit: pageSize }]
    const result = await Video.aggregate(pipeLine)
    const totalRecords = await Video.countDocuments();
    return res.json({ data: result,  totalPage: Math.ceil(totalRecords / pageSize), status: 200,totalRecords:totalRecords, pageSize:pageSize});
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

exports.show = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!!video) {
      return res.json({message:res.__("VIDEO_RECORD_RETERIVED"), data: video, status: 200 });
    }

    return res.status(404).json({ message: res.__("VIDEO_NOT_FOUND") });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.store = async (req, res) => {
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
  try {
    const { vid } = req.params;
    const uid = req.user
    const video = await Video.findById({ _id: vid });
    let hasLiked = false;
    if (video.likes.includes(uid)) {
      // remove like
      await Video.updateOne({ _id: vid }, { $pull: { likes: uid } });
      await updateVideosInAlgolia(vid)
      hasLiked = false;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;
      return res.status(200).json({ likedVideo: hasLiked, NumberofLikes: likes ,message: "The video has been unLiked successfully."});
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
      return res.status(200).json({ success: hasLiked, NumberofLikes: likes, message: "The video has been liked successfully." });
    }
  } catch (e) {
    console.log("error is",e)
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


exports.delete = async (req, res) => {
  try {
    await Video.deleteOne({ _id: req.params.id });
    await deleteVideosInAlgolia(req.params.id)
    return res.json({ success: true ,message: res.__("VIDEO_DELETED"), status:200 });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.thumbnail = async (req, res) => {
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
          success:  res.__("THUMBNAIL_GENERATED"),
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

exports.upload = async (req, res) => {
  try {
    const thumbnail = await uploadVideoThumbnail(req.file);
    const uploadStatus = await upload(req.file);
    uploadStatus.thumbnailKey = thumbnail.key;
    return res.status(200).json({ message:  res.__("VIDEO_UPLOADED"), data: uploadStatus, status: 200 });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const thumbnail = await uploadImage(req.file, "thumbnail");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    return res.status(200).json({ message: res.__("IMAGE_UPLOADED"), image: data });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.uploadProfile = async (req, res) => {
  try {
    const thumbnail = await uploadImage(req.file, "profile");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    return res.status(200).json({ message: res.__("PROFILE_UPLOADED"), image: data });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.commentVideo = async (req, res) => {
  try {
    let records = req.body;
    const { vid } = req.params;
    records.sender=req.user
    records.video=vid
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
    const sender = await User.findById({ _id: records.sender });
    //add Message to the user regarding to the campaign
    if(result.issue)
    {
      const issueId = result.issue;
      const issueRecords = await Issue.findById({ _id: issueId });
      const notificationMessage = `${sender.first_name} ${sender.last_name} commented your action video for ${issueRecords.title}`;
      const notification = new Notification({
        messages: notificationMessage,
        user: userPostedVideo[0].user._id,
        activity: sender._id,
        notificationType: "commentVideo",
      });
      await notification.save();
      sendMessage("commentVideo", notificationMessage, uid);
  
    }  
    const uid = result?.user?._id.toString();
    const newRecords = await exports.videosData(records.video);
     return res.json({
      status: 200,
      message:  res.__("COMMENT_TO_VIDEO"),
      success: false,
      data: newRecords,
    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: err.message,
      success: false,
    });
  }
};

exports.replyCommentVideo = async (req, res) => {
  try {
    const records={
      sender:req.user,
      video: req.params.vid,
      comment: req.params.cid,
      message: req.body.message
    }
    const comment=await Comment.find({_id: records.comment})
    if(comment.length==0)
    {
      return res.json({
        status: 400,
        message: res.__("INVALID_COMMENT_ID"),
        success: false,
      });
    }
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
      message: res.__("COMMENT_REPLY_ADD"),
      success: false,
      data: newRecords,
    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: err.message,
      success: false,
    });
  }
};

exports.commentLikes = async (req, res) => {
  try {
    const records={
      comments: req.params.cid,
      user: req.user,
      video: req.params.vid
    }  
    const comment=await Comment.find({_id: records.comments})
    if(comment.length==0)
    {
      return res.json({
        status: 400,
        message: res.__("INVALID_COMMENT_ID"),
        success: false,
      });
    }
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
      responseMessage =  res.__("COMMENT_UNLIKE")
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
      responseMessage =  res.__("COMMENT_LIKE")
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
      success: true,
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
    const records={
      repliesComments: req.params.repliesCommentId,
      user: req.user,
      video: req.params.vid
    } 
    const comment=await RepliesComment.find({_id: records.repliesComments})
    if(comment.length==0)
    {
      return res.json({
        status: 400,
        message: res.__("INVALID_REPLY_COMMENT_ID"),
        success: false,
      });
    }

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
      responseMessage = res.__("COMMENT_UNLIKE")
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
      responseMessage = res.__("COMMENT_LIKE")
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

//get friends impact 
exports.friendsImpact = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query; 
    const userId = req.user; 
    const pipeline=[...videoCommonPipeline, 
      { $skip: (parseInt(page) - 1) * parseInt(pageSize) },
      { $limit: parseInt(pageSize) },
      {
        $project: { user: 1 , campaign: 1, issue: 1, video_url: 1, thumbnail_url: 1 } 
      }
    ]
    // Fetch the authenticated user's document
    const auth = await User.findById(userId);
    // Gather IDs of friends (following and followers)
    const friends = [...auth.following, ...auth.followers];
    // Query videos where the user ID matches any user in the friends list
    pipeline.unshift({
      $match: { user: { $in: friends } }
    })

    const result = await Video.aggregate([
      {
        $facet: {
          paginatedResults: pipeline,
          totalCount: [
            {
              $match: { user: { $in: friends } }
            },
            { $count: "count" }
          ]
        }
      }
    ]);
    const totalRecords=result[0].totalCount[0].count
    const videoRecords=result[0].paginatedResults
    if(videoRecords.length>0)
    {
      return res.status(200).json({
        status: 200,
        message: 	 res.__("FRIENDS_IMPACT_RETERIVED"),
        success: true,
        data: videoRecords,
        totalPage: Math.ceil(totalRecords / pageSize)
      });
    }
    else{
      return res.status(400).json({
        status: 400,
        message: res.__("IMPACT_RECORD_NOT_FOUND"),
        success: false,
        data: videoRecords,
        data: videoRecords,
        totalPage: Math.ceil(totalRecords / pageSize)
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      success: false,
      error: err.message
    });
  }
};

//add watch count in videos
exports.addViews = async (req, res)=>{
  try{
    const {vid}=req.params    
    const video= await Video.findById(vid)
    if(!video)
    {
      return res.status(400).json({message: res.__("INVALID_VIDEO_ID"), status: 400, success: false})
    }
    let count =++video.views;
    const update=await Video.updateOne({ _id: vid }, { views: count });
    await updateVideosInAlgolia(vid)
    return res.status(200).json({ success: true,  message:res.__("VIDEO_WATCH_COUNT"), data: update});
  }
  catch(err)
  {
    return res.status(500).json({ success: false,  message: err.message});
  }
}