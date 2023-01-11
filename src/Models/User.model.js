const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  customer_kanji_name: {
    type: String,
    required: true,
  },
  contract_email_address: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
