
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
Guest = require('./guest');

let TokenInvit = new Schema({
    _guestId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Guest' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 86400 }
});

module.exports = mongoose.model('TokenInvit', TokenInvit);