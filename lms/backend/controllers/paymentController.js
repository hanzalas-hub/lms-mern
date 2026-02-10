const SecurityFee = require('../models/SecurityFee');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Create security fee payment for a course
// @route   POST /api/payments/create
// @access  Private/Student
exports.createSecurityFee = async (req, res) => {
    try {
        const { course_id } = req.body;
        const user_id = req.user._id;

        // Check if course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ user_id, course_id });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        // Check if security fee already exists for this course
        const existingFee = await SecurityFee.findOne({ user_id, course_id });
        if (existingFee) {
            if (existingFee.payment_status === 'approved') {
                return res.status(400).json({ message: 'Security fee already approved. You can now enroll.' });
            } else if (existingFee.payment_status === 'pending') {
                return res.status(400).json({ message: 'Security fee payment is pending admin approval' });
            } else {
                // Rejected - allow creating new one
                await SecurityFee.deleteOne({ _id: existingFee._id });
            }
        }

        // Create security fee record
        const securityFee = new SecurityFee({
            user_id,
            course_id,
            amount: 3000,
            payment_status: 'pending',
        });

        const createdFee = await securityFee.save();

        res.status(201).json({
            message: 'Security fee payment initiated. Please upload your payment receipt.',
            securityFee: createdFee
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload payment receipt
// @route   POST /api/payments/upload/:security_fee_id
// @access  Private/Student
exports.uploadReceipt = async (req, res) => {
    try {
        console.log('Upload request received for security fee:', req.params.security_fee_id);
        console.log('File received:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a receipt file' });
        }

        const securityFee = await SecurityFee.findOne({
            _id: req.params.security_fee_id,
            user_id: req.user._id
        });

        if (!securityFee) {
            return res.status(404).json({ message: 'Security fee record not found' });
        }

        if (securityFee.payment_status === 'approved') {
            return res.status(400).json({ message: 'Payment already approved' });
        }

        securityFee.receipt_url = `/uploads/${req.file.filename}`;
        securityFee.payment_status = 'pending';
        await securityFee.save();

        res.json({ message: 'Receipt uploaded successfully. Waiting for admin approval.', securityFee });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my payments
// @route   GET /api/payments/my
// @access  Private/Student
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await SecurityFee.find({ user_id: req.user._id })
            .populate('course_id')
            .populate('enrollment_id');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending payments (Admin)
// @route   GET /api/payments/pending
// @access  Private/Admin
exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await SecurityFee.find({ payment_status: 'pending' })
            .populate('user_id', 'name email')
            .populate('course_id')
            .populate('enrollment_id');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment status (Approve/Reject)
// @route   PUT /api/payments/:id
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const securityFee = await SecurityFee.findById(req.params.id);

        if (!securityFee) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        securityFee.payment_status = status;
        securityFee.approved_by = req.user._id;
        securityFee.approved_at = Date.now();
        await securityFee.save();

        // Note: Enrollment is created AFTER payment approval when student clicks "Enroll"
        // No need to activate enrollment here

        res.json({ message: `Payment ${status} successfully`, securityFee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
