const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const donationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    donation: { type: Schema.Types.ObjectId, ref: "User", index: true },
    amount: { type: String, required: false },
    chargeId: {type: String, default: ''}   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("donated", donationSchema, "campaignDonated");
