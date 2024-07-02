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

//update user account to add Skill on profile
exports.addUserSkill= async (req, res, userId, skillId)=>{
  const user= await User.findOne({ _id: userId });
  const skillRecords = await Skills.find({ _id: skillId });
  if (skillRecords.length === 0) {
    return res.json({
      status: 400,
      message: "Skill not exist",
      success: false,
    });
  }
  if (user.skills.includes(skillId)) {
    return res.json({
      status: 400,
      message: "You have Already this skill",
      success: false,
    });
  } else {
    await User.findByIdAndUpdate(
      { _id: userId },
      { $push: { skills: skillId } },
      { new: true }
    );
    return res.json({
      status: 200,
      message: "Skill added Successfully",
      success: true,
    });
  }
}

exports.add = async (req, res) => {
  try {
    const user = req.user;
    const { skill,id } = req.query
    let skillId=''
    if(skill && id)
    {
      return res.json({
        status: 500,
        message: "One of the data fields allows either a skill name or a skill ID.",
        success: false,
      });
    }
    if(id)
    {
      await this.addUserSkill(req,res,user,id)
    }
    if(skill){
      const skillRecords = await Skills.find({
        name: new RegExp(`^${skill}$`, "i"),
      });
      if (skillRecords.length > 0) {
        if (!skillRecords[0].verified && !skillRecords[0].users.includes(user)) {
           const appearance = skillRecords[0].users.length + 1;
           await Skills.findByIdAndUpdate(
            skillRecords[0]._id,
            { $push: { users: user }, appearances: appearance },
            { new: true }
          );
          await this.addUserSkill(req, res, user,  skillRecords[0]._id)
        }else {
           skillId=skillRecords[0]._id
           await this.addUserSkill(req, res, user, skillId)
        }
      } else {
        // add skill to the skill records and update it to user profile
        let saveSkill = {
          name: skill,
          users: [user],
        };
        const records = await new Skills(saveSkill).save();
        await this.addUserSkill(req, res, user, records._id)
      }
 }   
  } catch (err) {
    console.log('error',err)
    return res.json({
      status: 500,
      message: "Internal server error",
      success: false,
      error: err,
    });
  }
};

exports.verifySkill= async (req, res)=>{
  const skillId = req.params.id;
  const checkSkill=await Skills.findById(skillId);
  if(!checkSkill)
  {
    return res.json({
      status: 200,
      message: "Skill Not found",
      success: false,
    })  
  }
  if(checkSkill.verified)
  {
    return res.json({
      status: 200,
      message: "Skill already Verified",
      success: false,
    }) 
  }
  else{
    await Skills.findByIdAndUpdate(
        { _id: skillId },
        { verified: true },
        { new: true }
      ); 
      return res.json({
        status: 200,
        message: "Skill Verified Successfully",
        success: true,
      })
  }  
}


