const express = require('express');
const router = express.Router();
const {
    enrollInCourse,
    getMyEnrollments,
    getEnrollments,
} = require('../controllers/enrollmentController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', auth, roleMiddleware(['student']), enrollInCourse);
router.get('/my', auth, roleMiddleware(['student']), getMyEnrollments);
router.get('/', auth, roleMiddleware(['admin', 'teacher']), getEnrollments);

module.exports = router;
