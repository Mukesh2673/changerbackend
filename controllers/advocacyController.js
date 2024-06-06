const { Campaign, Issue, Video,Advocate } = require("../models");
const {upload,uploadVideoThumbnail} = require("../libs/fileUpload");
exports.add = async (req, res) => {
  try {
    const { body: advocacy, file: filedata, } = req;
    const thumbnail = await uploadVideoThumbnail(req.file);
    const videoUrl = await upload(req.file);
    const user = req.user;
    let { location } = advocacy;
    if (typeof location === 'string') location = JSON.parse(location);

    const videoData = {
      user,
      description: advocacy.description,
      title: advocacy.title,
      video_url: videoUrl.encodedKey,
      thumbnail_url: `thumbnail${thumbnail.key}`,
      location,
      type: 'advocacy',
      issue: advocacy.issue || undefined,
      campaign: advocacy.campaign || undefined,
      advocateUser: advocacy.advocateUser || undefined
    };

    const advocateData = { ...videoData };

    if (advocacy.issue) {
      const issue = await Issue.findById(advocacy.issue);
      if (!issue) throw new Error("Invalid issue");
    }

    if (advocacy.campaign) {
      const campaign = await Campaign.findById(advocacy.campaign);
      if (!campaign) throw new Error("Invalid campaign");
    }

    const video = await new Video(videoData).save();
    advocateData.video = video._id;
    const advocate = await new Advocate(advocateData).save();

    if (advocacy.issue) {
      await Issue.findByIdAndUpdate(advocacy.issue, { $push: { advocate: advocate._id } }, { new: true });
    }

    if (advocacy.campaign) {
      await Campaign.findByIdAndUpdate(advocacy.campaign, { $push: { advocate: advocate._id } }, { new: true });
    }

    res.json({ status: 200, message: "Advocate added successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.delete = async (req, res) => {
  try {
    const advocateId = req.params.id;
    const  advocate = await Advocate.findOne({ _id: advocateId });
    if (advocate) {
       await Advocate.findByIdAndRemove(advocateId);
       await Video.findByIdAndRemove(advocate.video)   
      if(advocate.campaign)
      {
        await Campaign.findByIdAndUpdate(
          { _id: advocate.campaign },
          { $pull: { advocate: advocate._id } },
          { new: true }
        );
      }
      if(advocate.issue)
      {
        await Issue.findByIdAndUpdate(
          { _id: advocate.issue },
          { $pull: { advocate: advocate._id } },
          { new: true }
        );
      }

      return res.json({
        status: 200,
        message: "Advocate deleted successfully",
        success: true,
      });
    } else {
      return res.json({
        status: 500,
        message: "Invalid advocate",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.get = async (req, res) => {
  try {
    const advocateId = req.query.id; 
    let advocate=[]
    if(advocateId)
    {
      advocate = await Advocate.findOne({ _id: advocateId });
    }
    else{
      advocate = await Advocate.find();
    }     
    return res.json({
      status: 200,
      success: true,
      data: advocate
    });
    } 
    catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};