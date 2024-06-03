const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    reportSubject: { type: String, required: true },
    details: { type: String, required: true },
    issues: { type: Schema.Types.ObjectId, ref: "issue", required: false },
    profile: { type: Schema.Types.ObjectId, ref: "User", required: false },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("report", reportSchema);
