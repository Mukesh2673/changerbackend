const { User } = require("../models");
const { saveAlgolia, searchAlgolia } = require("../libs/algolia");

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.users = async (req, res, next) => {
  try {
    const user = await User.find({});
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserByCognito = async (req, res, next) => {
  try {
    let userName=req.params.cuid
    console.log("id is",userName)
    const existingUser = await User.findOne({cognitoUsername:userName});
    if (existingUser) {
      return res.status(200).json({ message: "username-exists",user:existingUser,status:403 });
    }
    else{
      return res.status(200).json({ message: "username not exist",status:200 });

    }

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
    cognitoUsername:req.body.cognitoUsername,
    followers: [],
    follower: [],
    bio: req.body.bio ? req.body.bio:"",
  });
  try {
    const savedUser = await user.save();
    const userId = savedUser._id;
    const records = await User.find({ _id: userId });
    saveAlgolia(records, "users");
    return res.status(200).json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.cause = async (req, res, next) => {
  const {cause,uid}=req.body
  try {
    const existingUser =await User.findById(uid);
    if (existingUser) {
     let result=await User.updateOne({ _id: uid }, { cause: cause } );
      return res.status(200).json({ message: "cause added" });
    }
    else{
      return res.status(403).json({ message: "username not exists" });

    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  // const cause=req.body.cause

};
exports.delete=async (req,res)=>{
  try{
    let cognitoId=req.params.uid
    await User.deleteOne({ cognitoUsername:cognitoId});
    return res.json({ success: "User Deleted" });

  }
  catch(error)
  {
    return res.status(500).json({ message: error.message });

  }

}

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
  try {
    const id=req.params.id
    const updateUser = await User.findOneAndUpdate({ _id:id }, req.body);
    if(!updateUser)
    {
      return res.json({ status: 404, message: "Invalid User", success: false });


    }
    const user = await User.findById({ _id: id });
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.getFollowingVideos = async (req, res) => {
  const { cuid, fuid } = req.params;
  try {
    const user = await User.findById({ _id: cuid });
    let hasfollowed = false;

    //  const followers = user.followers.length;

    if (user.followers.includes(fuid)) {
      hasfollowed = true;

      return res.status(200).json({ followedUser: hasfollowed });
    } else {
      hasfollowed = false;

      return res.status(200).json({ followedUser: hasfollowed });
    }
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

exports.privacy=async (req,res)=>{
try{

  const {id,privacy}=req.body
  const updateUser = await User.findOneAndUpdate({ _id:id }, {privacy:privacy});
  
  const user = await User.findById({ _id: id });
  return res.status(200).json(user);

}
catch(e){
  return res.status(404).json({ error: e.message });

}
}
exports.language=async (req,res)=>{
  try{

    const {id,language}=req.body
    const updateUser = await User.findOneAndUpdate({ _id:id }, {language:language});
    const user = await User.findById({ _id: id });
    return res.status(200).json(user);
  
  }
  catch(e){
    return res.status(404).json({ error: e.message });
  
  }
}

