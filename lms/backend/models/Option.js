const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    is_correct: {
        type: Boolean,
        default: false,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Option', optionSchema);
