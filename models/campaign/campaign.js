
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const campaignSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    cause: {
      type: String,
      required: false,
    },

    title: {
      type: String,
      required: false,
    },
    phases: [
      {
        type: Schema.Types.ObjectId,
        ref: "phase",
        required: false,
      },
    ],
    story: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    video:{
      type: Schema.Types.ObjectId,
      ref: "Video",
      index: true,
    },
    impacts:[{
      type:Schema.Types.ObjectId,
      ref:"impact",
      index: true,
    }],
    _geoloc: [],
    },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("campaign", campaignSchema);
