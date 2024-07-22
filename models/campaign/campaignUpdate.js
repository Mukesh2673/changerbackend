const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const updateSchema = new Schema(
  {

    title: { type: String, required: false },
    description: { type: String, required: false },
    privacy: { type: Boolean, required: false },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "campaigns"},
    user:  {type :mongoose.Schema.Types.ObjectId, ref: "users"},
    image: { type: String, required: false },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("campaignupdate", updateSchema,"campaignUpdate");
