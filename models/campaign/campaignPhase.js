const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phaseSchema = new Schema({
title: {type: String, required: false},
donation: { type: mongoose.Schema.Types.ObjectId, ref: "campaignDonation", default: () => new mongoose.Types.ObjectId()},
petition: { type:mongoose.Schema.Types.ObjectId, ref:"campaignPetition", default: () => new mongoose.Types.ObjectId()},
participation: [{ type:mongoose.Schema.Types.ObjectId, ref:"campaignParticipation"}],
campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign"}
}, 
{
  timestamps: true
});

module.exports = mongoose.model('phase', phaseSchema, 'campaignPhase');
