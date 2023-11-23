const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const campaignParticipantSchema = new Schema(
  {
      user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          autopopulate: true,
      },
      campaign: {
          type: Schema.Types.ObjectId,
          ref: "Campaign",
          autopopulate: true,
      },
  },
  {
      timestamps: true,
  }
);

module.exports = mongoose.model("CampaignParticipant", campaignParticipantSchema);
