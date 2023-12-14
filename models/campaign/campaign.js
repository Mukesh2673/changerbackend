const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const campaignSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // autopopulate: true
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
      //autopopulate: true
    },
    impacts:[{
      type:Schema.Types.ObjectId,
      ref:"impact"
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("campaign", campaignSchema);
