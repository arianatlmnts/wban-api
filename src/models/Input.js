const { Schema, model } = require('mongoose');

const Module = require('./Module');

const inputSchema = new Schema({
    name: String,
    status: Boolean,
    type: String,
    units: String,
    min_value: Number,
    max_value: Number,
    data: [{
        value: Number,
        time: Date
    }],
    modulo: {
        type: Schema.Types.ObjectId,
        ref: "Module"
    }
});

module.exports = model('Input', inputSchema);