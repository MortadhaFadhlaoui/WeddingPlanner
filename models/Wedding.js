
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
User = require('./User');


let Wedding = new Schema({
    place: String,
    date: Date,
    emailPartner: String,
    partner1:  { type: Schema.Types.ObjectId, ref: 'User' },
    partner2:  { type: Schema.Types.ObjectId, ref: 'User' },
},{
    collection: 'weddings'
});

module.exports = mongoose.model('Wedding', Wedding);