const { searchAlgolia, multipleSearchAlgolia } = require("../libs/algolia");
require("dotenv").config();

exports.search = async (req, res) => {
  try {
    const filter = {};
    const query = req.query;
    filter.search = query.searchKey;
    if (Object.keys(query).length === 0) {
      return res
        .status(500)
        .json({ message: "invalid search key", status: 500 });
    }
    if (query?.lat && query?.lng) {
      filter.location = [{ lat: query.lat, lng: query.lng }];
    }
    if (query?.cause) {
      filter.cause = query?.cause;
    }
    if (query?.hashtags) {
      filter.hashtags = query?.hashtags;
    }
    const arr = [
      "campaigns",
      "users",
      "impacts",
      "videos",
      "issues",
      "hashtags",
    ];
    if (arr.includes(query.type)) {
      filter.type = query.type;
    }
    let records = await searchAlgolia(filter);
    return res.status(200).json({ message: "records", data: records });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};
