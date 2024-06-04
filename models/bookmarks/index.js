const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bookMarksSchema = new Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "issue" },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("bookmarks", bookMarksSchema, "bookMarks");
