const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const skillSchema = new Schema(
  {
    name: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true }
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("userskills", skillSchema,"usersSkills");
