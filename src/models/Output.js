const { Schema, model } = require('mongoose');

const Module = require('./Module');

const outputSchema = new Schema({
    name: String,
    status: Boolean,
    type: String,
    units: String,
    min_value: Number,
    max_value: Number,
    value: Number,
    modulo: {
        type: Schema.Types.ObjectId,
        ref: "Module"
    }
});

module.exports = model('Output', outputSchema);
