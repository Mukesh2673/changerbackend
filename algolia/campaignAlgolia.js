const {Campaign} = require("../models");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  findObjectById,
} = require("../libs/algolia");

const mongoose = require("mongoose");
const { campaignListingPipeline } =require("../constants/commonAggregations")
const campaignRecords = async (id) => {
  try {   
     // Run the aggregation
    let pipeLine=campaignListingPipeline
    pipeLine.unshift({ $match: { _id: mongoose.Types.ObjectId(id) }});
    return await Campaign.aggregate(pipeLine);
  } catch (err) {
    console.log("value of err is", err);
  }
};

exports.updateCampaignInAlgolia = async (id) => {
  try {
    let records = await campaignRecords(id);
    const campaign = records[0];
    const algoliaObjectId = campaign?.algolia;
    let searchAlgo = []
    if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "campaigns");
    }
    else{
      let filtercampaignAlgolia = { search: id, type: "campaigns" };
      searchAlgo = await searchAlgolia(filtercampaignAlgolia);
    }
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == campaign?._id) {
      const campaignAlgoId = searchAlgo[0].objectID;
        const algoliaObject = {
        objectID: campaignAlgoId,
        title: campaign?.title,
        cause: campaign?.cause,
        image: campaign?.image,
        hashtags: campaign?.hashtags,
     };
      await updateAlgolia(algoliaObject, "campaigns");
      if (!algoliaObjectId) {
      await Campaign.updateOne({ _id: id }, { algolia:  searchAlgo[0].objectID });
      }
      return true;
    } else {
      let geoCoordinate=records[0]?.location?.coordinates
      records[0]['_geoloc']={
        "lat": geoCoordinate[1],
        "lng": geoCoordinate[0]
      }
      delete records[0]?.location 
      let obj=await saveAlgolia(records, "campaigns");
      let objectID = obj.objectIDs[0];
      await Campaign.updateOne({ _id: id }, { algolia: objectID });
      return true;
    }
  } catch (err) {
    console.log("err", err);
    return false;
  }
};

exports.addCampaignInAlgolia = async (id) => {
  try {
    let records = await campaignRecords(id);
    let geoCoordinate=records[0]?.location?.coordinates
    records[0]['_geoloc']={
      "lat": geoCoordinate[1],
      "lng": geoCoordinate[0]
    }
    delete records[0]?.location
    let obj=await saveAlgolia(records, "campaigns");
    let objectID = obj.objectIDs[0];
    await Campaign.updateOne({ _id: id }, { algolia: objectID });
    return true;
  } catch (err) {
    console.log('err isafdasf',err)
    return false;
  }
};
