const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    location: { type: { type: String, default: "Point", enum: "Point"}, coordinates: { type: [Number], default: [0, 0]}},
    email: { type: String, required: false },
    username: { type: String, required: true },
    uid: { type: String, required: false },
    dob: { type: Date, required: true },
    profile_url: { type: String, required: false },
    premium: { type: Boolean, required: false },
    bio: { type: String, default: "" },
    cognitoUsername: { type: String, required: true },
    cause: { type: [], default: [], required: false },
    privacy: { type: Boolean, required: false, default: false },
    messages: [ { type: mongoose.Schema.Types.ObjectId, ref: "message", required: false }],
    language: { type: String, default: "english", required: false },
    profileImage: { type: String, default: null, required: false },
    karmaPoint: { type: Number, default: 0, required: false },
    followers: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
    skills:  [ { type: mongoose.Schema.Types.ObjectId, ref: "usersSkills", required: false }],
    algolia: {type: String, default: ""},
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("User", userSchema);
