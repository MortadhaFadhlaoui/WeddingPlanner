
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    image: String,
    isVerified:{
      type: Boolean,
      default: false
    },
    password: String,
},{
    collection: 'users'
});

module.exports = mongoose.model('User', User);