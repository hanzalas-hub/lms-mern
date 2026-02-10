import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Divider,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import TimerIcon from '@mui/icons-material/Timer';
import api from '../services/api';

const TakeQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState({}); // { question_id: selected_option_id }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await api.get(`/quizzes/${quizId}`);
                setQuiz(data);
                setTimeLeft(data.duration * 60);

                // Check if student has already submitted this quiz (optional improvement)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch quiz');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && quiz && !isSubmitted) {
            handleSubmit(); // Auto-submit on time out
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, quiz, isSubmitted]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        if (isSubmitted) return;
        try {
            setIsSubmitted(true);
            clearInterval(timerRef.current);

            const submissionData = {
                answers: Object.entries(answers).map(([qId, optionId]) => ({
                    question_id: qId,
                    selected_option_id: optionId
                }))
            };

            const { data } = await api.post(`/quizzes/submit/${quizId}`, submissionData);
            setResult(data);
        } catch (err) {
            setError('Failed to submit quiz');
            setIsSubmitted(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    if (result) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', mt: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" color="primary" gutterBottom>Quiz Completed!</Typography>
                    <Typography variant="h5" sx={{ my: 2 }}>
                        Your Score: {result.marks_obtained} / {result.total_marks}
                    </Typography>
                    <Typography variant="h6" color={(result.marks_obtained / result.total_marks * 100) >= 50 ? 'success.main' : 'error.main'}>
                        Percentage: {((result.marks_obtained / result.total_marks) * 100).toFixed(2)}%
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={() => navigate(`/student/dashboard`)}
                    >
                        Back to Dashboard
                    </Button>
                </Paper>
            </Box>
        );
    }

    const currentQuestion = quiz.questions[activeStep];

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.dark', color: 'white' }}>
                <Typography variant="h5">{quiz.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon />
                    <Typography variant="h6">{formatTime(timeLeft)}</Typography>
                </Box>
            </Paper>

            <Box sx={{ mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {quiz.questions.map((_, index) => (
                        <Step key={index}>
                            <StepLabel></StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Question {activeStep + 1} of {quiz.questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: '1.2rem' }}>
                    {currentQuestion.text}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                        value={answers[currentQuestion._id] ?? ''}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    >
                        {currentQuestion.options.map((option) => (
                            <Paper
                                key={option._id}
                                variant="outlined"
                                sx={{
                                    mb: 1.5,
                                    px: 2,
                                    py: 1,
                                    bgcolor: answers[currentQuestion._id] === option._id ? 'action.selected' : 'inherit'
                                }}
                            >
                                <FormControlLabel
                                    value={option._id}
                                    control={<Radio />}
                                    label={option.text}
                                    sx={{ width: '100%', m: 0 }}
                                />
                            </Paper>
                        ))}
                    </RadioGroup>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(activeStep - 1)}
                    >
                        Previous
                    </Button>
                    {activeStep === quiz.questions.length - 1 ? (
                        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitted}>
                            Submit Quiz
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default TakeQuiz;
