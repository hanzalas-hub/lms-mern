const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    daily_minutes: {
        type: Number,
        required: true,
    },
    daily_minutes: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
