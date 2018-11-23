
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
User = require('./User');


let Wedding = new Schema({
    placeName: String,
    placeAddress: String,
    placeType: String,
    placeLat: String,
    placeLng: String,
    date: Date,
    emailPartner: String,
    partner1:  { type: Schema.Types.ObjectId, ref: 'User' },
    partner2:  { type: Schema.Types.ObjectId, ref: 'User' },
    album: [String],
},{
    collection: 'weddings'
});

module.exports = mongoose.model('Wedding', Wedding);