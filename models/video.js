const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", autopopulate: true, required: false},
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: false},
    issue: { type: Schema.Types.ObjectId, ref: "issue", required: false},
    description: { type: String, required: false},
    title: { type: String, required: false},
    likes:[{ type: Schema.Types.ObjectId, ref:"User", required:false}],
    comments:[{ type: Schema.Types.ObjectId, ref:"comments", required:false}],
    video_url: { type: String, required: true},
    type: { type: String, required: false},
    thumbnail_url: { type: String, required: false},
    location:{type: {type: String, default: "Point", enum: "Point",},coordinates: {type: [Number],default: [0, 0]}},
    hashtags:{ type: Array, default: []},
    algolia: {type: String, default: ""},
    address: { type: String, required: false },
    views: {type: Number, default: 0}
  },
  {
    timestamps: true,
  }
);

videoSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Video", videoSchema);
