const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // duration in minutes
        required: true,
    },
    total_marks: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
