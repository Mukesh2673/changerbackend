const { Skills } = require("../models")
const skillRecords= require("../constants/skills")

exports.addSkill = async () => {
    try {
     const skills = await Skills.find()
     if(skills.length==0)
     {
        await Skills.insertMany(skillRecords.SKILLS);
     } 
    } catch (error) {
        console.log("value of err",error)
    }
  };