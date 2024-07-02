const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collegeSchema = new Schema(
  {
    name: { type: String, required: false },
    address: { type: String, required: false },
    type: { type: String, required: false },
    image: {type: String, required: false }
},
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("colleges", collegeSchema);
