const { User, Report, Message, Notification, Issue } = require("../models");
const { sendMessage } = require("../libs/webSocket");
const moment = require("moment");
const { addUserInAlgolia, updateUserInAlgolia } = require("./userController");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

exports.notification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.find({ user: notificationId })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "user",
          model: User,
        },
        {
          path: "activity",
          model: User,
        },
        {
          path: "joinedIssue",
          model: Issue,
          populate: {
            path: "joined",
            model: User,
          },
        },
      ]);

    // Process notifications to remove joinedIssue if it is null or empty
    const processedNotifications = notification.map((notification) => {
      const notificationObj = notification.toObject();
      if (
        !notificationObj.joinedIssue ||
        notificationObj.joinedIssue.length === 0
      ) {
        delete notificationObj.joinedIssue;
      }
      return notificationObj;
    });

    //display records by today,yesterday,ThisWeek,Older
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");
    const startOfWeek = moment().startOf("week");

    const categorizedNotifications = {
      Today: [],
      Yesterday: [],
      ThisWeek: [],
      Older: [],
    };
    processedNotifications.forEach((notification) => {
      const createdAt = moment(notification.createdAt);
      if (createdAt.isSameOrAfter(today)) {
        categorizedNotifications.Today.push(notification);
      } else if (
        createdAt.isSameOrAfter(yesterday) &&
        createdAt.isBefore(today)
      ) {
        categorizedNotifications.Yesterday.push(notification);
      } else if (
        createdAt.isSameOrAfter(startOfWeek) &&
        createdAt.isBefore(yesterday)
      ) {
        categorizedNotifications.ThisWeek.push(notification);
      } else {
        categorizedNotifications.Older.push(notification);
      }
    });

    return res.json({
      status: 200,
      data: categorizedNotifications,
      success: true,
      message: "Notifications",
    });
  } catch (err) {
    console.log("value of err irs", err);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    let userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
      return res.status(500).json({ message: "Invalid User Id" });
    }
    let pipeLine = [
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "followers", //match records with impact video to display impact records
          pipeline: [
            {
              $lookup: {
                from: "videos",
                let: { userId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$user", "$$userId"] },
                          { $eq: ["$type", "IMPACT"] }, // Add your condition here
                        ],
                      },
                    },
                  },
                ],
                as: "impacts",
                pipeline: [{ $project: { _id: 1 } }],
              },
            },

            {
              $project: {
                _id: 1,
                username: 1,
                profileImage: 1,
                followers: 1,
                first_name: 1,
                last_name: 1,
                impacts: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following",
          pipeline: [
            {
              $lookup: {
                from: "videos",
                let: { userId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$user", "$$userId"] },
                          { $eq: ["$type", "IMPACT"] }, // Add your condition here
                        ],
                      },
                    },
                  },
                ],
                as: "impacts",
                pipeline: [{ $project: { _id: 1 } }],
              },
            },

            {
              $project: {
                _id: 1,
                username: 1,
                profileImage: 1,
                followers: 1,
                first_name: 1,
                last_name: 1,
                impacts: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following",
        },
      },
      {
        $lookup: {
          from: "campaignVolunteers",
          localField: "_id",
          foreignField: "user",
          as: "volunteering",
        },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "volunteering.campaign",
          foreignField: "_id",
          as: "volunteerCampaigns",
        },
      },
      {
        $lookup: {
          from: "campaignParticipation",
          localField: "volunteering.participation",
          foreignField: "_id",
          as: "campaignParticipation", //add join to the volunters that is relate to the participant
          pipeline: [
            {
              $lookup: {
                from: "campaignPhase",
                localField: "campaignParticipation.phaseId",
                foreignField: "_id",
                as: "campaingPhase",
              },
            },

            {
              $lookup: {
                from: "campaignVolunteers",
                localField: "_id",
                foreignField: "participation",
                as: "endorsed",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "endorsed.user",
                foreignField: "_id",
                as: "endorsed.user",
              },
            },

            // {$project: { _id: 1, roleTitle: 1, createdAt: 1, endorsed: 1 } }
          ],
        },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "user",
          as: "userCampaings",
        },
      },
      {
        $lookup: {
          from: "videos",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$type", "IMPACT"] }, // Add your condition here
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "campaigns",
                localField: "campaign",
                foreignField: "_id",
                as: "campaignDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails",
              },
            },
          ],
          as: "impacts",
        },
      },
      {
        $lookup: {
          from: "advocates",
          localField: "_id",
          foreignField: "user",
          as: "advocacy",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      first_name: 1,
                      last_name: 1,
                      username: 1,
                      profileImage: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                  { $project: { _id: 1, video_url: 1, thumbnail_url: 1 } },
                ],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "_id",
          foreignField: "user",
          as: "issues",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [{ $project: { _id: 1, username: 1 } }],
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "joined",
                foreignField: "_id",
                as: "joined",
                pipeline: [
                  { $project: { _id: 1, username: 1, profileImage: 1 } },
                ],
              },
            },
            {
              $project: {
                shared: 0,
                views: 0,
                notification: 0,
                messages: 0,
                hashtags: 0,
                __v: 0,
                video: 0,
              },
            }, //hide issue fields
          ],
        },
      },

      {
        $project: {
          _id: "$_id",
          first_name: "$first_name",
          last_name: "$last_name",
          email: "$email",
          username: "$username",
          uid: "$uid",
          dob: "$dob",
          karmaPoint: "$karmaPoint",
          following: "$following",
          followers: "$followers",
          supportedCampaigns: {
            $concatArrays: ["$userCampaings", "$volunteerCampaigns"],
          },
          volunteeringExperience: "$campaignParticipation",
          impacts: "$impacts",
          advocacy: "$advocacy",
          issues: "$issues",
        },
      },
    ];
    const user = await User.aggregate(pipeLine);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.users = async (req, res, next) => {
  try {
    const user = await User.find({});
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserByCognito = async (req, res, next) => {
  try {
    let userName = req.params.cuid;
    const existingUser = await User.findOne({ cognitoUsername: userName });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "username-exists", user: existingUser, status: 403 });
    } else {
      return res
        .status(200)
        .json({ message: "username not exist", status: 200 });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserByUID = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res, next) => {
  const user = new User({
    username: req.body.first_name + req.body.last_name,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    dob: req.body.dob,
    uid: req.body.uid,
    email: req.body.email,
    cognitoUsername: req.body.cognitoUsername,
    followers: [],
    follower: [],
    bio: req.body.bio ? req.body.bio : "",
  });
  try {
    const savedUser = await user.save();
    const userId = savedUser._id;
    await addUserInAlgolia(userId);
    return res.status(200).json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.cause = async (req, res, next) => {
  const { cause, uid } = req.body;
  try {
    const existingUser = await User.findById(uid);
    if (existingUser) {
      await User.updateOne({ _id: uid }, { cause: cause });
      updateUserInAlgolia(uid);
      return res.status(200).json({ message: "cause added" });
    } else {
      return res.status(403).json({ message: "username not exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  // const cause=req.body.cause
};
exports.delete = async (req, res) => {
  try {
    let cognitoId = req.params.uid;
    const user = await User.deleteOne({ cognitoUsername: cognitoId });
    await deleteAlgolia(user._id);
    return res.json({ success: "User Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.followUser = async (req, res) => {
  const { cuid, fuid } = req.params;
  try {
    const currentUser = await User.find({ _id: cuid });

    if (!currentUser || currentUser.length < 1) {
      return res.json({
        status: 401,
        message: "invalid Login User",
        success: false,
      });
    }
    const followUser = await User.find({ _id: fuid });
    if (!followUser || followUser.length < 1) {
      return res.json({
        status: 401,
        message: "invalid following User",
        success: false,
      });
    }
    if (
      followUser[0]?.followers?.length > 0 &&
      followUser[0]?.followers?.includes(cuid)
    ) {
      return res.json({
        status: 400,
        message: "User already followed",
        success: false,
      });
    }

    // add current user's id to users followers array
    const follow = await User.updateOne(
      { _id: fuid },
      { $push: { followers: cuid } },
      { new: true }
    );

    //Add users id to my followings array
    const following = await User.updateOne(
      { _id: cuid },
      { $push: { following: fuid } }
    );
    await updateUserInAlgolia(fuid);
    await updateUserInAlgolia(cuid);

    // Get followers
    const followers = await User.find({ _id: fuid }).populate([
      {
        path: "followers",
        populate: { path: "User", model: User },
      },
    ]);

    const followMessage = `${currentUser[0].first_name} ${currentUser[0].last_name} follow  you`;
    const notification = new Notification({
      messages: followMessage,
      user: fuid,
      activity: currentUser._id,
      notificationType: "followUser",
    });
    await notification.save();
    const uid = currentUser._id.toString();
    sendMessage("follow", likeMessage, uid);
    return res.json({
      status: 200,
      message: "User followed sucessfully!",
      success: true,
      data: followers,
    });
  } catch (e) {
    console.log("err is", e);
    return res.json({
      status: 500,
      message: e,
      success: e,
    });
  }
};

exports.unFollowUser = async (req, res) => {
  const { cuid, fuid } = req.params;
  try {
    const currentUser = await User.find({ _id: cuid });

    if (!currentUser || currentUser.length < 1) {
      return res.json({
        status: 401,
        message: "invalid Login User",
        success: false,
      });
    }
    const followUser = await User.find({ _id: fuid });
    if (!followUser || followUser.length < 1) {
      return res.json({
        status: 401,
        message: "invalid following User",
        success: false,
      });
    }
    if (
      followUser[0]?.followers?.length > 0 &&
      !followUser[0]?.followers?.includes(cuid)
    ) {
      return res.json({
        status: 400,
        message: "User not followed",
        success: false,
      });
    }

    // console.log("follow euser is",followUser)

    // add current user's id to users followers array
    const follow = await User.updateOne(
      { _id: fuid },
      { $pull: { followers: cuid } },
      { new: true }
    );
    //Add users id to my followings array
    const following = await User.updateOne(
      { _id: cuid },
      { $pull: { following: fuid } },
      { new: true }
    );
    await updateUserInAlgolia(fuid);
    await updateUserInAlgolia(cuid);
    // Get followers
    const followers = await User.find({ _id: fuid }).populate([
      {
        path: "followers",
        populate: { path: "User", model: User },
      },
    ]);

    //Get following
    const followingCurrentUser = await User.find({ _id: cuid }).populate([
      {
        path: "following",
        populate: { path: "User", model: User },
      },
    ]);

    return res.json({
      status: 200,
      message: "user unfollow sucessfully",
      success: true,
      data: followers,
    });
  } catch (e) {
    return res.json({
      status: 500,
      message: e,
      success: true,
    });
  }
};

exports.editProfile = async (req, res) => {
  const { id: _id } = req.params;
  try {
    const id = req.params.id;
    const updateUser = await User.findOneAndUpdate({ _id: id }, req.body);
    await updateUserInAlgolia(_id);
    if (!updateUser) {
      return res.json({ status: 404, message: "Invalid User", success: false });
    }
    const user = await User.findById({ _id: id });
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.removeProfileImage = async (req, res) => {
  try {
    const id = req.params.id;
    const updateUser = await User.findOneAndUpdate(
      { _id: id },
      { $unset: { profileImage: "" } },
      { new: true } // to return the updated document
    );
    await updateUserInAlgolia(_id);
    if (!updateUser) {
      return res.json({ status: 404, message: "Invalid User", success: false });
    }
    return res.json({
      status: 200,
      message: "Profile image removed successfully",
      user: updateUser,
      success: true,
    });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getFollowingVideos = async (req, res) => {
  const { cuid, fuid } = req.params;
  try {
    const user = await User.findById({ _id: cuid });
    let hasfollowed = false;
    //  const followers = user.followers.length;
    if (user.followers.includes(fuid)) {
      hasfollowed = true;

      return res.status(200).json({ followedUser: hasfollowed });
    } else {
      hasfollowed = false;

      return res.status(200).json({ followedUser: hasfollowed });
    }
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.privacy = async (req, res) => {
  try {
    const { id, privacy } = req.body;
    const updateUser = await User.findOneAndUpdate(
      { _id: id },
      { privacy: privacy }
    );
    const user = await User.findById({ _id: id });
    await updateUserInAlgolia(_id);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.language = async (req, res) => {
  try {
    const { id, language } = req.body;
    const updateUser = await User.findOneAndUpdate(
      { _id: id },
      { language: language }
    );
    const user = await User.findById({ _id: id });
    updateUserInAlgolia(_id);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.report = async (req, res) => {
  try {
    let records = req.body;
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

exports.message = async (req, res) => {
  try {
    const records = req.body;
    const message = new Message(records);
    const savedMessage = await message.save();
    let messageId = savedMessage._id;
    await User.findByIdAndUpdate(
      { _id: records.profile },
      { $push: { messages: messageId } },
      { new: true }
    );
    await updateUserInAlgolia(_id);
    sendMessage("message", message, records.profile);
    return res.json({
      status: 200,
      message: "Message sent successfully!",
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    console.log("error is", err);
    return res.json({
      status: 500,
      message: "Something went wrong!",
      success: false,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { pid, uid } = req.params;
    let records = await Message.find({
      $or: [
        { sender: uid, profile: pid }, // Messages sent from uid to pid
        { sender: pid, profile: uid },
      ],
      $and: [{ profile: { $exists: true, $ne: null } }],
    }).populate([
      {
        path: "sender",
        populate: { path: "user", model: User },
      },
      {
        path: "profile",
        populate: { path: "User", model: User },
      },
    ]);
    return res.json({
      status: 200,
      message: "messages records",
      success: true,
      data: records,
    });
  } catch (err) {
    return res.json({ status: 500, message: err, success: false });
  }
};

//get all Messages
exports.messages = async (req, res) => {
  try {
    const userId = req.user._id;
    let records = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { profile: userId }],
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by created date in descending order
      },
      {
        $group: {
          _id: {
            sender: "$sender",
            profile: "$profile",
          },
          latestMessage: { $first: "$$ROOT" }, // Take the first document in each group (latest due to sort)
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" }, // Replace root with the latest message
      },
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
      {
        $lookup: {
          from: "users",
          localField: "profile",
          foreignField: "_id",
          as: "profile",
        },
      },
      {
        $unwind: "$profile",
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $unwind: { path: "$campaign", preserveNullAndEmptyArrays: true }, // Campaign may be null, preserve it
      },
    ]);

    return res.json({
      status: 200,
      message: "Message records",
      success: true,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  }
};
