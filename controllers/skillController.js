const { Skills, User } = require("../models");

exports.skills = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const skip = (page - 1) * pageSize;
    const search = req.query.search || "";
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
      searchQuery.verified=true  
    const records = await Skills.find(searchQuery).select('_id name').skip(skip).limit(pageSize);
    const totalRecords = await Skills.countDocuments(searchQuery);
    return res.json({
      status: 200,
      skills: records,
      totalPage: Math.ceil(totalRecords / pageSize),
      success: true,
    });
  } catch (err) {
    console.log("err", err);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};

exports.addUserSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const skill = req.params.id;
    const skillRecords = await Skills.find({ _id: skill });
    if (skillRecords.length === 0) {
      return res.json({
        status: 400,
        message: "Skill not exist",
        success: false,
      });
    }
    const user = await User.findOne({ _id: userId });
    if (user.skills.includes(skill)) {
      return res.json({
        status: 400,
        message: "You have Already this skill",
        success: false,
      });
    } else {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { skills: skill } },
        { new: true }
      );
      return res.json({
        status: 200,
        message: "Skill added Successfully",
        success: true,
      });
    }
  } catch (err) {
    return res.json({
      status: 200,
      message: err.message,
      success: true,
    });
  }
};

exports.removeUserSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const skill = req.params.id;
    const skillRecords = await Skills.find({ _id: skill });
    if (skillRecords.length === 0) {
      return res.json({
        status: 400,
        message: "Skill not exist",
        success: false,
      });
    }
    const user = await User.findOne({ _id: userId });
    if (user.skills.includes(skill)) {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { skills: skill } },
        { new: true }
      );
      return res.json({
        status: 200,
        message: "Skill Removed Successfully",
        success: true,
      });
    } else {
      return res.json({
        status: 400,
        message: "You have not added this skill",
        success: false,
      });
    }
  } catch (err) {
    return res.json({
      status: 200,
      message: err.message,
      success: true,
    });
  }
};

exports.add = async (req, res) => {
  try {
    const user = req.user;
    const { skill } = req.body;
    const skillRecords = await Skills.find({
      name: new RegExp(`^${skill}$`, "i"),
    });
    if (skillRecords.length > 0) {
      if (!skillRecords[0].verified && !skillRecords[0].users.includes(user)) {
        const appearance = skillRecords[0].users.length + 1;
        let data = await Skills.findByIdAndUpdate(
          skillRecords[0]._id,
          { $push: { users: user }, appearances: appearance },
          { new: true }
        );
        return res.json({
          status: 200,
          message: "Skill published successfully",
          success: true,
          data: data,
        });
      } else {
        return res.json({
          status: 200,
          message: "Skill already published",
          success: true,
          data: skillRecords,
        });
      }
    } else {
      let saveSkill = {
        name: skill,
        users: [user],
      };
      const records = await new Skills(saveSkill).save();
      return res.json({
        status: 200,
        message: "Skill saved successfully",
        success: true,
        data: records,
      });
    }
  } catch (err) {
    return res.json({
      status: 500,
      message: "Internal server error",
      success: false,
      error: err,
    });
  }
};
