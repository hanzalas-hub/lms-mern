const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUserRole,
    getDashboardStats,
    getTeacherStats
} = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Admin only routes
router.get('/users', auth, roleMiddleware(['admin']), getUsers);
router.put('/users/:id/role', auth, roleMiddleware(['admin']), updateUserRole);
router.get('/stats', auth, roleMiddleware(['admin']), getDashboardStats);

// Teacher stats
router.get('/teacher-stats', auth, roleMiddleware(['teacher']), getTeacherStats);

module.exports = router;
