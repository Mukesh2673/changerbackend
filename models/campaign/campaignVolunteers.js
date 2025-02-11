  const mongoose = require("mongoose");

  const Schema = mongoose.Schema;

  const campaignVolunteersSchema = new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      campaign: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
      volunteering: { type: mongoose.Schema.Types.ObjectId, ref: "campaingVolunteering" },
      approved: {type: Boolean, default: false}
    },
    {
      timestamps: true,
    }
  );
  campaignVolunteersSchema.index({ coordinates: "2dsphere" });
  module.exports = mongoose.model("volunteers", campaignVolunteersSchema,'campaignVolunteers');
