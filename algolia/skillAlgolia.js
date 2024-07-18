const { Skills} = require("../models");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
  findObjectById,
} = require("../libs/algolia");

const skillRecords = async (id) => {
  try{
    return await Skills.find({_id:id}).select('user apperances verified _id name createAt')
  }
  catch(err)
  {
    console.log("err",err)
  }
  
};

exports.updateSkillInAlgolia = async (id) => { 
  try {
    let skillRecord = await skillRecords(id);
    const skill = skillRecord[0];
    const algoliaObjectId = skill?.algolia;
    let searchAlgo = [];
    if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "skills");
    } else {
      let filterSkillAlgolia = { search: id, type: "skills" };
      searchAlgo = await searchAlgolia(filterSkillAlgolia);
    }
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == skill?._id) {
      const skillAlgoId = searchAlgo[0].objectID;
      const algoliaObject = {
        objectID: skillAlgoId,
        verified: skill.verified
      };
      await updateAlgolia(algoliaObject, "skills");
      if (!algoliaObjectId) {
        await Skills.updateOne({ _id: id }, { algolia:  searchAlgo[0].objectID });
    }
      return true;
    } else {
      let records = await skillRecords(id);
      let obj = await saveAlgolia(records, "skills");
      let objectID = obj.objectIDs[0];
      await Skills.updateOne({ _id: id }, { algolia: objectID });
    }
  } catch (err) {
    console.log("err", err);
    return false;
  }
};

exports.deleteSkillInAlgolia = async (id) =>{
  let skillRecord = await skillRecords(id);
  const algoliaObjectId = skillRecord?.algolia;
  let searchAlgo = [];
  if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "skills");
  }
  else
  {    
      let filterSkillAlgolia = { search: id, type: "skills" };
      searchAlgo = await searchAlgolia(filterSkillAlgolia);
  }
  const skillAlgoId = searchAlgo[0]?.objectID;
  await deleteAlgolia(skillAlgoId);
}

exports.addSkillInAlgolia = async (id) => {
  try {
    let records = await skillRecords(id);
    let obj = await saveAlgolia(records, "skills");
    let objectID = obj.objectIDs[0];
    await Skills.updateOne({ _id: id }, { algolia: objectID });
    return true;
  } catch (err) {
    return false;
  }
};