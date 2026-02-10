const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Option = require('../models/Option');
const StudentAnswer = require('../models/StudentAnswer');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Create a quiz with questions and options
// @route   POST /api/quizzes
// @access  Private/Teacher
exports.createQuiz = async (req, res) => {
    try {
        const { course_id, title, duration, total_marks, questions } = req.body;

        const TeachingAssignment = require('../models/TeachingAssignment');

        // ... (inside createQuiz)
        // Check if course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if teacher is assigned to this course
        if (req.user.role !== 'admin') {
            const assignment = await TeachingAssignment.findOne({
                course_id: course._id,
                teacher_id: req.user._id
            });

            if (!assignment) {
                return res.status(403).json({ message: 'Not authorized to create quiz for this course' });
            }
        }

        // Create quiz
        const quiz = new Quiz({
            course_id,
            teacher_id: req.user._id,
            title,
            duration,
            total_marks,
        });

        const createdQuiz = await quiz.save();

        // Create questions and options
        for (const q of questions) {
            const question = new Question({
                quiz_id: createdQuiz._id,
                text: q.question_text || q.text,
                marks: q.marks || 1,
            });
            const savedQuestion = await question.save();

            // Create options for this question
            const options = q.options || [];
            for (let i = 0; i < options.length; i++) {
                const option = new Option({
                    question_id: savedQuestion._id,
                    text: options[i],
                    is_correct: i === q.correct_answer_index,
                });
                await option.save();
            }
        }

        res.status(201).json(createdQuiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
exports.getCourseQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course_id: req.params.courseId });

        // Populate questions count for each quiz
        const quizzesWithDetails = await Promise.all(
            quizzes.map(async (quiz) => {
                const questionCount = await Question.countDocuments({ quiz_id: quiz._id });
                return {
                    ...quiz.toObject(),
                    questions: { length: questionCount }
                };
            })
        );

        res.json(quizzesWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quiz by ID with questions and options
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const questions = await Question.find({ quiz_id: quiz._id });
        const questionsWithOptions = await Promise.all(
            questions.map(async (question) => {
                const options = await Option.find({ question_id: question._id });
                return {
                    ...question.toObject(),
                    options: options.map(opt => ({
                        _id: opt._id,
                        text: opt.text,
                        is_correct: opt.is_correct
                    }))
                };
            })
        );

        res.json({
            ...quiz.toObject(),
            questions: questionsWithOptions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz answers and auto-grade
// @route   POST /api/quizzes/submit/:id
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { question_id, selected_option_id }
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check enrollment status
        const enrollment = await Enrollment.findOne({
            user_id: req.user._id,
            course_id: quiz.course_id
        });

        if (!enrollment || enrollment.status !== 'active') {
            return res.status(403).json({ message: 'Course enrollment must be active to attempt quiz' });
        }

        const questions = await Question.find({ quiz_id: quiz._id });
        let totalObtainedMarks = 0;
        const submissionResults = [];

        for (const question of questions) {
            const studentAnswer = answers.find(a => a.question_id === question._id.toString());

            if (studentAnswer) {
                const selectedOption = await Option.findById(studentAnswer.selected_option_id);
                const isCorrect = selectedOption && selectedOption.is_correct;
                const marks = isCorrect ? question.marks : 0;
                totalObtainedMarks += marks;

                // Save answer record
                const answerRecord = new StudentAnswer({
                    user_id: req.user._id,
                    quiz_id: quiz._id,
                    question_id: question._id,
                    marks_obtained: marks,
                });
                await answerRecord.save();

                submissionResults.push({
                    question_id: question._id,
                    isCorrect,
                    marks_obtained: marks
                });
            }
        }

        res.status(200).json({
            message: 'Quiz submitted successfully',
            total_marks: quiz.total_marks,
            marks_obtained: totalObtainedMarks,
            results: submissionResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quiz results for a student
// @route   GET /api/quizzes/results/:id
// @access  Private
exports.getQuizResults = async (req, res) => {
    try {
        const results = await StudentAnswer.find({
            quiz_id: req.params.id,
            user_id: req.user._id
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
