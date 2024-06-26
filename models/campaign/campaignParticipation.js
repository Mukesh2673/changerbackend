const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campaignParticipationSchema = new Schema(
  {
    participant: { type: String, default: "" },
    roleTitle: { type: String, default: ""},
    description: { type: String, default: ""},
    workplaceType: { type: String, default: ""},
    location: { type: { type: String, default: "Point", enum: "Point" }, coordinates: { type: [Number], default: [0, 0]}},
    address: { type: String, default: ""},
    partTime: { type: { type: Boolean, default: false}, details: { type: String, default: ""}},
    fullTime: { type: { type: Boolean, default: false}, details: { type: String, default: ""}},
    onSite: { type: { type: Boolean, default: false}, details: { type: String, default: ""}},
    remote: { type: { type: Boolean, default: false}, details: { type: String, default: ""}},
    startDate: { type: String, default: ""},
    numberOfDays: { type: Number, default: 0},
    responsibilities: { type: Array, default: []},
    skills:  [ { type: mongoose.Schema.Types.ObjectId, ref: "skills", required: false }],
    requirements: { type: Array, default: []},
    provides: { type: Array, default: []},
    karmaPoint: { type: Number, default: 0},
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: "campaignPhases"},
  },
  {
    timestamps: true,
  }
);
campaignParticipationSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("participation", campaignParticipationSchema,'campaignParticipation');
