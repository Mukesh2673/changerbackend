const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petitionsSchema = new Schema(
  {
    phase: { type: mongoose.Schema.Types.ObjectId, ref: "campaignPhases" },
    name: { type: String, required: false },
    requiredSignature: { type: Number, default: 0, required: false },
    description: { type: String, required: false },
    karmaPoint: { type: String, required: false },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: "campaignPhases" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("petition", petitionsSchema);
