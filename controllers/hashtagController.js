const { searchAlgolia, updateAlgolia } = require("../libs/algolia");
const { Campaign, Issue, Impact,Video } = require("../models");
const mongoose = require("mongoose");
const natural = require("natural");
const pos = require("pos");
const update = async (model, data, type) => {
  try {
    const id = data._id;
    if (!mongoose.Types.ObjectId.isValid(data._id)) {
      return {
        status: 400,
        error: "Invalid  ID format",
        success: false,
      };
    }
    const result = await model.findById({ _id: data._id });
    if (!result) {
      return {
        status: 401,
        message: `invalid ${type}`,
        success: false,
      };
    }
    let tags = result?.hashtags;
    var tagsArray = [];
    if (tags?.length > 0) {
      let arr = [...tags, ...data.hashtags];
      tagsArray = arr.filter(
        (value, index, self) => self.indexOf(value) === index
      );
    } else {
      tagsArray = data.hashtags;
    }
    await model.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          hashtags: tagsArray,
        },
      }
    );
    const records = await model.findById({ _id: data._id });
    let filterData = { search: id, type: type };
    let updateObject = {};
    const searchAlgo = await searchAlgolia(filterData);
    updateObject = {
      objectID: searchAlgo[0].objectID,
      hashtags: tagsArray,
    };
    await updateAlgolia(updateObject, type);
    obj = {
      status: 200,
      message: "Hashtags added successfully!",
      success: true,
      data: records,
    };
    return obj;
  } catch (err) {
    console.log("err is", err);
    return (obj = {
      status: 400,
      message: err,
      success: false,
    });
  }
};

exports.add = async (req, res) => {
  try {
    const query = req.query;
    const data = req.body;
    const arr = [
      "campaigns",
      "users",
      "impacts",
      "videos",
      "issues",
      "hashtags",
    ];
    if (arr.includes(query.type)) {
      var response;
      if (query.type === "campaigns") {
        response = await update(Campaign, data, "campaigns");
      } else if (query.type === "issues") {
        response = await update(Issue, data, "issues");
      } else if (query.type === "impacts") {
        response = await update(Impact, data, "impacts");
      }
      return res.status(400).json(response);
    } else {
      return res.status(400).json({ message: "invalid request type" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

exports.generateTags = async (text) => {
  const hashtags = [];
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text);
  const tagger = new pos.Tagger();
  const taggedWords = tagger.tag(words);
  for (const taggedWord of taggedWords) {
    const word = taggedWord[0];
    const tag = taggedWord[1];

    // Consider nouns and adjectives as potential hashtags
    if (tag.startsWith("N") || tag.startsWith("J")) {
      hashtags.push(`#${word.toLowerCase()}`);
    }
  }
  return hashtags;
};

exports.getContent = async (req, res) => {
  try {
    const hashtagToFind = `#${req.params.tag}`;
  
    const [campaigns, issues, videos] = await Promise.all([
      Campaign.find({ hashtags: hashtagToFind }),
      Issue.find({ hashtags: hashtagToFind }),
      Video.find({ hashtags: hashtagToFind })
    ]);
    return res.status(200).json({
      data: {
        campaigns,
        issues,
        impactVideos: videos
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 }); 
  
  }}