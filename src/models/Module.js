const { Schema, model } = require('mongoose');

const Input = require('./Input');
const Output = require('./Output');
const User = require('./User');

const moduleSchema = new Schema({
    name: String,
    description: String,
    body_location:{
        type: String,
        enum: ["head", "ears", "left shoulder", "right shoulder", "chest", "left elbow", "right elbow", "left arm", "right arm", "left hand", "right hand", "stomach", "waist", "left leg", "right leg", "left foot", "right foot"]
    },
    inputs: [{
        type: Schema.Types.ObjectId,
        ref: "Input"
    }],
    outputs: [{
        type: Schema.Types.ObjectId,
        ref: "Output"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});


module.exports = model('Module', moduleSchema);
