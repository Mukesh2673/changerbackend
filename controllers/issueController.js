const { User, Video, Issue, Upvotes, Message } = require("../models");
const { generateTags } = require("./hashtagController");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

require("dotenv").config();
const OpenAI = require("openai");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
} = require("../libs/algolia");
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
    if (req.query.location) {
      const location = JSON.parse(decodeURIComponent(req.query.location));
      const longitude = location[0];
      const latitude = location[1];
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
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
    if (req?.query?.cause?.length > 0) {
      const cause = JSON.parse(decodeURIComponent(req.query.cause));
      query.push({ $match: { cause: { $in: cause } } });
    }
    query.push({
      $lookup: {
        from: "users", // The name of the collection to join with
        localField: "user", // The field from the input documents
        foreignField: "_id", // The field from the documents of the "from" collection
        as: "user", // The alias for the resulting array of joined documents
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
    let filterUserAlgolia = { search: user._id, type: "users" };
    const searchAlgo = await searchAlgolia(filterUserAlgolia);
    if (searchAlgo.length > 0) {
      let obj = {
        objectID: searchAlgo[0].objectID,
        karmaPoint: user.karmaPoint,
      };
      await updateAlgolia(obj, "users");
    }
    const issue = new Issue({
      title: data.title,
      user: data.user,
      cause: data.cause,
      location: data.location,
      address: data.address,
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
      thumbnail_url: data.video.thumbnailUrl,
      location: data.location,
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
          from: "upvotes", // The name of the collection to join with
          localField: "votes", // The field from the input documents
          foreignField: "_id", // The field from the documents of the "from" collection
          as: "votes", // The alias for the resulting array of joined documents
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
          votes: 1
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
    console.log("response is", response);
    return res.json({
      status: 200,
      message: "prompt generated successfully",
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
    const { uid, issueId } = req.body;
    const votes = await Upvotes.find({ user: uid, issue: issueId });
    if (votes?.length < 1) {
      console.log("iffffffffffffffffffffffffffffff")
      const votes = new Upvotes({
        issue: issueId,
        user: uid,
      });
      await votes.save();
      console.log("votes isss", votes);
      const issue = await Issue.updateOne(
        { _id: issueId },
        { $push: {votes: votes._id} },
        { new: true }
      );
      return res.json({
        status: 200,
        message: "voted",
        success: true,
        voted: true,
        data: issue,
      });
    } else {
            const deletedDocument = await Upvotes.findOneAndDelete({
        user: uid,
        issue: issueId,
      });
      console.log("dele tesfddsf", deletedDocument);
      const issues = await Issue.find({ _id: issueId });
      console.log("issuess is",issues)
      if (issues[0].votes.length > 0 && issues[0]?.votes.includes(votes[0]?._id)) {
        console.log('voted idssded',votes._id)
        const updatedIssue = await Issue.updateOne(
          { _id: issueId },
          { $pull: { votes: votes._id } },
          { new: true }
        );

        return res.json({
          status: 200,
          message: "voted",
          success: true,
          voted: false,
          data: updatedIssue,
        });
      }
      return res.json({
        status: 200,
        message: "voted",
        success: true,
        voted: false,
      });
    }
  } catch (err) {
    console.log("err is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};
exports.userIssues = async (req, res) => {
  try {
    const uid = req.params.uid;
    let records = await Issue.find({ user: uid }).populate([
      {
        path: "video",
        populate: { path: "videos", model: Video },
      },
      {
        path: "user",
        populate: { path: "User", model: User },
      },
      {
        path: "joined",
        populate: { path: "User", model: User },
      },
    ]);
    return res.json({
      status: 200,
      message: "issue records",
      success: true,
      data: records,
    });
  } catch (err) {
    console.log("errr is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};
exports.joinIssue = async (req, res) => {
  const issueId = req.body.issueId;
  const userId = req.body.userId;
  const result = await Issue.findById({ _id: issueId });
  let filterData = { search: result._id, type: "issues" };
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
          message: "issue already Joined",
          success: true,
        });
      }
    }
    const karmaPoint = auth.karmaPoint + 50;
    const user = await User.findByIdAndUpdate(
      { _id: auth._id },
      {
        $set: {
          karmaPoint: karmaPoint,
        },
      },
      { new: true }
    );
    let filterUserAlgolia = { search: user._id, type: "users" };
    const userSearchAlgo = await searchAlgolia(filterUserAlgolia);
    if (userSearchAlgo.length > 0) {
      let obj = {
        objectID: userSearchAlgo[0].objectID,
        karmaPoint: user.karmaPoint,
      };
      await updateAlgolia(obj, "users");
    }

    const issue = await Issue.findByIdAndUpdate(
      { _id: issueId },
      { $push: { joined: userId } },
      { new: true }
    );
    let filterData = { search: result._id, type: "issues" };
    const searchAlgo = await searchAlgolia(filterData);
    updateObject = {
      objectID: searchAlgo[0].objectID,
      joined: issue.joined,
    };
    let updateAlgo = await updateAlgolia(updateObject, "issues");
    return res.json({
      status: 200,
      message: "issue joined successfully",
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
  const issueId = req.body.issueId;
  const userId = req.body.userId;
  const result = await Issue.findById({ _id: issueId });
  let filterData = { search: result._id, type: "issues" };
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
        const issue = await Issue.findByIdAndUpdate(
          { _id: issueId },
          { $pull: { joined: userId } },
          { new: true }
        );
        const karmaPoint = auth.karmaPoint - 50;
        const user = await User.findByIdAndUpdate(
          { _id: auth._id },
          {
            $set: {
              karmaPoint: karmaPoint,
            },
          },
          { new: true }
        );
        let filterUserAlgolia = { search: user._id, type: "users" };
        const searchUserAlgo = await searchAlgolia(filterUserAlgolia);
        if (searchUserAlgo.length > 0) {
          let obj = {
            objectID: searchUserAlgo[0].objectID,
            karmaPoint: user.karmaPoint,
          };
          await updateAlgolia(obj, "users");
        }
        let filterData = { search: result._id, type: "issues" };
        const searchAlgo = await searchAlgolia(filterData);
        updateObject = {
          objectID: searchAlgo[0].objectID,
          joined: issue.joined,
        };
        await updateAlgolia(updateObject, "issues");
        return res.json({
          status: 200,
          message: "issue Leave successfully",
          success: true,
        });
      } else {
        return res.json({
          status: 401,
          message: "issue Not Joined",
          success: false,
        });
      }
    } else {
      return res.json({
        status: 401,
        message: "issue Not exist",
        success: false,
      });
    }
  } else {
    return res.json({
      status: 401,
      message: "invalid Issue",
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
        populate: { path: "videos", model: Video },
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
    return res.json({
      status: 200,
      message: "issue records",
      success: true,
      data: records,
    });
  } catch (err) {
    return res.json({ status: 500, message: err, success: false });
  }
};
exports.update = async (req, res) => {
  try {
    const issueId = req.params.id;
    const { title, description, notification } = req.body;
    const isExist = await Issue.find({ _id: issueId });
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
      let filterData = { search: issueId, type: "issues" };
      const searchIssueAlgo = await searchAlgolia(filterData);
      if (searchIssueAlgo.length > 0) {
        let obj = {
          objectID: searchIssueAlgo[0].objectID,
          title: title,
          description: description,
          notification: notification,
        };
        await updateAlgolia(obj, "issues");
      }
      return res.json({
        status: 200,
        message: "issue updated successfully",
        success: true,
        data: issue,
      });
    } else {
      return res.json({
        status: 500,
        message: "invalid issue",
        success: false,
      });
    }
  } catch (err) {
    return res.json({
      status: 500,
      message: "some thing went wrong",
      success: false,
    });
  }
};
exports.deleteIssue = async (req, res) => {
  const issueId = req.params.id;
  const isExist = await Issue.find({ _id: issueId });
  try {
    if (isExist.length > 0) {
      const deletedIssue = await Issue.findByIdAndRemove(issueId);
      let filterData = { search: issueId, type: "issues" };
      const searchIssueAlgo = await searchAlgolia(filterData);
      if (searchIssueAlgo.length > 0) {
        const objectID = searchIssueAlgo.ObjectId;
        await deleteAlgolia(objectID);
      }
      return res.json({
        status: 200,
        message: "issue deleted successfully",
        success: true,
      });
    } else {
      return res.json({
        status: 500,
        message: "invalid issue",
        success: false,
      });
    }
  } catch (err) {
    return res.json({
      status: 500,
      message: "some thing went wrong",
      success: false,
    });
  }
};
exports.messages = async (req, res) => {
  try {
    let records = req.body;
    const message = new Message(records);
    const savedMessage = await message.save();
    let messageId = savedMessage._id;
    await Issue.findByIdAndUpdate(
      { _id: records.issue },
      { $push: { messages: messageId } },
      { new: true }
    );
    return res.json({
      status: 200,
      message: "sent Message Successfully",
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    console.log("erero ", err);
    return res.json({
      status: 500,
      message: "Something Went wrong",
      success: false,
    });
  }
};
