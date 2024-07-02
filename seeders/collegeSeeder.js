const { College } = require("../models")
const collegeRecords= require("../constants/college")

exports.addcollegeRecords = async () => {
    try {
     const college = await College.find()
     if(college.length==0)
     {
        await College.insertMany(collegeRecords.COLLEGE);
     } 
    } catch (error) {
        console.log("value of err",error)
    }
  };