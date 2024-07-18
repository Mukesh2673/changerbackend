const { Skills, User } = require("../models");
const {addSkillInAlgolia,updateSkillInAlgolia }= require("../algolia/skillAlgolia")
exports.skills = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;
    const search = req.query.search || "";
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    if(req.query.verified == 'false'){
      searchQuery.verified=false
    }
    else{
      searchQuery.verified=true

    }
    const records = await Skills.find(searchQuery).select('_id name verified appearances').skip(skip).limit(pageSize);
    const totalRecords = await Skills.countDocuments(searchQuery);
     return res.json({
      status: records.length>0? 200: 400,
      skills: records,
      totalPage: Math.ceil(totalRecords / pageSize),
      success: true,
      message: records.length>0?res.__("SEARCH_RECORD_RETERIVED"):res.__("SKILL_RECORD_NOT_FOUND")
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
        message: res.__("SKILL_RECORD_NOT_FOUND"),
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
        message:  res.__("SKILL_REMOVED"),
        success: true,
      });
    } else {
      return res.json({
        status: 400,
        message: res.__("SKILL_NOT_ADDED"),
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
      message: res.__("SKILL_RECORD_NOT_FOUND"),
      success: false,
    });
  }
  if (user.skills.includes(skillId)) {
    return res.json({
      status: 400,
      message: res.__("SKILL_ALREADY_SAVED"),
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
      message:  res.__("SKILL_ADDED"),
      success: true,
    });
  }
}
//add new Skill
exports.add = async (req, res) => {
  try {
    const user = req.user;
    const { skill,id } = req.query
    let skillId=''
    if(skill && id)
    {
      return res.json({
        status: 500,
        message: res.__("SKILL_ID_OR_NAME_REQUIRED"),
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
        await addSkillInAlgolia(records?._id)  
        await this.addUserSkill(req, res, user, records._id)
      }
 }   
  } catch (err) {
    console.log('error',err)
    return res.json({
      status: 500,
      message:  res.__("SERVER_ERROR"),
      success: false,
      error: err,
    });
  }
};

exports.verifySkill= async (req, res)=>{
  const user = req.user
  const userRecords = await User.findById(user);
  if(userRecords?.role != 'admin')
  {
    return res.json({
      status: 401,
      message: res.__("UNAUTHORIZE_TO_VERIFY_SKILL"),
      success: false,
    }) 
  }
  const skillId = req.params.id;
  const checkSkill=await Skills.findById(skillId);
  if(!checkSkill)
  {
    return res.json({
      status: 200,
      message: res.__("SKILL_NOT_FOUND"),
      success: false,
    })  
  }
  if(checkSkill.verified)
  {
    return res.json({
      status: 200,
      message: res.__("SKILL_ALREADY_VERIFIED"),
      success: false,
    }) 
  }
  else{
    await Skills.findByIdAndUpdate(
        { _id: skillId },
        { verified: true },
        { new: true }
      ); 
     await updateSkillInAlgolia(skillId)
      return res.json({
        status: 200,
        message: res.__("SKILL_VERIFIED"),
        success: true,
      })
  }  
}


