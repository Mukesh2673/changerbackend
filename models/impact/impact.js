const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const impactSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users"},
    campaign: { type: Schema.Types.ObjectId, ref: "campaign" },
    videos: { type: Schema.Types.ObjectId, ref: "Video"},
    description: { type: String, required: false},
    cause: { type: String, default: ""},
    hashtags: { type: Array, default: []},
    _geoloc: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("impact", impactSchema);
