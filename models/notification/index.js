const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = new Schema(
  {
    messages: { type: String, required: true},
    user: { type: Schema.Types.ObjectId, ref: "User", required: false},
    activity: { type: Schema.Types.ObjectId, ref: "User", required: false},
    joinedIssue: [{ type: Schema.Types.ObjectId, ref: "issue", required: false}],
    notificationType: { type: String, required: false, default: ""},
    campaign: { type: Schema.Types.ObjectId, ref: "campaign", required: false},
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("notification", notificationSchema);
