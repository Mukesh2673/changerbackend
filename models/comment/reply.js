const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const repliesVideoMessageSchema = new Schema(
  {
    sender:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
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

module.exports = mongoose.model("repliesVideoMessage", repliesVideoMessageSchema);
