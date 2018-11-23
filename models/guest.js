
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
Wedding = require('./Wedding');

let Guest = new Schema({
    GuestName:  { type: String, required: true },
    Email:  { type: String, required: false },
    WeddingID:  { type: Schema.Types.ObjectId, ref: 'Wedding' },
    isVerified:{
        type: Boolean,
        default: false
    },
},{
    collection: 'guest'
});

module.exports = mongoose.model('Guest', Guest);