const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const impactSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    campaign: 
      {
        type: Schema.Types.ObjectId,
        ref: "campaign",
      },
  
    videos: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("impact", impactSchema);
