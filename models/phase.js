const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const phaseSchema = new Schema({
title: {
        type: String,
        required: false
      },
action:{
  type: Schema.Types.ObjectId,
   ref: "campaignActionSchema",
   autopopulate: true
  },

}, {
  timestamps: true
});

phaseSchema.plugin(mongoosePaginate);
phaseSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('phase', phaseSchema);
