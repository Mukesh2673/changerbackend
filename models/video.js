const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const campaignSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: "Campaign",
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
    type: Number,
    required: false
  },
}, {
  timestamps: true
});

campaignSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Video', campaignSchema);
