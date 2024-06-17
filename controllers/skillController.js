
const {Skills,User} = require("../models");

exports.skills=async(req, res)=>{
    try{
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const skip = (page - 1) * pageSize;
        const search = req.query.search || "";
        const searchQuery = search ? { name: { $regex: search, $options: "i" } } : {};
        const records = await Skills.find(searchQuery).skip(skip).limit(pageSize);
        const totalRecords =  await Skills.countDocuments(searchQuery);
        return res.json({
            status: 200,
            skills: records,
            totalPage: Math.ceil(totalRecords/pageSize),
            success:true
        })
    }
    catch(err)
    {
        console.log("err", err);
        return res.json({ status: 400, data: [], success: false, message: error });
    }
}

exports.addUserSkill=async(req, res)=>{
    try{
        const userId = req.user._id;
        const skill= req.params.id;
        const skillRecords=await Skills.find({_id: skill})
        if(skillRecords.length===0)
        {
            return res.json({
                status: 400,
                message: "Skill not exist",
                success: false,
              });
        }
        const user = await User.findOne({ _id: userId });
        if(user.skills.includes(skill))
        { 
            return res.json({
                status: 400,
                message: "You have Already this skill",
                success: false,
                
              });
        }
        else{
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
    }
    catch(err)
    {
        return res.json({
            status: 200,
            message: err.message,
            success: true,
          });        
    }
}

exports.removeUserSkill=async(req, res)=>{
    try{
        const userId = req.user._id;
        const skill= req.params.id;
        const skillRecords=await Skills.find({_id: skill})
        if(skillRecords.length===0)
        {
            return res.json({
                status: 400,
                message: "Skill not exist",
                success: false,
              });
        }
        const user = await User.findOne({ _id: userId });
        if(user.skills.includes(skill))
        {
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
        }
        else{
            return res.json({
                status: 400,
                message: "You have not added this skill",
                success: false,
        });
        } 
    }
    catch(err)
    {
        return res.json({
            status: 200,
            message: err.message,
            success: true,
          });        
    }
}