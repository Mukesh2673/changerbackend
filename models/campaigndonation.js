const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "campaignPhases",  
  }
  
}, {
  timestamps: true
});

donationSchema.plugin(mongoosePaginate);
donationSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('donation', donationSchema);
