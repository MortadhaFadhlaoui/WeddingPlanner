
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
},{
    collection: 'users'
});

module.exports = mongoose.model('User', User);