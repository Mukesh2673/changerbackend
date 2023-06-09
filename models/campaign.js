const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const campaignSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  cause: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  slug: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  support_amount: {
    type: Number,
    required: false
  },
  support_volunteers: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
