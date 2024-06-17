const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const donationSchema = new Schema(
  {
    name: { type: String, required: false },
    amount: { type: String, required: false },
    description: { type: String, required: false },
    karmaPoint: { type: String, required: false },
    karmaUnit: { type: String, required: false },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: "campaignPhases" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("donation", donationSchema,"campaignDonation");
