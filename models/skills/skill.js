const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const skillSchema = new Schema(
  {
    name: { type: String, required: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    appearances: { type: Number, required: false ,default:1},
    verified: {type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("skills", skillSchema);
