const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const donationSchema = new Schema({
  
  name: {
    type: String,
    required: false
  },
  amount: {
    type: String,
    required: false
  },
  description:{
    type: String,
    required: false
  },
  karmaPoint: {
    type: String,
    required: false
  },
  phaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "campaignPhases",  
  }
  
}, {
  timestamps: true
});
donationSchema.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, Options) => {
    delete ret.__v;
  },
});


module.exports = mongoose.model('donation', donationSchema);
