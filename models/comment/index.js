    const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const videoMessageSchema = new Schema(
  {
    sender:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: "repliesVideoMessage",
        required: false,
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "commentsLikes",
      required: false,
  }],
    message: {
        type: String,
        required: true,
      },
     videos:{
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: false,
     }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comments", videoMessageSchema);
