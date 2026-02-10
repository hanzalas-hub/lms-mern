import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Divider,
    Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

const QuizManagement = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [courseTitle, setCourseTitle] = useState('');

    // Dialog state
    const [open, setOpen] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        title: '',
        duration: 30,
        total_marks: 10,
        questions: [
            { question_text: '', options: ['', '', '', ''], correct_answer_index: 0, marks: 1 }
        ]
    });

    useEffect(() => {
        fetchQuizzes();
        fetchCourseDetails();
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            const { data } = await api.get(`/quizzes/course/${courseId}`);
            setQuizzes(data);
        } catch (err) {
            setError('Failed to fetch quizzes');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseDetails = async () => {
        try {
            const { data } = await api.get(`/courses/${courseId}`);
            setCourseTitle(data.title);
        } catch (err) {
            console.error('Failed to fetch course title');
        }
    };

    const handleOpen = () => {
        setNewQuiz({
            title: '',
            duration: 30,
            total_marks: 10,
            questions: [
                { question_text: '', options: ['', '', '', ''], correct_answer_index: 0, marks: 1 }
            ]
        });
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleQuizChange = (e) => {
        setNewQuiz({ ...newQuiz, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (qIndex, field, value) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[qIndex][field] = value;
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    const addQuestion = () => {
        setNewQuiz({
            ...newQuiz,
            questions: [...newQuiz.questions, { question_text: '', options: ['', '', '', ''], correct_answer_index: 0, marks: 1 }]
        });
    };

    const removeQuestion = (index) => {
        const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/quizzes', { ...newQuiz, course_id: courseId });
            setSuccess('Quiz created successfully');
            setOpen(false);
            fetchQuizzes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create quiz');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h4">Quiz Management: {courseTitle}</Typography>
                <Box>
                    <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/teacher/dashboard')}>Back</Button>
                    <Button variant="contained" color="primary" onClick={handleOpen}>Create Quiz</Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Duration (Mins)</TableCell>
                            <TableCell>Total Marks</TableCell>
                            <TableCell>Questions</TableCell>
                            <TableCell>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {quizzes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No quizzes created yet for this course</TableCell>
                            </TableRow>
                        ) : (
                            quizzes.map((quiz) => (
                                <TableRow key={quiz._id}>
                                    <TableCell>{quiz.title}</TableCell>
                                    <TableCell>{quiz.duration}</TableCell>
                                    <TableCell>{quiz.total_marks}</TableCell>
                                    <TableCell>{quiz.questions?.length}</TableCell>
                                    <TableCell>{new Date(quiz.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Quiz Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Create New Quiz</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="title"
                                    label="Quiz Title"
                                    fullWidth
                                    required
                                    value={newQuiz.title}
                                    onChange={handleQuizChange}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    name="duration"
                                    label="Duration (mins)"
                                    type="number"
                                    fullWidth
                                    required
                                    value={newQuiz.duration}
                                    onChange={handleQuizChange}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField
                                    name="total_marks"
                                    label="Total Marks"
                                    type="number"
                                    fullWidth
                                    required
                                    value={newQuiz.total_marks}
                                    onChange={handleQuizChange}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Questions</Typography>
                        {newQuiz.questions.map((q, qIndex) => (
                            <Paper key={qIndex} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                                <IconButton
                                    size="small"
                                    color="error"
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                    onClick={() => removeQuestion(qIndex)}
                                    disabled={newQuiz.questions.length === 1}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                <TextField
                                    label={`Question ${qIndex + 1}`}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                    value={q.question_text}
                                    onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                                />
                                <Grid container spacing={2}>
                                    {q.options.map((opt, oIndex) => (
                                        <Grid item xs={12} sm={6} key={oIndex}>
                                            <TextField
                                                label={`Option ${oIndex + 1}`}
                                                fullWidth
                                                required
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                placeholder={oIndex === q.correct_answer_index ? "Correct Option" : ""}
                                            />
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select
                                            label="Correct Option Index"
                                            fullWidth
                                            required
                                            value={q.correct_answer_index}
                                            onChange={(e) => handleQuestionChange(qIndex, 'correct_answer_index', parseInt(e.target.value))}
                                            SelectProps={{ native: true }}
                                        >
                                            <option value={0}>Option 1</option>
                                            <option value={1}>Option 2</option>
                                            <option value={2}>Option 3</option>
                                            <option value={3}>Option 4</option>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Marks"
                                            type="number"
                                            fullWidth
                                            required
                                            value={q.marks}
                                            onChange={(e) => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value))}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                        <Button startIcon={<AddIcon />} onClick={addQuestion}>Add Question</Button>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">Create Quiz</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default QuizManagement;
