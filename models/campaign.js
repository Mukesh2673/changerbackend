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
  phase:[{
    type: Schema.Types.ObjectId,
    ref: "campaignPhases",
   }], 

  story:{
    type: String,
    required: false
  },
  image:{
    type:String,
    required:false
  },
  videos: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    //autopopulate: true
  }

}, {
  timestamps: true
});

campaignSchema.plugin(mongoosePaginate);
campaignSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Campaign', campaignSchema);
