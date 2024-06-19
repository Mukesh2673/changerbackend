const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petitionsSchema = new Schema(
  {
    phase: { type: mongoose.Schema.Types.ObjectId, ref: "campaignPhases" },
    name: { type: String, required: false },
    numberOfSignature: { type: Number, default: 0, required: false },
    neededSignaturesFor: { type: String, required: false },
    karmaPoint: { type: Number,default: 0, required: false },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: "campaignPhases" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("petition", petitionsSchema, "campaignPetition");
