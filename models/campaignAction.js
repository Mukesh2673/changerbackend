const Schema = mongoose.Schema;

const campaignActionSchema = new Schema(
  {
      donation:{
        type:Schema.Types.ObjectId,
        ref:"donation",
      },
      petition:{
        type:Schema.Types.ObjectId,
        ref:"petition",
      },
      participation:{
        type:Schema.Types.ObjectId,
        ref:"participation",
      }  
  },
  {
      timestamps: true,
  }
);

module.exports = mongoose.model("campaignActionSchema", campaignActionSchema);
