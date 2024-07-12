const { User, Video, Issue, Message, Report, Comment, Notification, Campaign, Advocate} = require("../models");
const { generateTags } = require("./hashtagController");
const mongoose = require("mongoose");
const moment = require("moment");
require("dotenv").config();
const OpenAI = require("openai");
const { sendMessage } = require("../libs/webSocket");
const {updateIssueInAlgolia, deleteIssueInAlgolia, addIssueInAlgolia}=require('../algolia/issueAlgolia')
const { updateUsersInAlgolia } = require("../algolia/userAlgolia")
const {addVideoInAlgolia } = require("../algolia/videoAlgolia")

exports.issueRecords = async (query) => {
  let records = await Issue.find(query).populate([
    {
      path: "video",
      populate: { path: "videos", model: Video },
    },
    {
      path: "user",
      populate: { path: "User", model: User },
    },
  ]);
  return records;
};

exports.index = async (req, res, next) => {
  try {
    const query = [];
    const {cause ,lat,lng}=req.query
    // Handle pagination
    if (req.query.page && req.query.pageSize) {
      const page = parseInt(req.query.page, 10);
      const pageSize = parseInt(req.query.pageSize, 10);
      const skip = (page - 1) * pageSize;
      query.push({ $skip: skip });
      query.push({ $limit: pageSize });
    }
    if(lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lng)];
      const distance = 1;
      const unitValue = 10000000;
      query.push({
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
      });
    }
    if(cause){
      let causeFilter=cause.split(',')
      query.push({ $match: { cause: { $in: causeFilter } } });
    }
    query.push({
      $lookup: {
        from: "messages", // The name of the collection to join with
        localField: "messages", // The field from the input documents
        foreignField: "_id", // The field from the documents of the "from" collection
        as: "messages",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender",
            },
          },
          {
            $unwind: "$sender",
          },
        ],
      },
    });
    query.push({
      $lookup: {
        from: "users", // The name of the collection to join with
        localField: "user", // The field from the input documents
        foreignField: "_id", // The field from the documents of the "from" collection
        as: "user", // The alias for the resulting array of joined documents
        pipeline: [
          {
            $lookup: {
              from: "messages",
              localField: "messages",
              foreignField: "_id",
              as: "messages",
            },
          },
        ],
      },
    });
    query.push({
      $lookup: {
        from: "users", // The name of the collection to join with
        localField: "joined", // The field from the input documents
        foreignField: "_id", // The field from the documents of the "from" collection
        as: "joined", // The alias for the resulting array of joined documents
      },
    });
    const issues = await Issue.aggregate(query);
    return res.json({
      status: 200,
      data: issues,
      success: true,
    });
  } catch (error) {
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};

exports.create = async (req, res, next) => {
  try {
    let data = req.body;
    data.user= req.user
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
    const karmaPoint = auth.karmaPoint + 100;
    const user = await User.findByIdAndUpdate(
      { _id: auth._id },
      {
        $set: {
          karmaPoint: karmaPoint,
        },
      },
      { new: true }
    );
    await updateUsersInAlgolia(auth._id)
    const issue = new Issue({
      title: data.title,
      user: data.user,
      cause: data.cause,
      location: data.location,
      address: data.address,
      joined: [user._id],
    });
    const savedIssue = await issue.save();
    await addIssueInAlgolia(savedIssue._id)
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
      thumbnail_url: data.video.thumbnailUrl,
      location: data.location,
      hashtags: tagsArray,
    });
    const savedVideo = await videos.save();
    
    const videoId = savedVideo._id;
    await addVideoInAlgolia(videoId)

    await Issue.findByIdAndUpdate(
      { _id: issueId },
      {
        $set: {
          hashtags: tagsArray,
          video: videoId,
        },
      }
    );
    await updateIssueInAlgolia(issueId)
    const message = `you received +100 karma for good intention of creating Problem of  ${savedIssue.title}`;
    const notification = new Notification({
      messages: message,
      user: auth._id,
      activity: savedIssue.user,
      joinedIssue: savedIssue.joined,
      notificationType: "karmaPoint",
    });
    sendMessage("karmaPoint", message, auth._id);
    await notification.save();
    return res.json({
      status: 200,
      message: "Issue added successfully",
      success: true,
    });
  } catch (err) {
    console.log("err is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.location = async (req, res, next) => {
  try {
    let cause = req.body.cause;
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
      },
      {
        $lookup: {
          from: "users", // The name of the collection to join with
          localField: "user", // The field from the input documents
          foreignField: "_id", // The field from the documents of the "from" collection
          as: "user", // The alias for the resulting array of joined documents
        },
      },

      {
        $lookup: {
          from: "videos", // The name of the collection to join with
          localField: "video", // The field from the input documents
          foreignField: "_id", // The field from the documents of the "from" collection
          as: "video", // The alias for the resulting array of joined documents
        },
      },

      {
        $lookup: {
          from: "users", // The name of the collection to join with
          localField: "votes", // The field from the input documents
          foreignField: "_id", // The field from the documents of the "from" collection
          as: "votes", // The alias for the resulting array of joined documents
        },
      },

      {
        $lookup: {
          from: "users", // The name of the collection to join with
          localField: "joined", // The field from the input documents
          foreignField: "_id", // The field from the documents of the "from" collection
          as: "joined", // The alias for the resulting array of joined documents
        },
      },
      {
        $project: {
          _id: 1,
          video: 1,
          joined: 1,
          location: 1,
          hashtags: 1,
          title: 1,
          cause: 1,
          address: 1,
          createdAt: 1,
          updatedAt: 1,
          videos: 1,
          user: 1,
          votes: 1,
        },
      }
    );
    if (cause) {
      query.push({ $match: { cause: { $in: cause } } });
    }
    const result = await Issue.aggregate(query);
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

exports.generate = async (req, res, next) => {
  try {
    let text = req.body.idea;
    const openai = new OpenAI({
      apiKey: process.env.PUBLIC_OPEN_AI,
    });
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: text }],
      model: "gpt-3.5-turbo-0125",
    });
    const response = chatCompletion.choices[0].message.content;
    return res.json({
      status: 200,
      message: "Prompt generated successfully",
      success: true,
      text: response,
    });
  } catch (err) {
    console.log("errror", err);
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.upvotes = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const uid= req.user
    const auth = await User.findById({ _id: uid });
    if (!auth) {
      return res.json({
        status: 401,
        message: "invalid User",
        success: false,
        voted: false,
      });
    }
    let issue = await Issue.findById({ _id: issueId });
    const upVotes = issue.votes;
    if (upVotes.includes(uid)) {
      issue = await Issue.findByIdAndUpdate(
        { _id: issueId },
        { $pull: { votes: uid } },
        { new: true }
      );
      await updateIssueInAlgolia(issueId)
      if (issue.votes.length < 3) {
        await Issue.findByIdAndUpdate(
          { _id: issueId },
          { issueState: "upVotes" },
          { new: true }
        );
        await updateIssueInAlgolia(issueId)
      }
      return res.json({
        status: 200,
        message: "Unvoted",
        success: true,
        voted: false,
      });
    } else {
      const issue = await Issue.findByIdAndUpdate(
        { _id: issueId },
        { $push: { votes: uid } },
        { new: true }
      );
      await updateIssueInAlgolia(issueId)
      var message = "";
      var notificationType = "";
      if (issue.votes.length < 3) {
        message = `${auth?.first_name} ${auth?.last_name} upvoted your issue discussion ${issue.title}`;
        notificationType = "upvoted";
      } else {
        message = `your issue ${issue.title} became discussion panel`;
        notificationType = "discussion";
        await Issue.findByIdAndUpdate(
          { _id: issueId },
          { issueState: "discussion" },
          { new: true }
        );
       await updateIssueInAlgolia(issueId)

      }
      const notification = new Notification({
        messages: message,
        user: issue.user,
        activity: uid,
        joinedIssue: issue.joined,
        notificationType: notificationType,
      });
      await notification.save();
      sendMessage("discussion", message, issue.user);
      return res.json({
        status: 200,
        message: "Issue voted successfully",
        success: true,
        voted: true,
        data: issue,
      });
    }
  } catch (err) {
    console.log("err is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.issueForUser = async (req, res) => {
  try {
    const uid=req.user
    const { page = 1, pageSize = 10 } = req.query;
    const pipeLine=[
      {
        $match: {//get the records that user not involved
          $and: [
            { user: { $ne: uid } }, 
            { joined: { $ne: uid } }
          ]
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'video',
          foreignField: '_id',
          as: 'video',
          pipeline:[
            {
              $project: { _id: 1 , video_url:1, thumbnail_url:1 } 
            }  
          ]
        }
      },
      { $skip: (parseInt(page) - 1) * parseInt(pageSize) },
      { $limit: parseInt(pageSize) }
    ]
    const issueRecords = await Issue.aggregate([
      {
        $facet: {
          paginatedResults: pipeLine,
          totalCount: [
            {
              $match: {//get the records that user not involved
                $and: [
                  { user: { $ne: uid } }, 
                  { joined: { $ne: uid } }
                ]
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);
    const totalRecords=issueRecords[0]?.totalCount[0]?.count||0
    const records=issueRecords[0].paginatedResults
    if(records.length>0)
    {
      return res.json({ message: "Issue  records retrieved successfully.",data: records,  totalPage: Math.ceil(totalRecords / pageSize), status: 200});
    }
    else{
      return res.json({ message: "Issue  Not Found",data: records,  totalPage: Math.ceil(totalRecords / pageSize), status: 400});
    }
  } catch (err) {
    console.log("errr is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.joinIssue = async (req, res) => {
  const issueId =  req.params.id;
  const userId = req.user;
  const result = await Issue.findById({ _id: issueId }).populate([
    {
      path: "user",
      populate: { path: "User", model: User },
    },
  ]);
  if (result) {
    const auth = await User.findById({ _id: userId });
    if (!auth) {
      return res.json({
        status: 401,
        message: "invalid User",
        success: false,
      });
    }
    let joined = result?.joined;
    if (joined.length > 0) {
      let exist = joined.includes(userId);
      if (exist) {
        return res.json({
          status: 400,
          message: "Issue already Joined",
          success: true,
        });
      }
    }
    const karmaPoint = auth.karmaPoint + 50;
    await User.findByIdAndUpdate(
      { _id: auth._id },
      {
        $set: {
          karmaPoint: karmaPoint,
        },
      },
      { new: true }
    );
    
    const issue = await Issue.findByIdAndUpdate(
      { _id: issueId },
      { $push: { joined: userId } },
      { new: true }
    );
    await updateUsersInAlgolia(auth._id)
    await updateIssueInAlgolia(issueId)
    const message = `joined your issue discussion ${result.title}`;
    const notification = new Notification({
      messages: message,
      user: auth._id,
      activity: issue.user,
      joinedIssue: issue._id,
      notificationType: "joinedIssue",
    });
    await notification.save();
    sendMessage("joinedIssue", message, auth._id);
    const karmaPointnotification = new Notification({
      messages: `you received +50 karma for good intention of joining Problem of  ${result.title}`,
      user: auth._id,
      activity: issue._id,
      joinedIssue: issue.joined,
      notificationType: "karmaPoint",
    });
    await karmaPointnotification.save();
    sendMessage("karmaPoint", message, auth._id);
     return res.json({
      status: 200,
      message: "Issue joined successfully",
      success: true,
    });
  } else {
    return res.json({
      status: 401,
      message: "invalid Issue",
      success: false,
    });
  }
};

exports.leaveIssue = async (req, res) => {
  const issueId =  req.params.id;
  const userId = req.user;
  const result = await Issue.findById({ _id: issueId });
  if (result) {
    const auth = await User.findById({ _id: userId });
    if (!auth) {
      return res.json({
        status: 401,
        message: "Invalid User",
        success: false,
      });
    }
    let joined = result?.joined;
    if (joined.length > 0) {
      let exist = joined.includes(userId);
      if (exist) {
        const issue = await Issue.findByIdAndUpdate(
          { _id: issueId },
          { $pull: { joined: userId } },
          { new: true }
        );
        const message = `${auth?.first_name} ${auth?.last_name} leave your issue discussion ${result.title}`;
        const notification = new Notification({
          messages: message,
          user: auth._id,
          activity: issue.user,
          joinedIssue: issue._id,
          notificationType: "leaveIssue",
        });
        await notification.save();
        sendMessage("leaveIssue", message, auth._id);

        const karmaPoint = auth.karmaPoint - 50;
       await User.findByIdAndUpdate(
          { _id: auth._id },
          {
            $set: {
              karmaPoint: karmaPoint,
            },
          },
          { new: true }
        );
        await updateUsersInAlgolia(auth._id)
        await updateIssueInAlgolia(issueId)
        return res.json({
          status: 200,
          message: "Issue Leave successfully",
          success: true,
        });
      } else {
        return res.json({
          status: 401,
          message: "Issue Not Joined",
          success: false,
        });
      }
    } else {
      return res.json({
        status: 401,
        message: "Issue Not exist",
        success: false,
      });
    }
  } else {
    return res.json({
      status: 401,
      message: "Invalid Issue",
      success: false,
    });
  }
};

exports.issueDetails = async (req, res) => {
  try {
    const issueId = req.params.id;
    let records = await Issue.find({ _id: issueId }).populate([
      {
        path: "video",
        populate: {
          path: "comments",
          populate: {
            path: "sender",
            model: User,
          },
          model: Comment,
        },
      },

      {
        path: "user",
        populate: { path: "User", model: User },
      },
      {
        path: "joined",
        populate: { path: "User", model: User },
      },
      {
        path: "campaign",
        populate: { path: "campaign", model: Campaign },
      },
      {
        path: "advocate",
        populate: { path: "advocate", model: Advocate },
      },      
      {
        path: "messages",
        populate: {
          path: "sender",
          model: User,
        },
      },
    ]);
    return res.json({
      status: 200,
      message: "Issue Details Record retrieved successfully",
      success: true,
      data: records,
    });
  } catch (err) {
    console.log("err",err)
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.update = async (req, res) => {
  try {
    const issueId = req.params.id;
    const { title, description, notification } = req.body;
    const user=req.user
    const isExist = await Issue.find({ _id: issueId,user:user });
    if (isExist) {
      const issue = await Issue.findByIdAndUpdate(
        { _id: issueId },
        {
          $set: {
            title: title,
            description: description,
            notification: notification,
          },
        },
        { new: true }
      );
      let records = await Issue.find({ _id: issueId }).populate([
        {
          path: "video",
          populate: {
            path: "comments",
            populate: {
              path: "sender",
              model: User,
            },
            model: Comment,
          },
        },

        {
          path: "user",
          populate: { path: "User", model: User },
        },
        {
          path: "joined",
          populate: { path: "User", model: User },
        },
        {
          path: "messages",
          populate: {
            path: "sender",
            model: User,
          },
        },
      ]);
      await updateIssueInAlgolia(issueId)
      return res.json({
        status: 200,
        message: "Issue updated successfully",
        success: true,
        data: records,
      });
    } else {
      return res.json({
        status: 500,
        message: "Invalid Issue",
        success: false,
      });
    }
  } catch (err) {
    return res.json({
      status: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

exports.deleteIssue = async (req, res) => {
  const issueId = req.params.id;
  const user= req.user
  const isExist = await Issue.find({ _id: issueId, user:user });
  try {
    if (isExist.length > 0) {
     await Issue.findByIdAndRemove(issueId);
     await deleteIssueInAlgolia(issueId)
      return res.json({
        status: 200,
        message: "Issue deleted successfully",
        success: true,
      });
    } else {
      return res.json({
        status: 500,
        message: "Invalid issue: you are not authorized to delete this issue",
        success: false,
      });
    }
  } catch (err) {
    console.log('err irD',err)
    return res.json({
      status: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

exports.messages = async (req, res) => {
  try {
    let records = req.body;
    const user=req.user
    records.sender=user
    const updatedIssue=await Issue.findById( records.issueId)
    if(!updatedIssue)
    {
      return res.json({
        status: 400,
        message: "Invalid Issue id",
        success: false,
      });
    }
    const message = new Message(records);
    const savedMessage = await message.save();
    let messageId = savedMessage._id;
    await Issue.findByIdAndUpdate(
      { _id: records.issueId },
      { $push: { messages: messageId } },
      { new: true }
    );

    await updateIssueInAlgolia(records.issues)
    return res.json({
      status: 200,
      message: "Message sent successfully",
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    return res.json({
      status: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.report = async (req, res) => {
  try {
    let records = req.body;
    const user=req.user;
    records.reportedBy=user
    const issue=await Issue.findById( records.issue)
    if(!issue)
    {
      return res.json({
        status: 400,
        message: "Invalid Issue id",
        success: false,
      });
    }
    const report = new Report(records);
    const savedReports = await report.save();
    return res.json({
      status: 200,
      message: "Report added Successfully",
      success: false,
      data: savedReports,
    });
  } catch (err) {
    return res.json({
      status: 500,
      message: "Something Went wrong",
      success: false,
    });
  }
};

exports.share = async (req, res) => {
  try {
    const uid =req.user
    const issueId = req.params.id;
    const isExist = await Issue.find({ _id: issueId ,user:uid });
    if (isExist) {
      const shared = isExist[0].shared;

      let exist = shared.includes(uid);
      if (exist) {
        return res.json({
          status: 200,
          message: "shared",
          success: true,
        });
      } else {
        const issue = await Issue.findByIdAndUpdate(
          { _id: issueId },
          { $push: { shared: uid } },

          { new: true }
        );
        await updateIssueInAlgolia(issueId)     
        return res.json({
          status: 200,
          message: "Issue shared successfully",
          success: true,
          data: issue,
        });
      }
    } else {
      return res.json({
        status: 500,
        message: "invalid issue",
        success: false,
      });
    }
  } catch (err) {
    console.log('uerrror',err)
    return res.json({
      status: 500,
      message: "some thing went wrong",
      success: false,
    });
  }
};

//add views of issue
exports.views = async (req, res) => {
  try {
    const userId = req.user;
    const issueId = req.params.id;
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found", success: false });
    }
    if (issue.views.includes(userId)) {
      return res.status(400).json({ message: "User has already viewed this issue", success: false });
    }
    issue.views.push(userId);
    await issue.save();
    res.status(200).json({ message: "Issue View  successfully", success: true });
  }
  catch(err)
  {
    return res.json({
      status: 500,
      message: err.message,
      success: false,
    });
  }
};

//delete the issue by cron job if there is not interaction since a month
exports.deleteOldIssues = async (req, res) => {
  try {
    const oneMonthAgo = moment().subtract(1, "months").toDate();
    const issuesToDelete = await Issue.find(
      {
        $or: [
          { votes: { $exists: false } }, // Issues where votes array does not exist
          { votes: { $size: 0 } }, // Issues with 0 votes
          {
            $and: [
              { votes: { $size: 1 } }, // Issues with 1 vote
              { $expr: { $eq: [{ $arrayElemAt: ["$votes", 0] }, "$user"] } }, // Vote matches user
            ],
          },
        ],
        createdAt: { $lt: oneMonthAgo },
      },
      "_id"
    );
    if (issuesToDelete.length > 0) {
      await Issue.deleteMany({ _id: { $in: issuesToDelete } });
      for(const issueId of issuesToDelete)
      {
        await deleteIssueInAlgolia(issueId)
      }
      await Video.deleteMany({ issue: { $in: issuesToDelete } });
      for(const issueId of issuesToDelete)
      {
        await deleteIssueInAlgolia(issueId)
      }
    }
  } catch (error) {
    console.error("Error deleting old issues:", error);
  }
};
