const { Campaign, Issue, Video,Advocate } = require("../models");
const { updateCampaignInAlgolia } = require('../algolia/campaignAlgolia')
const { updateIssueInAlgolia } = require('../algolia/issueAlgolia')
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
      if (!issue) throw new Error( res.__("INVALID_ISSUE"));
    }

    if (advocacy.campaign) {
      const campaign = await Campaign.findById(advocacy.campaign);
      if (!campaign) throw new Error(res.__("INVALID_CAMPAIGN"));
    }

    const video = await new Video(videoData).save();
    advocateData.video = video._id;
    const advocate = await new Advocate(advocateData).save();

    if (advocacy.issue) {
      await Issue.findByIdAndUpdate(advocacy.issue, { $push: { advocate: advocate._id } }, { new: true });
      await updateIssueInAlgolia(advocacy.issue)
    }
    if (advocacy.campaign) {
      await Campaign.findByIdAndUpdate(advocacy.campaign, { $push: { advocate: advocate._id } }, { new: true });
      await updateCampaignInAlgolia(advocacy.campaign)
    }
    res.json({ status: 200, message: res.__("ADVOCATED_ADDED"), success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = req.user;
    const advocateId = req.params.id;
    const  advocate = await Advocate.findOne({ _id: advocateId, user:user });
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
        await updateCampaignInAlgolia(advocate.campaign)
      }
      if(advocate.issue)
      {
        await Issue.findByIdAndUpdate(
          { _id: advocate.issue },
          { $pull: { advocate: advocate._id } },
          { new: true }
        );
        await updateIssueInAlgolia(advocate.issue)

      }

      return res.json({
        status: 200,
        message: res.__("ADVOCATED_DELETED"),
        success: true,
      });
    } else {
      return res.json({
        status: 500,
        message: res.__("INVALID_ADVOCATE"),
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
    const user =req.user
    let advocate=[]
    if(advocateId)
    {
      advocate = await Advocate.find({ _id: advocateId, user: user  });
    }
    else{
      advocate = await Advocate.find({user: user});
    }     
    return res.json({
      status: 200,
      success: true,
      data: advocate,
      message:  advocate?.length>0 ? res.__("ADVOCATED_RECORDS_MESSAGE"):res.__("ADVOCATE_NOT_FOUND") 
    });
    } 
    catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};