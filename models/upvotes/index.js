const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const upvotes = new Schema(
  {
    issue: { type: Schema.Types.ObjectId, ref:"issue"},
    user: { type: Schema.Types.ObjectId, ref:"User"},
    likes: { type: Boolean, required: false, default:false}
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("upvotes", upvotes);
