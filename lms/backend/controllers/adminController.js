const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const SecurityFee = require('../models/SecurityFee');
const Quiz = require('../models/Quiz');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = role || user.role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        const totalQuizzes = await Quiz.countDocuments();

        const payments = await SecurityFee.aggregate([
            {
                $group: {
                    _id: "$payment_status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        const stats = {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalQuizzes,
            payments
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher dashboard stats
// @route   GET /api/admin/teacher-stats
// @access  Private/Teacher
exports.getTeacherStats = async (req, res) => {
    try {
        const courses = await Course.find({ teacher_id: req.user._id });
        const courseIds = courses.map(c => c._id);

        const enrollmentsCount = await Enrollment.countDocuments({ course_id: { $in: courseIds } });
        const quizCount = await Quiz.countDocuments({ course_id: { $in: courseIds } });

        res.json({
            assignedCourses: courses.length,
            totalStudentsEnrolled: enrollmentsCount,
            quizzesCreated: quizCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
