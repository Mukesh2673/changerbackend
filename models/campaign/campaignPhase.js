const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phaseSchema = new Schema({
title: {type: String, required: false},
donation: { type: mongoose.Schema.Types.ObjectId, ref: "campaignDonation", default: () => new mongoose.Types.ObjectId()},
petition: { type:mongoose.Schema.Types.ObjectId, ref:"campaignPetition", default: () => new mongoose.Types.ObjectId()},
volunteering: [{ type:mongoose.Schema.Types.ObjectId, ref:"campaingVolunteering"}],
campaign: { type: mongoose.Schema.Types.ObjectId, ref: "campaigns"}
}, 
{
  timestamps: true
});

module.exports = mongoose.model('phase', phaseSchema, 'campaignPhase');
