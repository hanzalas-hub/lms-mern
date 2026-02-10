const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    quiz_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    marks: {
        type: Number,
        default: 1,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
