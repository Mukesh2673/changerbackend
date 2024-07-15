const { Video} = require("../models");
const mongoose = require("mongoose");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
  findObjectById,
} = require("../libs/algolia");
const {impactListingPipeLine} =require("../constants/commonAggregations")

const videosRecords = async (id) => {
  try{
    let pipeLine=impactListingPipeLine
    pipeLine.unshift({ $match: { _id: mongoose.Types.ObjectId(id) }});
    return await Video.aggregate(pipeLine);
  }
  catch(err)
  {
    console.log("err",err)
  }
  
};

exports.updateVideosInAlgolia = async (id) => { 
  try {
    let videoRecord = await videosRecords(id);
    const videos = videoRecord[0];
    const algoliaObjectId = videos?.algolia;
    let searchAlgo = [];
    if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "videos");
    } else {
      let filteruserAlgolia = { search: id, type: "videos" };
      searchAlgo = await searchAlgolia(filteruserAlgolia);
    }
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == videos?._id) {
      const videoAlgoId = searchAlgo[0].objectID;
      const algoliaObject = {
        objectID: videoAlgoId,
        location: videos.location,
        hashtags: videos?.hashtags,
        user: videos?.user,
        campaign: videos?.campaign,
        issue: videos?.issue,
        description: videos?.description,
        video_url: videos?.video_url,
        video_id: videos?.video_id,
        thumbnail_url: videos?.thumbnail_url,
        createdAt: videos?.createdAt,
      };
      await updateAlgolia(algoliaObject, "videos");
      if (!algoliaObjectId) {
        await Video.updateOne({ _id: id }, { algolia:  searchAlgo[0].objectID });
    }
      return true;
    } else {
      let records = await videosRecords(id);
      let geoCoordinate=records[0]?.location?.coordinates
      records[0]['_geoloc']={
        "lat": geoCoordinate[1],
        "lng": geoCoordinate[0]
      }
      delete records[0]?.location 
      let obj = await saveAlgolia(records, "videos");
      let objectID = obj.objectIDs[0];
      await Video.updateOne({ _id: id }, { algolia: objectID });
    }
  } catch (err) {
    console.log("err", err);
    return false;
  }
};

exports.deleteVideosInAlgolia = async (id) =>{
  let videoRecord = await videosRecords(id);
  const algoliaObjectId = videoRecord?.algolia;
  let searchAlgo = [];
  if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "videos");
  }
  else
  {    
      let filterIssueAlgolia = { search: id, type: "videos" };
      searchAlgo = await searchAlgolia(filterIssueAlgolia);
  }
  const videoAlgoId = searchAlgo[0]?.objectID;
  await deleteAlgolia(videoAlgoId);
}

exports.addVideoInAlgolia = async (id) => {
  try {
    let records = await videosRecords(id);
    let geoCoordinate=records[0]?.location?.coordinates
    records[0]['_geoloc']={
      "lat": geoCoordinate[1],
      "lng": geoCoordinate[0]
    }
    delete records[0]?.location
    let obj = await saveAlgolia(records, "videos");
    let objectID = obj.objectIDs[0];
    await Video.updateOne({ _id: id }, { algolia: objectID });
    return true;
  } catch (err) {
    return false;
  }
};