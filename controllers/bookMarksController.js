const { BookMarks, Issue, Campaign } = require("../models");
exports.add = async (req, res) => {
  try {
    const user = req.user;
    const { issue: issueId, campaign: campaignId } = req.body;
    const bookMarks = { user };

    if (issueId) {
      const issue = await Issue.findById(issueId);
      if (!issue) return res.status(400).json({ message: res.__("INVALID_ISSUE"), success: false });

      const existingBookmark = await BookMarks.findOne({ issue: issueId, user });
      if (existingBookmark) {
        return res.status(400).json({ message: res.__("ISSUE_ALREADY_BOOKMARED"), success: true });
      }

      bookMarks.issue = issueId;
    }

    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return res.status(400).json({ message: res.__("INVALID_CAMPAIGN"), success: false });

      const existingBookmark = await BookMarks.findOne({ campaign: campaignId, user });
      if (existingBookmark) {
        return res.status(400).json({ message: res.__("CAMPAING_ALREADY_BOOKMARKED"), success: true });
      }

      bookMarks.campaign = campaignId;
    }

    await new BookMarks(bookMarks).save();
    res.status(200).json({ message:  res.__("BOOKMARK_ADDED"), success: true });

  } catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};
exports.delete = async (req, res) => {
  try {
    const user = req.user;
    const bookMarkId = req.params.id;
    const bookMarks = await BookMarks.findOne({ _id: bookMarkId, user:user });
    
    if (bookMarks) {
      await BookMarks.findByIdAndRemove({ _id: bookMarkId, user: user });
      return res.json({
        status: 200,
        message: res.__("BOOKMARK_REMOVED"),
        success: true,
      });
    }else {
      return res.json({
        status: 500,
        message: res.__("INVALID_BOOKMARK"),
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.get = async (req, res) => {
  try {
    const user = req.user;
    const bookMarks = await BookMarks.find({ user: user }).populate([
      {
        path: "issue",
        populate: { path: "issue", model: Issue },
      },
      {
        path: "campaign",
        populate: { path: "campaign", model: Campaign },
      },
    ]);
    return res.json({
      status: 200,
      success: true,
      data: bookMarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 500 });
  }
};
