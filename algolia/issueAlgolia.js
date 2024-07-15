const { Issue} = require("../models");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
  findObjectById,
} = require("../libs/algolia");
const {issueListingPipeLine} =require("../constants/commonAggregations")
const mongoose = require("mongoose");
const issueRecords = async (id) => {
  try {
    let pipeLine=issueListingPipeLine
    pipeLine.unshift({ $match: { _id: mongoose.Types.ObjectId(id) }});
    return await Issue.aggregate(pipeLine);
  } catch (err) {
    console.log("err", err);
  }
};

exports.updateIssueInAlgolia = async (id) => {
  try {
    let records = await issueRecords(id);
    const issues = records[0];
    const algoliaObjectId = issues?.algolia;
    let searchAlgo = [];
    if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "issues");
    } else {
      let filterIssueAlgolia = { search: id, type: "issues" };
      searchAlgo = await searchAlgolia(filterIssueAlgolia);
    }
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == issues?._id) {
      const issueAlgoId = searchAlgo[0].objectID;
      const algoliaObject = {
        objectID: issueAlgoId,
        location: issues?.location,
        description: issues?.description,
        advocate: issues?.advocate,
        votes: issues?.votes,
        hashtags: issues?.hashtags,
        joined: issues?.joined,
        issueState: issues?.issueState,
        _id: issues?._id,
        title: issues?.title,
        user: issues?.user,
        cause: issues?.cause,
        address: issues?.address,
        createdAt: issues?.createdAt,
      };
      await updateAlgolia(algoliaObject, "issues");
      if (!algoliaObjectId) {
        await Issue.updateOne({ _id: id }, { algolia: searchAlgo[0].objectID });
      }
      return true;
    }else {
      let geoCoordinate=records[0]?.location?.coordinates
      records[0]['_geoloc']={
        "lat": geoCoordinate[1],
        "lng": geoCoordinate[0]
      }
      delete records[0]?.location 
      let obj = await saveAlgolia(records, "issues");
      let objectID = obj.objectIDs[0];
      await Issue.updateOne({ _id: id }, { algolia: objectID });
    }
  } catch (err) {
    console.log("err", err);
    return false;
  }
};

exports.deleteIssueInAlgolia = async (id) =>{
    let issueRecord = await issueRecords(id);
    const algoliaObjectId = issueRecord?.algolia;
    let searchAlgo = [];
    if (algoliaObjectId) {
        searchAlgo = await findObjectById(algoliaObjectId, "issues");
    }
    else
    {    
        let filterIssueAlgolia = { search: id, type: "issues" };
        searchAlgo = await searchAlgolia(filterIssueAlgolia);
    }
    const issueAlgoId = searchAlgo[0]?.objectID;
    await deleteAlgolia(issueAlgoId);
}

exports.addIssueInAlgolia = async (id) => {
    try {
      let records = await issueRecords(id);
      let geoCoordinate=records[0]?.location?.coordinates
      records[0]['_geoloc']={
        "lat": geoCoordinate[1],
        "lng": geoCoordinate[0]
      }
      delete records[0]?.location
      delete   records[0]?.algolia
      let obj=await saveAlgolia(records, "issues");
      let objectID = obj.objectIDs[0];
      await Issue.updateOne({ _id: id }, { algolia: objectID });
      return true;
    } catch (err) {
      return false;
    }
  };