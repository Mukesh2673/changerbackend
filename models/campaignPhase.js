const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const phaseSchema = new Schema({
title:{
        type: String,
        required: false
      },
donation:{
  type: mongoose.Schema.Types.ObjectId,
   ref: "campaignActionSchema",
   default: () => new mongoose.Types.ObjectId(), 
  },
  petition:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"petition",
    default: () => new mongoose.Types.ObjectId(),
  },
  participation:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"participation",
  }],
  campaign:{
     type: mongoose.Schema.Types.ObjectId,
     ref: "campaignActionSchema",
    
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('campaignPhases', phaseSchema);
