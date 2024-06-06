const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const signedPetitionsSchema = new Schema(
  { 
    location: { type: { type: String, default: "Point", enum: "Point"}, coordinates: { type: [Number], default: [0, 0]}},
    petition: { type: mongoose.Schema.Types.ObjectId, ref: "petitions" },  
    user: { type: Schema.Types.ObjectId, ref:"User"},
    },
    {
    timestamps: true,
    }
);

module.exports = mongoose.model("signedpetitions", signedPetitionsSchema, "signedPetitions");
