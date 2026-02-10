const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Admin only routes
router.post('/', auth, roleMiddleware(['admin']), createCourse);
router.put('/:id', auth, roleMiddleware(['admin']), updateCourse);
router.delete('/:id', auth, roleMiddleware(['admin']), deleteCourse);

module.exports = router;
