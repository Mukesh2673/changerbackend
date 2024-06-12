const { Issue} = require("../models");

const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
  findObjectById,
} = require("../libs/algolia");

const issueRecords = async (id) => {
  try {
    const issueId = id;
    let records = await Issue.find({ _id: issueId });
    return records;
  } catch (err) {
    console.log("valeu of issue error is", err);
  }
};
exports.updateIssueInAlgolia = async (id) => {
  try {
    let issueRecord = await issueRecords(id);
    const issues = issueRecord[0];
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
        location: issues.location,
        description: issues.description,
        views: issues?.views,
        notification: issues?.notification,
        campaign: issues?.campaign,
        advocate: issues?.advocate,
        votes: issues?.votes,
        messages: issues?.messages,
        hashtags: issues?.hashtags,
        joined: issues?.joined,
        issueState: issues?.issueState,
        _id: issues?._id,
        title: issues?.title,
        user: issues?.user,
        cause: issues?.cause,
        address: issues?.address,
        createdAt: issues?.createdAt,
        updatedAt: issues?.updatedAt,
        video: issues?.video,
      };
      await updateAlgolia(algoliaObject, "issues");
      if (!algoliaObjectId) {
        await Issue.updateOne({ _id: id }, { algolia: searchAlgo[0].objectID });
      }
      return true;
    }else {
      let obj = await saveAlgolia(issueRecord, "issues");
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
    const issueAlgoId = searchAlgo[0].objectID;
    await deleteAlgolia(issueAlgoId);
}

exports.addIssueInAlgolia = async (id) => {
    try {
      let records = await issueRecords(id);
      const issues = records[0];
      await saveAlgolia(issues, "issues");
      return true;
    } catch (err) {
      return false;
    }
  };