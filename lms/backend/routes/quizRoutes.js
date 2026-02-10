const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getCourseQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
} = require('../controllers/quizController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/course/:courseId', auth, getCourseQuizzes);
router.get('/results/:id', auth, getQuizResults);
router.get('/:id', auth, getQuizById);

// Teacher/Admin can create quizzes
router.post('/', auth, roleMiddleware(['teacher', 'admin']), createQuiz);

// Only students can submit quizzes
router.post('/submit/:id', auth, roleMiddleware(['student']), submitQuiz);

module.exports = router;
