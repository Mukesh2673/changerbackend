const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const searchKeyWordSchema = new Schema(
  {
    name: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("searchKeyWord", searchKeyWordSchema);
