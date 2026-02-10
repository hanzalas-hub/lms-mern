const Enrollment = require('../models/Enrollment');
const SecurityFee = require('../models/SecurityFee');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
exports.enrollInCourse = async (req, res) => {
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
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Check if security fee has been paid and approved for this course
        const securityFee = await SecurityFee.findOne({
            user_id,
            course_id,
            payment_status: 'approved'
        });

        if (!securityFee) {
            return res.status(403).json({
                message: 'You must pay the security fee and get admin approval before enrolling in this course',
                requiresPayment: true,
                course_id
            });
        }

        // Create enrollment with active status (payment already approved)
        const enrollment = new Enrollment({
            user_id,
            course_id,
            status: 'active', // Immediately active since payment is approved
        });

        const createdEnrollment = await enrollment.save();

        // Link the security fee to this enrollment
        securityFee.enrollment_id = createdEnrollment._id;
        await securityFee.save();

        res.status(201).json({
            message: 'Enrollment successful! You can now access the course.',
            enrollment: createdEnrollment,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my
// @access  Private/Student
exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user_id: req.user._id })
            .populate('course_id', 'title category description daily_minutes');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all enrollments (Admin) or Course enrollments (Teacher)
// @route   GET /api/enrollments
// @access  Private/Admin/Teacher
exports.getEnrollments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'teacher') {
            const TeachingAssignment = require('../models/TeachingAssignment');

            // ... (other imports)

            // ... (inside getEnrollments)
            if (req.user.role === 'teacher') {
                // Find courses assigned to this teacher via TeachingAssignment
                const assignments = await TeachingAssignment.find({ teacher_id: req.user._id });
                const courseIds = assignments.map(a => a.course_id);
                query = { course_id: { $in: courseIds } };
            }
        }

        const enrollments = await Enrollment.find(query)
            .populate('user_id', 'name email')
            .populate('course_id', 'title');

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
