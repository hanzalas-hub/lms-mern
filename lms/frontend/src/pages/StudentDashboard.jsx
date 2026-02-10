import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Button,
    Tabs,
    Tab,
    Paper,
    Input,
    TextField,
    MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StudentDashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadLoading, setUploadLoading] = useState(null); // enrollment_id
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [search, category]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [courseRes, enrollmentRes, paymentRes] = await Promise.all([
                api.get(`/courses?search=${search}&category=${category}`),
                api.get('/enrollments/my'),
                api.get('/payments/my')
            ]);
            setCourses(courseRes.data);
            setMyEnrollments(enrollmentRes.data);
            setMyPayments(paymentRes.data);

            // Extract unique categories for filter
            const uniqueCats = [...new Set(courseRes.data.map(c => c.category))];
            if (uniqueCats.length > 0) setCategories(uniqueCats);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setError('');
            setSuccess('');
            const { data } = await api.post('/enrollments', { course_id: courseId });
            setSuccess(data.message);
            fetchData();
        } catch (err) {
            if (err.response?.data?.requiresPayment) {
                setError('Please pay the security fee first. Go to course details to make payment.');
            } else {
                setError(err.response?.data?.message || 'Enrollment failed');
            }
        }
    };


    const isEnrolled = (courseId) => myEnrollments.some(e => e.course_id?._id === courseId);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Student Dashboard</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Explore Courses" />
                <Tab label="My Enrolled Courses" />
                <Tab label="Payment History" />
            </Tabs>

            {/* Filters */}
            {tabValue === 0 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            )}

            {/* Explore Courses Tab */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course._id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{course.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{course.category}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>{course.description}</Typography>
                                </CardContent>
                                <CardActions>
                                    {isEnrolled(course._id) ? (
                                        <Button size="small" disabled>Already Enrolled</Button>
                                    ) : (
                                        <Button size="small" variant="contained" onClick={() => handleEnroll(course._id)}>
                                            Enroll Now (₹3000)
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* My Enrolled Courses Tab */}
            {tabValue === 1 && (
                <Grid container spacing={3}>
                    {myEnrollments.length === 0 ? (
                        <Grid item xs={12}><Typography>You are not enrolled in any courses.</Typography></Grid>
                    ) : (
                        myEnrollments.map((enrollment) => (
                            <Grid item xs={12} sm={6} md={4} key={enrollment._id}>
                                <Card variant="outlined" sx={{ borderLeft: 6, borderColor: enrollment.status === 'active' ? 'success.main' : 'warning.main' }}>
                                    <CardContent>
                                        <Typography variant="h6">{enrollment.course_id?.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">Status: {enrollment.status.toUpperCase()}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        {enrollment.status === 'active' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => navigate(`/student/course/${enrollment.course_id?._id}`)}
                                            >
                                                Go to Course
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Payment History Tab */}
            {tabValue === 2 && (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>My Payments</Typography>
                    <Grid container spacing={2}>
                        {myPayments.map((payment) => (
                            <Grid item xs={12} key={payment._id}>
                                <Box sx={{ p: 1, borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Security Fee for: {payment.course_id?.title || 'Unknown'}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: payment.payment_status === 'approved' ? 'success.main' : 'warning.main' }}>
                                        {payment.payment_status.toUpperCase()}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}
        </Box>
    );
};

export default StudentDashboard;
