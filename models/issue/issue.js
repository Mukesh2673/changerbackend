const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const issueSchema = new Schema(
  {
    title: {
      type: String,
      required: false,
    },
    cause: {
      type: String,
      required: false,
    },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    address:{
      type: String,
      required: false,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    hashtags: {
      type: Array,
      default: [],
    },
    user:{
      type: Schema.Types.ObjectId,
      ref:"User"

    }
  },
  {
    timestamps: true,
  }
);
issueSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("issue", issueSchema);
