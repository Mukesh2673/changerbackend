const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentsLikeSchema = new Schema(
  {
    user:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
  
    comments: {
        type: Schema.Types.ObjectId,
        ref: "Comments",
        required: false,
      },
     repliesComments:{
        type: Schema.Types.ObjectId,
        ref: "RepliesComments",
        required: false,
     }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("commentsLikes", commentsLikeSchema,"commentsLikes");
