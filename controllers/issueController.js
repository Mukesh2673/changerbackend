const { User, Video, Issue,Upvotes } = require("../models");
const { saveAlgolia } = require("../libs/algolia");
const { generateTags } = require("./hashtagController");

const mongoose = require("mongoose");
require("dotenv").config();
const OpenAI=require("openai");
const issue = require("../models/issue/issue");


exports.issueRecords = async (query) => {
  let records = await Issue.find(query).populate([
    {
      path: "video",
      populate: { path: "videos", model: Video },
    },
    {
      path: "user",
      populate: { path: "User", model: User },
    }
  ]);
  return records;
};
exports.index = async (req, res, next) => {
  try {
    const query=[]
    if(req.query.location)
    {
      const location=JSON.parse(decodeURIComponent(req.query.location))
      const longitude = location[0];
      const latitude = location[1];
      const coordinates = [ parseFloat(longitude),parseFloat(latitude)];
      const distance = 1;
      const unitValue = 10000000;
      query.push({
        $geoNear:{
          near: {
              type: 'Point',
              coordinates: coordinates
          },
  
          maxDistance: distance * unitValue,
          distanceField: 'distance',
          distanceMultiplier: 1 / unitValue,
          key:"location"
      }
      }
      )
    }
    if(req?.query?.cause?.length>0){
      const cause=JSON.parse(decodeURIComponent(req.query.cause))
      query.push({$match:{ cause: { $in: cause } }});
    }
    query.push({
      $lookup: {
        from: 'users', // The name of the collection to join with
        localField: 'user', // The field from the input documents
        foreignField: '_id', // The field from the documents of the "from" collection
        as: 'user', // The alias for the resulting array of joined documents
      },
    })

    const issues = await Issue.aggregate(query);

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
    const coordinates = [ parseFloat(longitude),parseFloat(latitude)];
    const distance = 1;
    const unitValue = 10000000;
    const query = []; 
    query.push({
      $geoNear:{
        near: {
            type: 'Point',
            coordinates: coordinates
        },

        maxDistance: distance * unitValue,
        distanceField: 'distance',
        distanceMultiplier: 1 / unitValue,
        key:"location"
    }
    },
    {
      $lookup: {
        from: 'users', // The name of the collection to join with
        localField: 'user', // The field from the input documents
        foreignField: '_id', // The field from the documents of the "from" collection
        as: 'user', // The alias for the resulting array of joined documents
      },
    },
    {
      $lookup: {
        from: 'upvotes', // The name of the collection to join with
        localField: 'votes', // The field from the input documents
        foreignField: '_id', // The field from the documents of the "from" collection
        as: 'votes', // The alias for the resulting array of joined documents
      },
    },
    
    {
      $lookup: {
        from: 'videos', // The name of the collection to join with
        localField: 'video', // The field from the input documents
        foreignField: '_id', // The field from the documents of the "from" collection
        as: 'video', // The alias for the resulting array of joined documents
      },
    },
    {
      $project: {
        _id: 1,
        video:1,
        location:1,
        hashtags:1,
        title:1,
        cause:1,
        address:1,
        createdAt:1,
        updatedAt:1,
        videos:1,  
        user: 1,
        votes: {
          $size: {
            $filter: {
              input: '$votes',
              as: 'vote',
              cond: {
                $eq: ['$$vote.likes', true]
              }
            }
          }
        }
      }
    }

    )
    if (cause) {
      query.push({$match:{ cause: { $in: cause } }});
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
exports.generate=async (req,res,next)=>{
  try{
  let text=req.body.idea
  const openai = new OpenAI({
		apiKey: process.env.PUBLIC_OPEN_AI,
	});

  const chatCompletion = await openai.chat.completions.create({
    messages: [
   
      { role: "user", content:text},
    ],
    model: "gpt-3.5-turbo-0125",
  });
  const response=chatCompletion.choices[0].message.content 
  console.log("response is",response)
  return res.json({
    status: 200,
    message: "prompt generated successfully",
    success: true,
    text:response
  });
}
  catch(err)
  {
    console.log("errror",err)
    return res.json({ status: 500, message: err, success: false });

  }
}
exports.upvotes=async(req,res,next)=>{
  try{
    const {uid,issueId}=req.body
    const votes=await Upvotes.find({user:uid})
    if(votes.length<1)
    {
      const votes=new Upvotes({
        issue:issueId,
        user:uid
      });
     await votes.save()
     const voteId=votes._id
     const issue=await Issue.findByIdAndUpdate(
        { _id: issueId},
        { $push: { votes: voteId } },
        { new: true },
        
     );

      return res.json({
        status:200,
        message:"voted",
        success:true,
        data:votes
      })
    }
    else{
      let result =await Upvotes.findByIdAndUpdate(
        { _id: votes[0]._id },
        {
          $set: {
            likes: !votes[0].likes,
          },
        },
        { new: true },
      );
      return res.json({
        status:200,
        message:"voted",
        success:true,
        data:result

      })
      
    }
   
  }
  catch(err)
  {
    console.log("err is", err);
    return res.json({ status: 500, message: err, success: false });
  }
}
exports.userIssues=async(req,res)=>{
  try{
  const uid=req.params.uid
  let records = await Issue.find({user:uid}).populate([
    {
      path: "video",
      populate: { path: "videos", model: Video },
    },
    {
      path: "user",
      populate: { path: "User", model: User },
    }
  ]);
  return res.json({
    status: 200,
    message: "issue records",
    success: true,
    data: records,

  });
}
catch(err)
{
  console.log('errr is',err)
  return res.json({ status: 500, message: err, success: false });
}
};
