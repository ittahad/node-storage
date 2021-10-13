const { Mongoose } = require('mongoose');

const baseProps = require('./base');
const mongoose = new Mongoose();
const Schema = mongoose.Schema;

const fileSchema = new Schema({

    name: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    sizeInBytes: {
        type: Number,
        required: false
    },
    storageId: {
        type: String,
        required: true
    },
    secureUrl: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, {timestamps: true});

fileSchema.add(baseProps);

module.exports = fileSchema;