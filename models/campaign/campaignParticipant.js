const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const campaignParticipantSchema = new Schema(
  {
    participant: {
      type: String,
      default: "",
    },
    roleTitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    workplaceType: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        default: "Point",
        enum: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    startdate: {
      type: String,
      default: "",
    },
    numberofDays: {
      type: String,
      default: "",
    },
    time: {
      type: String,
      default: "",
    },
    responsibilities: {
      type: Array,
      default: [],
    },
    skills: {
      type: Array,
      default: [],
    },
    requirements: {
      type: Array,
      default: [],
    },
    provides: {
      type: Array,
      default: [],
    },
    karmaPoint: {
      type: String,
      default: "",
    },
    phaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "campaignPhases",
    },
  },
  {
    timestamps: true,
  }
);
campaignParticipantSchema.index({ coordinates: "2dsphere" });
module.exports = mongoose.model("participant", campaignParticipantSchema);
