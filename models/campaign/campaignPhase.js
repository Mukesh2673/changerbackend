const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phaseSchema = new Schema({
title: {type: String, required: false},
donation: { type: mongoose.Schema.Types.ObjectId, ref: "donation", default: () => new mongoose.Types.ObjectId()},
petition: { type:mongoose.Schema.Types.ObjectId, ref:"petition", default: () => new mongoose.Types.ObjectId()},
participation: [{ type:mongoose.Schema.Types.ObjectId, ref:"participant"}],
campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign"}
}, 
{
  timestamps: true
});

module.exports = mongoose.model('phase', phaseSchema);
