const { Video } = require("../models");

exports.index = async (req, res, next) => {
  try {
    const { page = 1, campaign, user } = req.query;

    const query = {
      encoding_status: "FINISHED",
    };

    if (!!campaign) {
      query["campaign"] = campaign;
    }

    if (!!user) {
      query["user"] = user;
    }

    const result = await Video.paginate(query, {
      page,
      sort: { createdAt: "desc" },
    });

    return res.json(result);
  } catch (error) {
    return res.json([]);
  }
};

exports.show = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!!video) {
      return res.json(video);
    }

    return res.status(404).json({ message: "Video not found." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.store = async (req, res, next) => {
  const user = req.user;

  const video = new Video({
    user: user._id,
    campaign: req.body.campaign,
    description: req.body.description,
    likes: [],
    video_url: req.body.video_url,
    video_id: req.body.video_id,
    encoding_id: req.body.encoding_id,
    encoding_status: req.body.encoding_status,
  });

  try {
    const savedVideo = await video.save();
    return res.status(200).json(savedVideo);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.likeVideo = async (req, res) => {
  const { vid, uid } = req.params;
  try {
    const video = await Video.findById({ _id: vid });
    let hasLiked = false;

    if (video.likes.includes(uid)) {
      // remove like
      await Video.updateOne({ _id: vid }, { $pull: { likes: uid } });
      hasLiked = false;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    } else {
      await Video.updateOne({ _id: vid }, { $push: { likes: uid } });
      hasLiked = true;
      const updatedVideo = await Video.findById({ _id: vid });
      const likes = updatedVideo.likes.length;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    }
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getFollowingVideos = async (req, res) => {
  const { uid } = req.params;

  try {
    const appVideos = await Video.find({});
    const followingVideos = [];

    for (let i = 0; i < appVideos.length; i++) {
      const video = appVideos[i];
      if (video.user?._id === uid) {
        followingVideos.push(video);
      }
    }

    return res.status(200).json({ followingVideos });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getVideoLikes = async (req, res) => {
  const { vid, uid } = req.params;
  try {
    const video = await Video.findById({ _id: vid });
    let hasLiked = false;

    const likes = video.likes.length;

    if (video.likes.includes(uid)) {
      hasLiked = true;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    } else {
      hasLiked = false;

      return res.status(200).json({ likedVideo: hasLiked, likes });
    }
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getCampaignImpactVideos = async (req, res) => {
  const { cid } = req.params;
  try {
    const appVideos = await Video.find({});
    const impactVideos = [];

    for (let i = 0; i < appVideos.length; i++) {
      const video = appVideos[i];

      if (video.campaign?._id === cid) {
        console.log("This one matches");
        impactVideos.push(video);
      }
      1;
    }

    return res.status(200).json({ impactVideos });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getUserImpactVideos = async (req, res) => {
  const { uid } = req.params;
  try {
    const appVideos = await Video.find({});
    const impactVideos = [];

    for (let i = 0; i < appVideos.length; i++) {
      const video = appVideos[i];
      if (video.user?._id === uid) {
        impactVideos.push(video);
      }
    }

    return res.status(200).json({ impactVideos });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.update = async (req, res, next) => {};

exports.delete = async (req, res, next) => {};

exports.encodingFinishedHook = (req, res, next) => {
  const encodingId = req.body?.encoding?.id;

  if (encodingId) {
    try {
      const query = {
        encoding_id: encodingId,
        encoding_status: "CREATED",
      };

      Video.updateMany(query, { encoding_status: "FINISHED" }).exec();
    } catch (error) {
      return res.json([]);
    }
  }

  return res.json([]);
};
