const { User, Report, Message, Notification, Issue } = require("../models");
const { sendMessage } = require("../libs/webSocket");
const moment = require("moment");
const { addUserInAlgolia, updateUsersInAlgolia } = require("../algolia/userAlgolia");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const {uploadImage, removeImage}=require("../libs/fileUpload")

exports.notification = async (req, res) => {
  try {
    const user=req.user
    const notification = await Notification.find({ user: user })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "user",
          model: User,
          select: "_id profileImage first_name last_name username", // Specify the fields you want to select

        },
        {
          path: "activity",
          model: User,
          select: "_id profileImage first_name last_name username", // Specify the fields you want to select

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
      message:  res.__("NOTIFICATION_RETERIVED")
    });
  } catch (err) {
    console.log("value of err irs", err);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};

exports.getUser = async (req, res) => {
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
                followers: { $size: "$followers" },
                profileImage: 1,
                first_name: 1,
                last_name: 1,
                impacts: { $size: "$impacts" },
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
                followers: { $size: "$followers" },
                first_name: 1,
                last_name: 1,
                impacts: { $size: "$impacts" },
              },
            },
          ],
        },
      },
      //get campaign from volunteering
      {
        $lookup: {
          from: "campaignVolunteers",
          localField: "_id",
          foreignField: "user",
          as: "volunteering",
          pipeline:[
            {
              $match: { approved: true }
            },
          {
            $lookup: {
              from: "campaigns",
              localField: "campaign",
              foreignField: "_id",
              as: "campaign",
              pipeline: [{ $project: { cause: 1, title:1, _id:0 } }],
            },
          },
          {
            $lookup: {
              from: "campaingVolunteering",
              localField: "volunteering",
              foreignField: "_id",
              as: "volunteering",
              pipeline: [ 
                {
                  $lookup: {
                       from: "campaignVolunteers",
                        localField: "_id",
                        foreignField: "volunteering",
                        as: "users",
                        pipeline:[
                                  {
                                    $lookup: {
                                    from: "users",
                                    localField: "user",
                                    foreignField: "_id",
                                    as: "endorsedUser",
                                    pipeline: [{ $project: { username: 1, first_name:1, last_name:1 } }], 
                                  }
                                },
                                {
                                  $project: { endorsedUser: 1,_id:0} 
                                }
                              ]
                        },
                     }, 
                       { $project: { roleTitle: 1, _id:1, createdAt:1,users:1} }
              ],
            },
          },
        ] 
       },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "volunteering.campaign",
          foreignField: "_id",
          as: "volunteerCampaigns",
          pipeline:[           
           {
            $lookup:  {
              from: "campaignPhase",
              localField: "phases",
              foreignField: "_id",
              as: "phases",
              pipeline:[
                {
                    $lookup: {
                      from: "campaignDonation",
                      localField: "donation",
                      foreignField: "_id",
                      as: "campaignDonation",
                      pipeline:[{
                        $project:{
                          description:1,
                          amount: 1,
                          _id: 0
                        }
                      }]
                    },
                },
                {
                  $lookup: {
                    from: "campaingVolunteering",
                    localField: "volunteering",
                    foreignField: "_id",
                    as: "volunteering",
                    pipeline:[{$project:{participant: 1,roleTitle:1, _id:0}}]
                  },
                },
                {
                  $project:{
                    "donation": "$campaignDonation",
                    "volunteering":"$volunteering",
                  }
                }

              ]
            },
           },
           {
            $lookup: {
              from: "advocates",
              localField: "advocate",
              foreignField: "_id",
              as: "advocate",
              pipeline:[
                {
                  $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                      {
                        $project: {
                          profileImage: 1,
                          _id :0
                        },
                      },
                    ],
                  },
                },
                {
                  $project: {
                    user: 1,
                    _id: 0
                  },
                }
              ]
            }
           },
          {
            $project:{
              title: 1,
              phases: 1,
              cause: 1,
              image: 1,
              advocate: 1,
              createdAt: 1
            }
          }
          ]
        },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "user",
          as: "userCampaings",
          pipeline:[           
            {
             $lookup:  {
               from: "campaignPhase",
               localField: "phases",
               foreignField: "_id",
               as: "phases",
               pipeline:[
                 {
                     $lookup: {
                       from: "campaignDonation",
                       localField: "donation",
                       foreignField: "_id",
                       as: "campaignDonation",
                       pipeline:[{
                         $project:{
                           description:1,
                           amount: 1,
                           _id: 0
                         }
                       }]
                     },
                 },
                 {
                   $lookup: {
                     from: "campaingVolunteering",
                     localField: "volunteering",
                     foreignField: "_id",
                     as: "volunteering",
                     pipeline:[{$project:{participant: 1,roleTitle:1, _id:0}}]
                   },
                 },
                 {
                   $project:{
                     "donation": "$campaignDonation",
                     "volunteering":"$volunteering",
                   }
                 }
 
               ]
             },
           },
           {
            $lookup: {
              from: "advocates",
              localField: "advocate",
              foreignField: "_id",
              as: "advocate",
              pipeline:[
                {
                  $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                      {
                        $project: {
                          profileImage: 1,
                        },
                      },
                    ],
                  },
                }
              ]
            }
           },
           {
             $project:{
               title: 1,
               phases: 1,
               cause: 1,
               image: 1,
               advocate: 1,
               createdAt: 1
             }
           }
           ]
          
        },
      },
      //get impact video records with issue and campaign details
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
                as: "campaign",
                pipeline:[
                  { $project: { _id: 0,title:1,cause:1 }
                }]
              },
            },
            {
              $lookup: {
                from: "issues",
                localField: "issue",
                foreignField: "_id",
                as: "issue",
                pipeline:[
                  { $project: { _id: 0,title:1,cause:1 }
                }]
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline:[
                  {
                    $project: { _id: 1 , first_name:1, last_name:1, username:1 } 
                  }  
                ]
              },
            },
            {
              $project: { _id: 1 , user:1, views: 1, video_url: 1,campaign: 1, issue: 1, description: 1}   
            }
          ],
          as: "impacts",
        },
      },
      //advocay of users
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
              from: "campaigns",
              localField: "campaign",
              foreignField: "_id",
              as: "campaign",
              pipeline: [{ $project: { _id: 1, title: 1, cause: 1 } }],
              }

            },
            {
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                  { $project: { _id: 1, video_url: 1, thumbnail_url: 1, views:1} },
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
                algolia: 0,
                shared: 0,
                campaign:0,
                advocate:0,
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
        $lookup: {
          from: "skills",
          localField: "skills",
          foreignField: "_id",
          as: "skills",
          pipeline: [
            {
              $lookup:{
                from: "users",
                localField: "users",
                foreignField: "_id",
                as: "endorseUser",
                pipeline: [
                  {
                     $project: {first_name:1, last_name:1 }
                  }
                ]
              }
            },
          { $project: { verified: 1, name:1, endorseUser: 1 }}
          ]         
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
          volunteeringExperience: "$volunteering",
           impacts: "$impacts",
           advocacy: "$advocacy",
           issues: "$issues",
           skills: "$skills"
        },
      },
    ];
    const user = await User.aggregate(pipeLine);
    return res.json({message : res.__("USER_RECORDS_RETERIVED"), data: user, status: 200});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.users = async (req, res) => {
  try {
    const user = await User.find({});
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserByCognito = async (req, res) => {
  try {
    let userName = req.params.cuid;
    const existingUser = await User.findOne({ cognitoUsername: userName });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: res.__("USER_RECORDS_RETERIVED"), user: existingUser, status:200 });
    } else {
      return res
        .status(400)
        .json({ message: res.__("USER_NOT_FOUND"), status: 400 });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.saveUserRecords = async (req, res) => {
  try{
    const userDetails=await User.find({cognitoUsername: req.body.cognitoUsername});
    if(userDetails.length>0)
    {
     let userId=userDetails[0]._id
     let records={
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      dob: req.body.dob,
      username: req.body.first_name + req.body.last_name,
     }
     let userRecords=await User.findOneAndUpdate({ _id: userId }, {records}, { new: true });
     updateUsersInAlgolia(userId) 
     return res.json({
        status: 200,
        message:  res.__("USER_SAVED"),
        data: userRecords,
        success: false,
      });
    }
    else{
      const user = new User({
        username: req.body.first_name + req.body.last_name,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        cognitoUsername: req.body.cognitoUsername
      });
      const savedUser = await user.save();
      const userId = savedUser._id;
      await addUserInAlgolia(userId);
      return res.json({
        status: 200,
        message: res.__("USER_SAVED"),
        data: savedUser,
        success: false,
      });
  
    }
  }
  catch(err)
  {
   return res.json({ status: 500, message: res.__("SERVER_ERROR"), success: false });
  }

}

exports.cause = async (req, res) => {
  const { cause } = req.body;
  const user =req.user
  try {
    const existingUser = await User.findById(user);
    if (existingUser) {
      // Check if the cause already exists in the user's cause array
      if (!existingUser.cause.includes(cause)) {
        await User.updateOne({ _id: user }, {
          $push: { cause: cause }
        });
        updateUsersInAlgolia(user);
        return res.status(200).json({ message: res.__("CAUSE_ADD_TO_PROFILE") });
      } else {
        return res.status(400).json({ message: res.__('CAUSE_ALREADY_EXIST_TO_PROFILE')});
      }
    } else {
      return res.status(403).json({ message: res.__("USER_NOT_FOUND")});
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = req.user
    const cognitoId = req.params.cid;
    const auth=await User.findById(user)
    if(cognitoId !== auth.cognitoUsername)
    {
      return res.json({
        status: 400,
        message: res.__("INVALID_COGNITO"),
        success: false,
      });
    }
    await User.deleteOne({ cognitoUsername: cognitoId });
    await deleteAlgolia(user);
    return res.json({ status: 200, message:  res.__("USER_DELETED"), success: true});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.followUser = async (req, res) => {
  const cuid= req.user //current user id
  const fuid=req.params.id; //user id to follow
  try {
        if (!mongoose.Types.ObjectId.isValid(fuid)) {
         return res.status(400).json({
            status: 400,
            error: res.__("INVALID_USER_ID_FORMAT"),
            success: false,
            });
         }
    const currentUser = await User.find({ _id: cuid });
    if (!currentUser || currentUser.length < 1) {
      return res.json({
        status: 401,
        message: res.__("INVALID_USER"),
        success: false,
      });
    }
    const followUser = await User.find({ _id: fuid });
    if (!followUser || followUser.length < 1) {
      return res.json({
        status: 401,
        message: res.__("INVALID_FOLLOWING_USER"),
        success: false,
      });
    }
    if (
      followUser[0]?.followers?.length > 0 &&
      followUser[0]?.followers?.includes(cuid)
    ) {
      return res.json({
        status: 400,
        message: res.__("ALREADY_FOLLOWED"),
        success: false,
      });
    }

    // add current user's id to users followers array
      await User.updateOne(
      { _id: fuid },
      { $push: { followers: cuid } },
      { new: true }
    );

    //Add users id to my followings array
      await User.updateOne(
      { _id: cuid },
      { $push: { following: fuid } }
    );
    await updateUsersInAlgolia(fuid);
    await updateUsersInAlgolia(cuid);

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
    sendMessage("follow", followMessage, fuid);
    return res.json({
      status: 200,
      message: res.__("USER_FOLLOWED_SUCCESSFULLY"),
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
  const cuid= req.user //current user id
  const fuid=req.params.id; //user id to follow
  try {
    if (!mongoose.Types.ObjectId.isValid(fuid)) {
      return res.status(400).json({
         status: 400,
         error: 	 res.__("INVALID_USER_ID_FORMAT"),
         success: false,
         });
    }
    const currentUser = await User.find({ _id: cuid });
    if (!currentUser || currentUser.length < 1) {
      return res.json({
        status: 401,
        message: res.__("INVALID_USER"),
        success: false,
      });
    }
    const followUser = await User.find({ _id: fuid });
    if (!followUser || followUser.length < 1) {
      return res.json({
        status: 401,
        message: res.__("INVALID_FOLLOWING_USER"),
        success: false,
      });
    }
    if (
      followUser[0]?.followers?.length==0  || followUser[0]?.followers?.length > 0 &&
      !followUser[0]?.followers?.includes(cuid)
    ){
      return res.json({
        status: 400,
        message: res.__("USER_NOT_FOLLOWED"),
        success: false,
      });
    }
    // add current user's id to users followers array
      await User.updateOne(
      { _id: fuid },
      { $pull: { followers: cuid } },
      { new: true }
    );
    //Add users id to my followings array
      await User.updateOne(
      { _id: cuid },
      { $pull: { following: fuid } },
      { new: true }
    );
    await updateUsersInAlgolia(fuid);
    await updateUsersInAlgolia(cuid);
    // Get followers
    const followers = await User.find({ _id: cuid }).populate([
      {
        path: "followers",
        populate: { path: "User", model: User },
      },
    ]);
    return res.json({
      status: 200,
      message: res.__("USER_UNFOLLOW_SUCCESSFULLY"),
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
  try {
    const id = req.user
    const user = await User.findById({ _id: id });
    const updateUser = await User.findOneAndUpdate({ _id: id }, req.body,{new:true});
    await updateUsersInAlgolia(id);
    if (!updateUser) {
      return res.json({ status: 404, message: res.__("INVALID_USER"), success: false });
    }

    return res.status(200).json({status : 200, message:res.__("USER_PROFILE_UPDATED"), data: updateUser});
  } catch (e) {
    return res.status(404).json({status : 404, message: e.message });
  }
};

exports.removeProfileImage = async (req, res) => {
  try {
    const id = req.user
    const user=await User.findById(id);
    const updateUser = await User.findOneAndUpdate(
      { _id: id },
      { $unset: { profileImage: "" } },
      { new: true } // to return the updated document
    );
    await updateUsersInAlgolia(id);
    if (!updateUser) {
      return res.json({ status: 404, message: res.__("INVALID_USER"), success: false });
    }
    if(user.profileImage)
    {
      let imagekey=user.profileImage.split('/')[1];
      //remove file from bucket
      await removeImage('profile', imagekey)
    }
    return res.json({
      status: 200,
      message: res.__("USER_PROFILE_REMOVED"),
      user: updateUser,
      success: true,
    });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.privacy = async (req, res) => {
  try {
    const user=req.user;
    const {status}=req.query
    const updateUser = await User.findOneAndUpdate(
      { _id: user },
      { privacy: status }
    );
    await updateUsersInAlgolia(user);
    return res.json({
      status: 200,
      message:  res.__("PRIVACY_UPDATED"),
      user: updateUser,
      success: true,
    });
  } catch (err) {
    console.log('err',err)
    return res.json({
      status: 500,
      message: res.__("SERVER_ERROR"),
      success: false,
    });
  }
};

exports.language = async (req, res) => {
  try {
    const user=req.user;
    const {language}=req.query
    const updateUser = await User.findOneAndUpdate(
      { _id: user },
      { language: language}
    );
    await updateUsersInAlgolia(user);
    return res.json({
      status: 200,
      message: res.__("LANGUAGE_UPDATED"),
      user: updateUser,
      success: true,
    });
  }catch (error){
    console.log('err', error)
    return res.json({
      status: 500,
      message:  res.__("SERVER_ERROR"),
      success: false,
    });
  }
};

exports.report = async (req, res) => {
  try {
    const user = req.user
    let records = req.body;
    records.reportedBy=user
    const report = new Report(records);
    const savedReports = await report.save();
    return res.json({
      status: 200,
      message:  res.__("REPORT_ADDED"),
      success: false,
      data: savedReports,
    });
  } catch (err) {
    return res.json({
      status: 500,
      message: res.__("SERVER_ERROR"),
      success: false,
    });
  }
};

exports.message = async (req, res) => {
  try {
    const user = req.user
    const records = req.body;
    records.sender=user
    const message = new Message(records);
    const savedMessage = await message.save();
    sendMessage("message", message, records.profile);
    return res.json({
      status: 200,
      message:  res.__("MESSAGE_SENT"),
      success: false,
      data: savedMessage,
    });
  } catch (err) {
    console.log("error is", err);
    return res.json({
      status: 500,
      message: res.__("SERVER_ERROR"),
      success: false,
    });
  }
};

//get specific user message with current user
exports.getMessages = async (req, res) => {
  try {
    const uid=req.user
    const pid=req.params.id
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
      message:  res.__("MESSAGE_RECORDS_SUCCESS"),
      success: true,
      data: records,
    });
  } catch (err) {
    console.log('errr',err)
    return res.json({ status: 500, message: err, success: false });
  }
};

//get last  Messages from profile or campaign
exports.messages = async (req, res) => {
  try {
    const userId = req.user;
    let records = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { profile: userId }],
        },
      },
      {
        $lookup:{
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
          pipeline:[
            {$project:{_id:1,username:1,first_name:1,last_name:1,profileImage:1}} 
          ]
        }
      },
      {
        $lookup:{
          from: "users",
          localField: "profile",
          foreignField: "_id",
          as: "profile",
          pipeline:[
            {$project:{_id:1,username:1,first_name:1,last_name:1,profileImage:1}} 
          ]
        }
      },
      {
        $lookup:{
          from: "campaigns",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
          pipeline:[
            {$project:{title:1,cause:1}} 
          ]
        }
      },
      {
        $sort: { createdAt: -1 }, // Sort by created date in descending order
      },
      {
        $group: {
          _id: {
            participants: {
              $cond: {
                if: { $gt: ["$sender", "$profile"] },
                then: ["$sender", "$profile"],
                else: ["$profile", "$sender"]
              }
            }
          },
          latestMessage: { $first: "$$ROOT" }, // Take the first document in each group (latest due to sort)
        },
      },

      {
        $replaceRoot: { newRoot: "$latestMessage" }, // Replace root with the latest message
      },

      {
        $sort: { createdAt: -1 }, // Sort the final results to get the latest one
      },
      {
        $project: {
          _id: "$_id",
           profile: "$profile",
           sender: "$sender",
           campaign: "$campaign",
           createdAt: "$createdAt"
        },
      },
      

    ]);

    return res.json({
      status: 200,
      message: res.__("MESSAGE_RECORDS_SUCCESS"),
      success:  true,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error,
      success: false,
      error: error.message,
    });
  }
};

//create Admin
exports.createAdmin = async (req, res) => {
  try {
    const user = req.user
    await User.findOneAndUpdate({ _id: user }, {role:'admin'}, { new: true });
    updateUsersInAlgolia(user) 
    return res.json({
      status: 200,
      message:  res.__("PROFILE_ROLE_CHANGE"),
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
      success: false,
      error: error.message,
    });
  }
};

//upload profile
exports.uploadProfile = async (req, res) => {
  try {
    const user=req.user
    const activeUser = await User.findById(user);
    if(activeUser.profileImage)
    {
      let imagekey=activeUser.profileImage.split('/')[1];
      //remove file from bucket
      await removeImage('profile', imagekey)
    }
    const thumbnail = await uploadImage(req.file, "profile");
    let data = `${thumbnail.Bucket}/${thumbnail.key}`;
    let updateRecord=await User.findByIdAndUpdate(user, { profileImage: data }, { new: true });
    return res.status(200).json({ message: res.__("PROFILE_UPLOADED"), image: data,user:updateRecord });
  } catch (error) {
    console.log('err',error)
    return res.status(500).json({ message: error.message, status: 500 });
  }
};
