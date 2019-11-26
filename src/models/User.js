const { Schema, model } = require('mongoose');

const Module = require('./Module');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    age: Number,
    language: String,
    interests: {
        type: [String],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
        time: Date
    },
    modules: [{
        type: Schema.Types.ObjectId,
        ref: "Module"
    }]
},{
    timestamps: {
        createdAt: false
    }
});

module.exports = model('User', userSchema);

