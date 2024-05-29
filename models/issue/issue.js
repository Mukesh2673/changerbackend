const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const issueSchema = new Schema(
  {
    title: { type: String, required: false },
    cause: { type: String, required: false },
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
    address: { type: String, required: false },
    description: { type: String, default: "" },
    shared: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
    views: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
    notification: { type: String, default: "nothing" },
    video: { type: Schema.Types.ObjectId, ref: "Video" },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
    advocate: [{ type: mongoose.Schema.Types.ObjectId, ref: "advocates" }],
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", required: false }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "message", required: false }],
    hashtags: { type: Array, default: [] },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    joined: [{ type: Schema.Types.ObjectId, ref: "User", required: false }]
  },
  {
    timestamps: true,
  }
);
issueSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("issue", issueSchema);
