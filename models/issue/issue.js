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
    videos: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  {
    timestamps: true,
  }
);
issueSchema.index({ coordinates: "2dsphere" });
module.exports = mongoose.model("issue", issueSchema);
