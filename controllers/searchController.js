const { searchAlgolia } = require("../libs/algolia");
const { Campaign, Issue, Video, User } = require("../models");

//search from Algolia
exports.search = async (req, res) => {
  try {
    const filter = {};
    const query = req.query;
    if (query.type == "tags") {
      const hashtagToFind = `#${query.tag}`;
      const [campaigns, issues, videos] = await Promise.all([
        Campaign.find({ hashtags: hashtagToFind }, "hashtags"),
        Issue.find({ hashtags: hashtagToFind }, "hashtags"),
        Video.find({ hashtags: hashtagToFind }, "hashtags"),
      ]);
      const allHashtags = campaigns
        .map((c) => c.hashtags)
        .concat(issues.map((i) => i.hashtags))
        .concat(videos.map((v) => v.hashtags))
        .flat();
      const uniqueHashtags = [...new Set(allHashtags)];
      return res.status(200).json({
        hashtags: uniqueHashtags,
      });
    }

    if (query.searchKey) {
      filter.search = query.searchKey;
    }
    if (Object.keys(query).length === 0) {
      return res
        .status(500)
        .json({ message: "invalid search key", status: 500 });
    }
    if (query?.lat && query?.lng) {
      filter.location = [{ lat: query.lat, lng: query.lng }];
    }
    if (query?.cause) {
      filter.cause = query?.cause;
    }
    if (query?.hashtags) {
      filter.hashtags = query?.hashtags;
    }
    const arr = [
      "campaigns",
      "users",
      "impacts",
      "videos",
      "issues",
      "hashtags",
    ];
    if (arr.includes(query.type)) {
      filter.type = query.type;
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
        message:'Records retrieved View successfully.'
      });
    }
    let records = await searchAlgolia(filter);
    return res.status(200).json({ message: "records", data: records });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

//search from Mongodb
// exports.search = async (req, res)=>{
//   const query = req.query;
//   const searchKey = query.searchKey;
//   const type = query.type;
//   const lat= parseFloat(query.lat);
//   const lng = parseFloat(query.lng);
//   if (searchKey || (lat && lng)){
//     const filter = {}
//     if (searchKey) {
//       const regex = new RegExp(".*" + searchKey + ".*", "i");
//       filter.$or = [{ cause: regex }, { title: regex }, {first_name: regex}, {last_name: regex }];
//     }
//     if (lat && lng){
//       filter.location = {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [lng, lat]
//           },
//           $maxDistance: 10000 // Example: 10 km radius
//         }
//       }
//     }
//     const modelMap = {
//       campaigns: Campaign,
//       issues: Issue,
//       impact: Video,
//       users: User
//     };

//     if(!type){
//       const [campaigns, issues, videos] = await Promise.all([
//         Campaign.find(filter),
//         Issue.find(filter),
//         Video.find(filter)
//       ]);
//       return res.status(200).json({
//         data: {
//           campaigns,
//           issues,
//           impactVideos: videos
//         }
//       });
//     }else if (modelMap[type]) {
//       const results = await modelMap[type].find(filter);
//       return res.status(200).json({
//         data: {
//           [type]: results
//         }
//       });
//     }
//   }
//    if(type == 'tags')
//    {
//     const hashtagToFind = `#${query.tag}`;
//     const [campaigns, issues, videos] = await Promise.all([
//       Campaign.find({ hashtags: hashtagToFind}, 'hashtags'),
//       Issue.find({ hashtags: hashtagToFind }, 'hashtags'),
//       Video.find({ hashtags: hashtagToFind }, 'hashtags')
//     ]);
//     const allHashtags = campaigns.map(c => c.hashtags)
//     .concat(issues.map(i => i.hashtags))
//     .concat(videos.map(v => v.hashtags)).flat();
//      const uniqueHashtags = [...new Set(allHashtags)];
//       return res.status(200).json({
//       hashtags: uniqueHashtags
//     });
//    }
// }
