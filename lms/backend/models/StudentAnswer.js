const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quiz_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    marks_obtained: {
        type: Number,
        required: true,
    },
    submitted_at: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);
