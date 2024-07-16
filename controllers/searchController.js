const { searchAlgolia } = require("../libs/algolia");
const { Campaign, Issue, Video, User, SearchKeyWord } = require("../models");
const {campaignListingPipeline, issueListingPipeLine, impactListingPipeLine, userListingPipeLine} =require("../constants/commonAggregations")

//search from Algolia
exports.search = async (req, res) => {
  try {
    const {searchKey, cause, hashtags, recordType, lat, lng}=req.query
    const filter = {};
    const query = req.query;
    //validate search variable
    if(!(searchKey || hashtags))
    {
      return res
      .status(400)
      .json({ message: res.__("SEARCH_INVALID_KEY"), status: 400 });
    }
    if (hashtags){
      filter.hashtags =`#${hashtags}`;
    }
    if(cause){
      let causeArray=cause.split(',')
      causeTags = causeArray.map(data => data.trim());
      filter.cause = causeTags;
    }
    if (searchKey){
      filter.search = query.searchKey;
      let searchKeyWord= query.searchKey;
      const searchKeyWordRecords=await SearchKeyWord.find({
        name: new RegExp(`^${searchKeyWord}$`, "i"),
      });
      if(searchKeyWordRecords.length==0)
      {
         await new SearchKeyWord({name:searchKeyWord}).save();
      }
    }
    if (lat && lng) {
      filter.location = [{ lat: lat, lng: lng }];
    }
    const  documentCollection = [
      "campaigns",
      "users",
      "impacts",
      "videos",
      "issues",
      "hashtags",
    ];
    let documentType=recordType?.toLowerCase();
    //search from all collection when document type not define
    if (documentCollection.includes(documentType)) {
      filter.type = documentType;
    } else {
      const filters = [
        { ...filter, type: "campaigns" },
        { ...filter, type: "issues" },
        { ...filter, type: "videos" },
        { ...filter, type: "users" },
      ];
      const [campaigns, issues, videos, users] = await Promise.all(
        filters.map((f) => searchAlgolia(f))
      );
      return res.status(200).json({
        data: {
          campaigns,
          issues,
          impact: videos,
          users: users,
        },
        message: res.__("SEARCH_RECORD_RETERIVED")
      });
    }
    let records = await searchAlgolia(filter);
    if(recordType=='Hashtags')
    {
      let hashtagsArray=records.map((item)=>item.hashtags)
      let flattenedHashtags = hashtagsArray.flat().filter(tag => tag !== undefined);
      let uniqueHashtags = Array.from(new Set(flattenedHashtags));
      return res.status(200).json({ message: res.__("SEARCH_RECORD_RETERIVED"), data: uniqueHashtags });
    }
    return res.status(200).json({ message: res.__("SEARCH_RECORD_RETERIVED"), data: records });
  } catch (error) {
    console.log("errr",error)
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

//get search keyWord
exports.searchKeyword = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, searchKey } = req.query;
    const filter = {};
    if(searchKey)
    {
      filter.name = new RegExp(searchKey, "i");
    }
    const skip = (page - 1) * pageSize;
    const totalRecords = await SearchKeyWord.countDocuments(filter);
    const records = await SearchKeyWord.aggregate([
      { $match: filter },
      { $sample: { size: totalRecords } },
      { $limit: pageSize }, 
      { $project: { _id: 0, name: 1 } }
    ]);
    const totalPages = Math.ceil(totalRecords / pageSize);
    return res.status(200).json({
      message:res.__("SEARCH_RECORD_RETERIVED"),
      data: records,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

//search from Mongodb
// exports.search = async (req, res)=>{
//   let {searchKey, cause, hashtags, recordType, lat, lng} = req.query;
//   recordType=recordType?.toLowerCase();
//   const filter = {}
//   let location={} 
//   if (lat && lng) {
//     const coordinates = [parseFloat(lng),parseFloat(lat)];
//     const distance = 1;
//     const unitValue = 10000000;
//     location={
//       $geoNear: {
//         near: {
//           type: "Point",
//           coordinates: coordinates,
//         },

//         maxDistance: distance * unitValue,
//         distanceField: "distance",
//         distanceMultiplier: 1 / unitValue,
//         key: "location",
//       },
//     }
//   }
//   if(hashtags)
//   {
//     const hashtagToFind = `#${hashtags}`;
//     filter.hashtags= hashtagToFind 
//     const campaignPipeLine=[{$match:filter},...campaignListingPipeline]
//     const issuePipeLine=[{$match:filter},...issueListingPipeLine]
//     const impactPipeLine=[{$match:filter},...impactListingPipeLine]
//     const userPipeLine=[{$match:filter},...userListingPipeLine]
//     const [campaigns, issues, videos,users] = await Promise.all([
//       Campaign.aggregate(campaignPipeLine),
//       Issue.aggregate(issuePipeLine),
//       Video.aggregate(impactPipeLine),
//       User.aggregate(userPipeLine)
//     ]);
//     return res.status(200).json({
//       data: {
//         campaigns,
//         issues,
//         impactVideos: videos,
//         users
//         }});
//   }

//     if(cause)
//     {
//       let causeArray=cause.split(',')
//       let causeTags=[]
//       causeArray.forEach((data)=>{
//         causeTags=[...causeTags, data]
//       })
//       causeTags = causeArray.map(data => data.trim());
//       filter.cause = { $in: causeTags };
//       filter.$or = [
//         { cause: { $in: causeTags } }, // Match any cause in causeTags
//         { cause: { $all: causeTags } } // Match all causes in causeTags
//       ];
//     }
//     if (searchKey){
//       const searchKeyWordRecords=await SearchKeyWord.find({
//         name: new RegExp(`^${searchKey}$`, "i"),
//       });
//       if(searchKeyWordRecords.length==0)
//       {
//          await new SearchKeyWord({name:searchKey}).save();
//       }
//       const regex = new RegExp(".*" + searchKey + ".*", "i");
//       filter.$or = [{ cause: regex }, { title: regex }, {first_name: regex}, {last_name: regex }];
//     }

//     if(!recordType){
//       const campaignPipeLine=[...campaignListingPipeline, {$match:filter}]
//       const issuePipeLine=[...issueListingPipeLine,{$match:filter}]
//       const impactPipeLine=[...impactListingPipeLine,{$match:filter}]
//       const [campaigns, issues, videos] = await Promise.all([
//         Campaign.aggregate(campaignPipeLine),
//         Issue.aggregate(issuePipeLine),
//         Video.aggregate(impactPipeLine)
//       ]);
//       return res.status(200).json({
//         data: {
//           campaigns:campaigns,
//           issues:issues,
//           impactVideos: videos
//         }
//       });
//     }else
//     {
//       switch (recordType) {
//         case 'issues':
//           const issuePipeLine=[...issueListingPipeLine,{$match:filter}]
//           if(lat && lng){ issuePipeLine.unshift(location)}; 
//           const issues = await Issue.aggregate(issuePipeLine);
//           return res.status(200).json({
//             data: {
//               issues: issues
//             }
//           });
//         case 'campaigns':
//           const campaignPipeLine=[...campaignListingPipeline, {$match:filter}]
//           if(lat && lng){ campaignPipeLine.unshift(location)}; 
//           const campaigns = await Campaign.aggregate(campaignListingPipeline);
//           return res.status(200).json({
//             data: {
//               campaigns: campaigns
//             }
//           });
//         case 'impact':
//           const impactPipeLine=[...impactListingPipeLine,{$match:filter}]
//           if(lat && lng){ impactPipeLine.unshift(location)}; 
//           const videos = await Video.aggregate(impactPipeLine);
//           return res.status(200).json({
//             data: {
//               impactVideos: videos
//             }
//           });
//         case 'users':
//           const userPipeLine=[{$match:filter},...userListingPipeLine, ]
//           if(lat && lng){ userPipeLine.unshift(location)}; 
//           const users = await User.aggregate(userPipeLine);
//           return res.status(200).json({
//             data: {
//               users: users
//             }
//           });
//         case 'hashtags':
//           const [campaign, issue, video,user] = await Promise.all([
//             Campaign.find(filter).select("hashtags -_id"),
//             Issue.find(filter).select("hashtags -_id"),
//             Video.find(filter).select("hashtags -_id"),
//             User.find(filter).select("hashtags -_id")
//           ]);      
//         const hashtags = new Set();
//         campaign.length>0 && campaign.forEach(campaign => {
//           campaign.hashtags?.forEach(tag => {
//             hashtags.add(tag);
//           });
//         });
//         issue.length>0 && issue.forEach(issue => {
//           issue?.hashtags?.forEach(tag => {
//             hashtags.add(tag);
//           });
//         });
//         video.length>0 && video.forEach(video => {
//           video?.hashtags?.forEach(tag => {
//             hashtags.add(tag);
//           });
//         });
//         user.length>0 && user.forEach(user => {
//           user?.hashtags?.forEach(tag => {
//             hashtags.add(tag);
//           });
//         });
//          return res.status(200).json({
//             data: [...hashtags],
//             message: [...hashtags].length>0 ? 'tags reterive successfully':'No tags found',
//             status:[...hashtags].length>0? 200:400
//           });  
//         default:
//           return res.status(400).json({
//             message: "Invalid record type specified",
//             status: 400
//           });
//       }
//     }
//   }

