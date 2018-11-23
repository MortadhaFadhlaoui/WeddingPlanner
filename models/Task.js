
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
Wedding = require('./Wedding');


let Task = new Schema({
    TaskName:  { type: String, required: true },
    DateTask:  { type: Date, required: true },
    Description:  { type: String, required: false },
    Budget:  { type: Number, required: true },
    WeddingID:  { type: Schema.Types.ObjectId, ref: 'Wedding' },
},{
    collection: 'tasks'
});

module.exports = mongoose.model('Task', Task);