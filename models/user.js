const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  profile_url: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);
