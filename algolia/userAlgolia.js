const { User } = require("../models");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
  findObjectById,
} = require("../libs/algolia");
const userRecords = async (id) => {
  try {
    return await User.find({ _id: id });
    // Run the aggregation
  } catch (err) {
    console.log("value of err is", err);
  }
};

exports.updateUsersInAlgolia = async (id) => {
  try {
    let userRecord = await userRecords(id);
    const users = userRecord;
    const algoliaObjectId = users[0]?.algolia;
    let searchAlgo = [];
    if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "users");
    } else {
      let filteruserAlgolia = { search: id, type: "users" };
      searchAlgo = await searchAlgolia(filteruserAlgolia);
    }
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == users?._id) {
      const userAlgoId = searchAlgo[0].objectID;
      const algoliaObject = {
        objectID: userAlgoId,
        first_name: users?.first_name,
        last_name: users?.last_name,
        email: users?.email,
        username: users?.username,
        uid: users?.uid,
        dob: users?.dob,
        profileImage: users?.profileImage,
        karmaPoint: users?.karmaPoint,
        _id: users?._id,
        uid: users?.uid,
        followers: users?.followers,
        following: users?.following,
        updatedAt: users?.updatedAt,
        language: users?.language,
        privacy: users?.privacy,
        cause: users?.cause,
        endorsed_campaigns: users?.endorsed_campaigns,
      };
      await updateAlgolia(algoliaObject, "users");
      if (!algoliaObjectId) {
        await User.updateOne({ _id: id }, { algolia:  searchAlgo[0].objectID });
        }
      return true;
    } else {
      const records = await User.find({ _id: id });
      let obj = await saveAlgolia(records, "users");
      let objectID = obj.objectIDs[0];
      await User.updateOne({ _id: id }, { algolia: objectID });
    }
  } catch (err) {
    console.log("err", err);
    return false;
  }
};

exports.addUserInAlgolia = async (id) => {
  try {
    let records = await userRecords(id);
    const user = records[0];
    await saveAlgolia(user, "users");
    return true;
  } catch (err) {
    return false;
  }
};