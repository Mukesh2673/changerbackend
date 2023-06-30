const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const campaignSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    autopopulate: true
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

campaignSchema.plugin(mongoosePaginate);
campaignSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Campaign', campaignSchema);
