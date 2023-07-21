const { User } = require("../models");

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserByUID = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res, next) => {
  console.log("This is me right here: ", req.body);
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(403).json({ message: "username-exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const user = new User({
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    dob: req.body.dob,
    uid: req.body.uid,
    email: req.body.email,
    followers: [],
    follower: [],
    description: "",
  });

  try {
    const savedUser = await user.save();
    console.log("this is: ", savedUser);
    return res.status(200).json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.followUser = async (req, res) => {
  const { cuid, fuid } = req.params;

  try {
    // add current user's id to users followers array
    await User.updateOne({ _id: fuid }, { $push: { followers: cuid } });

    // Add users id to my followings array
    await User.updateOne({ _id: cuid }, { $push: { following: fuid } });

    // Get followers
    const user = await User.findById({ _id: fuid }).select("followers");

    return res.status(200).json({ user });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.unFollowUser = async (req, res) => {
  const { cuid, fuid } = req.params;

  try {
    // remove current user's id from users followers array
    await User.updateOne({ _id: fuid }, { $pull: { followers: cuid } });

    // remove users id from my followings array
    await User.updateOne({ _id: cuid }, { $pull: { following: fuid } });

    // Get followers
    const user = await User.findById({ _id: fuid }).select("followers");

    return res.status(200).json({ user });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.editProfile = async (req, res) => {
  const { id: _id } = req.params;
  console.log("this is the request's body", req.body);
  try {
    const updateUser = await User.findOneAndUpdate({ _id }, req.body);
    const user = await User.findById(_id);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};
