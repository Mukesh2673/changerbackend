const { Video,Comment,User,Issue } = require("../models");
const { ObjectId } = require("mongodb");
const {
  searchAlgolia,
  updateAlgolia,
  saveAlgolia,
  deleteAlgolia,
  findObjectById,
} = require("../libs/algolia");

const videosRecords = async (id) => {
    return await Video.find({ _id: new ObjectId(id) })
      .sort({ createdAt: "desc" })
      .populate([
        {
          path: "comments",
          populate: [
            {
              path: "sender",
              model: "User",
            },
            {
              path: "likes",
              model: "commentsLikes",
            },
            {
              path: "replies",
              populate: [
                {
                  path: "sender", // Assuming "sender" is the field referencing the user who posted the reply
                  model: "User",
                },
                {
                  path: "likes",
                  model: "commentsLikes",
                },
              ],
  
              model: "RepliesComments",
            },
          ],
  
          model: Comment,
        },
  
        {
          path: "issue",
          populate: [
            {
              path: "user",
              model: User,
            },
            {
              path: "joined",
              model: User,
            },
          ],
          model: Issue,
        },
      ]);
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
        likes: videos.likes,
        comments: videos?.comments,
        hashtags: videos?.hashtags,
        user: videos?.user,
        description: videos?.description,
        video_url: videos?.video_url,
        video_id: videos?.video_id,
        encoding_id: videos?.encoding_id,
        encoding_status: videos?.encoding_status,
        thumbnail_url: videos?.thumbnail_url,
        type: videos?.type,
        createdAt: videos?.createdAt,
        updatedAt: videos?.updatedAt,
      };
      await updateAlgolia(algoliaObject, "videos");
      if (!algoliaObjectId) {
        await Video.updateOne({ _id: id }, { algolia:  searchAlgo[0].objectID });
    }
      return true;
    } else {
      let records = await videosRecords(id);
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
    const videos = records[0];
    await saveAlgolia(videos, "videos");
    return true;
  } catch (err) {
    return false;
  }
};