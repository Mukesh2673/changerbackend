const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const advocateSchema = new Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "issue" },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    video: { type: Schema.Types.ObjectId, ref: "Video" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    advocateUser: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("advocate", advocateSchema);
