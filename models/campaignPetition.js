const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const campaignSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      autopopulate: true,
    },
    signature: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    karmaPoint: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.plugin(mongoosePaginate);
campaignSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Campaign", campaignSchema);
