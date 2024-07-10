const { searchAlgolia } = require("../libs/algolia");
const { Campaign, Issue, Video, User, SearchKeyWord } = require("../models");
const {campaignListingPipeline, issueListingPipeLine, impactListingPipeLine, userListingPipeLine} =require("../constants/commonAggregations")

//search from Algolia
// exports.search = async (req, res) => {
//   try {
//     const {searchKey, cause, hashtags, recordType, lat, lng}=req.query
//     console.log("req.query is",req.query)
//     const filter = {};
//     const query = req.query;
//     if (hashtags) {
//       const hashtagToFind = `#${query.tag}`;
//       const [campaigns, issues, videos] = await Promise.all([
//         Campaign.find({ hashtags: hashtagToFind }, "hashtags"),
//         Issue.find({ hashtags: hashtagToFind }, "hashtags"),
//         Video.find({ hashtags: hashtagToFind }, "hashtags"),
//       ]);
//       const allHashtags = campaigns
//         .map((c) => c.hashtags)
//         .concat(issues.map((i) => i.hashtags))
//         .concat(videos.map((v) => v.hashtags))
//         .flat();
//       const uniqueHashtags = [...new Set(allHashtags)];
//       return res.status(200).json({
//         hashtags: uniqueHashtags,
//       });
//     }
//     if (searchKey){
//       filter.search = query.searchKey;
//       let searchKeyWord= query.searchKey;
//       const searchKeyWordRecords=await SearchKeyWord.find({
//         name: new RegExp(`^${searchKeyWord}$`, "i"),
//       });
//       if(searchKeyWordRecords.length==0)
//       {
//          await new SearchKeyWord({name:searchKeyWord}).save();
//       }
//     }
//     if(Object.keys(query).length === 0){
//       return res
//         .status(500)
//         .json({ message: "invalid search key", status: 500 });
//     }
//     if (query?.lat && query?.lng) {
//       filter.location = [{ lat: query.lat, lng: query.lng }];
//     }
//     if (query?.cause) {
//       filter.cause = query?.cause;
//     }
//     if (query?.hashtags) {
//       filter.hashtags = query?.hashtags;
//     }
//     const arr = [
//       "campaigns",
//       "users",
//       "impacts",
//       "videos",
//       "issues",
//       "hashtags",
//     ];
//     let documentType=recordType.toLowerCase();
//     if (arr.includes(documentType)) {
//       filter.type = documentType;
//     } else {
//       const filters = [
//         { ...filter, type: "campaigns" },
//         { ...filter, type: "issues" },
//         { ...filter, type: "videos" },
//         { ...filter, type: "users" },
//       ];
//       const [campaigns, issues, videos, users] = await Promise.all(
//         filters.map((f) => searchAlgolia(f))
//       );
//       return res.status(200).json({
//         data: {
//           campaigns,
//           issues,
//           impact: videos,
//           users: users,
//         },
//         message:'Records retrieved View successfully.'
//       });
//     }
//     let records = await searchAlgolia(filter);
//     return res.status(200).json({ message: "records", data: records });
//   } catch (error) {
//     return res.status(500).json({ message: error.message, status: 500 });
//   }
// };

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
      { $match: filter },  // Apply the filter
      { $sample: { size: totalRecords } }, // Randomly sample all matching documents
      { $skip: skip }, // Skip the documents for pagination
      { $limit: pageSize }, // Limit the number of documents returned
      { $project: { _id: 0, name: 1 } } // Exclude _id and include only the name field
    ]);
    const totalPages = Math.ceil(totalRecords / pageSize);
    return res.status(200).json({
      message: "Records retrieved successfully",
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
exports.search = async (req, res)=>{
  let {searchKey, cause, hashtags, recordType, lat, lng} = req.query;
  recordType=recordType.toLowerCase();
  const filter = {}
  let location={} 
  if (lat && lng) {
    const coordinates = [parseFloat(lng), parseFloat(lng)];
    const distance = 1;
    const unitValue = 1000000;
    console.log('condfasfdasfd',coordinates)
    location={
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates,
        },

        maxDistance: distance * unitValue,
        distanceField: "distance",
        distanceMultiplier: 1 / unitValue,
        key: "location",
        spherical: true,
      },
    }
  }
    if(cause)
    {
      let causeArray=cause.split(',')
      let causeTags=[]
      causeArray.forEach((data)=>{
        causeTags=[...causeTags, data]
      })
      causeTags = causeArray.map(data => data.trim());
      filter.cause = { $in: causeTags };
      filter.$or = [
        { cause: { $in: causeTags } }, // Match any cause in causeTags
        { cause: { $all: causeTags } } // Match all causes in causeTags
      ];
    }
    if (searchKey){
      const searchKeyWordRecords=await SearchKeyWord.find({
        name: new RegExp(`^${searchKey}$`, "i"),
      });
      if(searchKeyWordRecords.length==0)
      {
         await new SearchKeyWord({name:searchKey}).save();
      }
      const regex = new RegExp(".*" + searchKey + ".*", "i");
      filter.$or = [{ cause: regex }, { title: regex }, {first_name: regex}, {last_name: regex }];
    }

    if(!recordType){
      const campaignPipeLine=[...campaignListingPipeline, {$match:filter}]
      const issuePipeLine=[...issueListingPipeLine,{$match:filter}]
      const impactPipeLine=[...impactListingPipeLine,{$match:filter}]
      const [campaigns, issues, videos] = await Promise.all([
        Campaign.aggregate(campaignPipeLine),
        Issue.aggregate(issuePipeLine),
        Video.aggregate(impactPipeLine)
      ]);
      return res.status(200).json({
        data: {
          campaigns:campaigns,
          issues:issues,
          impactVideos: videos
        }
      });
    }else
    {
      switch (recordType) {
        case 'issues':
          const issuePipeLine=[...issueListingPipeLine,{$match:filter}]
          if(lat && lng){ issuePipeLine.unshift(location)}; 
          console.log('pisssadfasfd',issuePipeLine)
          const issues = await Issue.aggregate(issuePipeLine);
          return res.status(200).json({
            data: {
              issues: issues
            }
          });
        case 'campaigns':
          const campaignPipeLine=[...campaignListingPipeline, {$match:filter}]
          if(lat && lng){ campaignPipeLine.unshift(location)}; 
          const campaigns = await Campaign.aggregate(campaignPipeLine);
          return res.status(200).json({
            data: {
              campaigns: campaigns
            }
          });
        case 'impact':
          const impactPipeLine=[...impactListingPipeLine,{$match:filter}]
          if(lat && lng){ impactPipeLine.unshift(location)}; 
          const videos = await Video.aggregate(impactPipeLine);
          return res.status(200).json({
            data: {
              impactVideos: videos
            }
          });
        case 'users':
          const userPipeLine=[{$match:filter},...userListingPipeLine, ]
          if(lat && lng){ userPipeLine.unshift(location)}; 
          const users = await User.aggregate(userPipeLine);
          return res.status(200).json({
            data: {
              users: users
            }
          });
        case 'hashtags':
          const [campaign, issue, video,user] = await Promise.all([
            Campaign.find(filter).select("hashtags -_id"),
            Issue.find(filter).select("hashtags -_id"),
            Video.find(filter).select("hashtags -_id"),
            User.find(filter).select("hashtags -_id")
          ]);      
        const hashtags = new Set();
        campaign.length>0 && campaign.forEach(campaign => {
          campaign.hashtags?.forEach(tag => {
            hashtags.add(tag);
          });
        });
        issue.length>0 && issue.forEach(issue => {
          issue?.hashtags?.forEach(tag => {
            hashtags.add(tag);
          });
        });
        video.length>0 && video.forEach(video => {
          video?.hashtags?.forEach(tag => {
            hashtags.add(tag);
          });
        });
        user.length>0 && user.forEach(user => {
          user?.hashtags?.forEach(tag => {
            hashtags.add(tag);
          });
        });
         return res.status(200).json({
            data: [...hashtags],
            message: [...hashtags].length>0 ? 'tags reterive successfully':'No tags found',
            status:[...hashtags].length>0? 200:400
          });  
        default:
          return res.status(400).json({
            message: "Invalid record type specified",
            status: 400
          });
        }
    }
  }

