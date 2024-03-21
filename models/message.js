const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema(
  {
    sender: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required:false
    },
    issues: {
        type: Schema.Types.ObjectId,
        ref: "issue",
        required: false,
    },
    message: {
        type: String,
        required: true,
      },
  
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("message", messageSchema);
