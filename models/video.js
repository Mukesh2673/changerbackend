const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const campaignSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    autopopulate: true,
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: "Campaign",
    autopopulate: true,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  likes: {
    type: Number,
    required: false
  },
  video_url: {
    type: String,
    required: true
  },
  video_id: {
    type: String,
    required: false
  },
  encoding_id: {
    type: String,
    required: false
  },
  encoding_status: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});

campaignSchema.plugin(mongoosePaginate);
campaignSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Video', campaignSchema);
