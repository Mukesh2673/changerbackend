const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const repliesVideoMessageSchema = new Schema(
  {
    comment: { type: Schema.Types.ObjectId, ref: "Comments", required: false },
    sender: { type: Schema.Types.ObjectId, ref:"User", required:true },
    message: { type: String, required: true },
    videos: { type: Schema.Types.ObjectId, ref: "Video", required: false},
    likes:[{ type: Schema.Types.ObjectId, ref: "commentsLikes", required: false}]
 },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("RepliesComments", repliesVideoMessageSchema,'repliesComments');
