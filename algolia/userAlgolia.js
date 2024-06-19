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
    if (searchAlgo?.length > 0 && searchAlgo[0]?._id == users[0]?._id) {
      const userAlgoId = searchAlgo[0].objectID;
      const algoliaObject = {
        objectID: userAlgoId,
        first_name: users[0]?.first_name,
        last_name: users[0]?.last_name,
        email: users[0]?.email,
        username: users[0]?.username,
        uid: users[0]?.uid,
        dob: users[0]?.dob,
        profileImage: users[0]?.profileImage,
        karmaPoint: users[0]?.karmaPoint,
        _id: users[0]?._id,
        uid: users[0]?.uid || users[0]?.cognitoUsername,
        followers: users[0]?.followers,
        following: users[0]?.following,
        updatedAt: users[0]?.updatedAt,
        language: users[0]?.language,
        privacy: users[0]?.privacy,
        cause: users[0]?.cause,
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

exports.deleteUserInAlgolia = async (id) =>{
  let userRecord = await userRecords(id);
  const algoliaObjectId = userRecord?.algolia;
  let searchAlgo = [];
  if (algoliaObjectId) {
      searchAlgo = await findObjectById(algoliaObjectId, "users");
  }
  else
  {    
      let filterUserAlgolia = { search: id, type: "users" };
      searchAlgo = await searchAlgolia(filterUserAlgolia);
  }
  const userAlgoId = searchAlgo[0].objectID;
  await deleteAlgolia(userAlgoId);
}