const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema({
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    lecture_minutes: {
        type: Number,
        enum: [30, 45, 60],
        required: true,
        default: 60
    },
    lectures_per_day: {
        type: Number,
        required: true,
        default: 1
    },
    assigned_date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('TeachingAssignment', teachingAssignmentSchema);
