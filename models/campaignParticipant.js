const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const campaignParticipantSchema = new Schema(
  {
      user: {
          type: Schema.Types.ObjectId,
          ref: "Campaign",
          autopopulate: true,
      },

      participant: {
        type: String,
        required: false
      },
      roleTitle: {
        type: String,
        required: false
      },
      description:{
        type: String,
        required: false
      },
      workplaceType: {
        type: String,
        required: false
      },
      location: {
        type: String,
        required: false
      },
      address:{
        type: String,
        required: false
      },
      startdate:{
        type: String,
        required: false
      },
      numberofDays:{
        type: String,
        required: false 
      },
      time:{
        type: String,
        required: false 
      },
      responsibilities:{
        type:Array,
        default:[]
      },
      skills:{
        type:Array,
        default:[]
      },
      requirements:{
        type:Array,
        default:[]
      },
      provides:{
        type:Array,
        default:[]
      },
      karmaPoint:{
        type:String,
        required:false
      } 


     
  },
  {
      timestamps: true,
  }
);

module.exports = mongoose.model("CampaignParticipant", campaignParticipantSchema);
