import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItemIcon,
    ListItemText,
    Divider,
    Card,
    CardContent,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import PaymentIcon from '@mui/icons-material/Payment';
import LockIcon from '@mui/icons-material/Lock';
import api from '../services/api';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null); // null, 'none', 'pending', 'approved', 'rejected'
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [securityFeeId, setSecurityFeeId] = useState(null);
    const [receiptUrl, setReceiptUrl] = useState(null);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, quizRes, paymentsRes, enrollmentsRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/quizzes/course/${courseId}`),
                api.get('/payments/my'),
                api.get('/enrollments/my')
            ]);

            setCourse(courseRes.data);
            setQuizzes(quizRes.data);

            // Check payment status for this course
            const payment = paymentsRes.data.find(p => {
                const pCourseId = p.course_id?._id || p.course_id;
                return pCourseId?.toString() === courseId?.toString();
            });
            if (payment) {
                setPaymentStatus(payment.payment_status);
                setSecurityFeeId(payment._id);
                setReceiptUrl(payment.receipt_url); // Set receipt URL from payment
            } else {
                setPaymentStatus('none');
                setReceiptUrl(null);
            }

            // Check enrollment status
            const enrollment = enrollmentsRes.data.find(e => e.course_id?._id === courseId);
            setEnrollmentStatus(enrollment?.status || null);

        } catch (err) {
            setError('Failed to fetch course details');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiatePayment = async () => {
        try {
            const { data } = await api.post('/payments/create', { course_id: courseId });
            setSecurityFeeId(data.securityFee._id);
            setPaymentStatus('pending');
            setUploadDialogOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initiate payment');
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !securityFeeId) return;
        try {
            const formData = new FormData();
            formData.append('receipt', selectedFile);

            await api.post(`/payments/upload/${securityFeeId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploadDialogOpen(false);
            setSelectedFile(null);
            alert('Receipt uploaded successfully! Waiting for admin approval.');
            fetchData();
        } catch (err) {
            setError('Failed to upload receipt');
        }
    };

    const handleEnroll = async () => {
        try {
            await api.post('/enrollments', { course_id: courseId });
            alert('Enrollment successful! You can now access the course.');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Enrollment failed');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const canAccessCourse = enrollmentStatus === 'active';
    const canEnroll = paymentStatus === 'approved' && !enrollmentStatus;

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">{course.title}</Typography>
                <Button variant="outlined" onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>About this Course</Typography>
                        <Typography variant="body1" paragraph>{course.description}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">Category: {course.category}</Typography>
                        <Typography variant="body2" color="text.secondary">Daily Commitment: {course.daily_minutes} minutes</Typography>
                        <Typography variant="body2" color="text.secondary">Instructor: {course.teacher_id?.name}</Typography>
                    </Paper>

                    {/* Course Access Status */}
                    {!canAccessCourse && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {paymentStatus === 'none' && 'You must pay the security fee before enrolling in this course.'}
                            {paymentStatus === 'pending' && 'Your payment is pending admin approval.'}
                            {paymentStatus === 'rejected' && 'Your payment was rejected. Please submit a new payment.'}
                            {canEnroll && 'Your payment is approved! Click "Enroll Now" to access the course.'}
                        </Alert>
                    )}

                    <Typography variant="h5" gutterBottom>Course Quizzes</Typography>
                    {!canAccessCourse ? (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100' }}>
                            <LockIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                Quizzes are locked
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Complete payment and enrollment to access course quizzes
                            </Typography>
                        </Paper>
                    ) : quizzes.length === 0 ? (
                        <Typography>No quizzes available yet for this course.</Typography>
                    ) : (
                        <List>
                            {quizzes.map((quiz) => (
                                <Card key={quiz._id} sx={{ mb: 2 }}>
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ListItemIcon>
                                                <QuizIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={quiz.title}
                                                secondary={
                                                    <Box component="span" sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <TimerIcon fontSize="inherit" /> {quiz.duration} mins
                                                        </Box>
                                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <StarIcon fontSize="inherit" /> {quiz.total_marks} marks
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                                        >
                                            Start Quiz
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </List>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Enrollment Status</Typography>

                        {paymentStatus === 'none' && (
                            <>
                                <Typography variant="body2" paragraph>
                                    Security Fee: ₹3,000
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={<PaymentIcon />}
                                    onClick={handleInitiatePayment}
                                >
                                    Pay Security Fee
                                </Button>
                            </>
                        )}

                        {paymentStatus === 'pending' && (
                            <>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    {securityFeeId && !selectedFile ?
                                        'Please upload your payment receipt' :
                                        'Payment pending admin approval'}
                                </Alert>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => setUploadDialogOpen(true)}
                                    sx={{ mb: 1 }}
                                >
                                    Upload Receipt
                                </Button>
                            </>
                        )}

                        {paymentStatus === 'rejected' && (
                            <>
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    Payment rejected
                                </Alert>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleInitiatePayment}
                                >
                                    Submit New Payment
                                </Button>
                            </>
                        )}

                        {canEnroll && (
                            <>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Payment approved!
                                </Alert>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={handleEnroll}
                                >
                                    Enroll Now
                                </Button>
                            </>
                        )}

                        {enrollmentStatus === 'active' && (
                            <Alert severity="success">
                                ✓ Enrolled and Active
                            </Alert>
                        )}
                    </Paper>

                    <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="h6" gutterBottom>Learning Progress</Typography>
                        <Typography variant="body2">Complete all quizzes to master this course!</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Upload Receipt Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Payment Details & Receipt Upload</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Bank Account Details
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Grid container spacing={1}>
                                <Grid item xs={5}><Typography variant="body2" color="text.secondary">Bank Name:</Typography></Grid>
                                <Grid item xs={7}><Typography variant="body2" fontWeight="medium">LMS Official Bank</Typography></Grid>

                                <Grid item xs={5}><Typography variant="body2" color="text.secondary">Account Name:</Typography></Grid>
                                <Grid item xs={7}><Typography variant="body2" fontWeight="medium">LMS Administration</Typography></Grid>

                                <Grid item xs={5}><Typography variant="body2" color="text.secondary">Account Number:</Typography></Grid>
                                <Grid item xs={7}><Typography variant="body2" fontWeight="medium">123456789012</Typography></Grid>

                                <Grid item xs={5}><Typography variant="body2" color="text.secondary">Amount:</Typography></Grid>
                                <Grid item xs={7}><Typography variant="body2" fontWeight="bold" color="primary">₹3,000</Typography></Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Upload Receipt
                    </Typography>
                    <Typography variant="body2" paragraph color="text.secondary">
                        Please transfer the security fee to the account above and upload the transaction receipt (Screenshot/PDF).
                    </Typography>

                    <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1, textAlign: 'center' }}>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="receipt-upload"
                        />
                        <label htmlFor="receipt-upload">
                            <Button variant="outlined" component="span" startIcon={<PaymentIcon />}>
                                Choose File
                            </Button>
                        </label>
                        {selectedFile && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Selected: {selectedFile.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleFileUpload} variant="contained" disabled={!selectedFile}>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseDetails;
