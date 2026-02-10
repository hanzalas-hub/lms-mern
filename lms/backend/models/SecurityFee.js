const mongoose = require('mongoose');

const securityFeeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    enrollment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: false, // Optional - linked after enrollment is created
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true, // Required - payment is for a specific course
    },
    amount: {
        type: Number,
        default: 3000, // Fixed fee
    },
    payment_status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    receipt_url: {
        type: String, // Path to the uploaded document
        required: false, // Optional - uploaded after enrollment
    },
    submitted_at: {
        type: Date,
        default: Date.now,
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who approved
    },
    approved_at: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('SecurityFee', securityFeeSchema);
