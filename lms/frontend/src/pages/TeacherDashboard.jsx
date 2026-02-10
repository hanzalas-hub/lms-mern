import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Box,
    CircularProgress,
    Button,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TeacherDashboard = () => {
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, coursesRes] = await Promise.all([
                    api.get('/admin/teacher-stats'),
                    api.get('/courses') // We'll filter these below
                ]);
                setStats(statsRes.data);

                // Filter courses for this teacher (backend could have a specific route, but reuse for now)
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const assignedCourses = coursesRes.data.filter(c => c.teacher_id?._id === userInfo._id);
                setCourses(assignedCourses);
            } catch (err) {
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Teacher Dashboard</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                        <Typography variant="h6">Assigned Courses</Typography>
                        <Typography variant="h4">{stats.assignedCourses}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                        <Typography variant="h6">Total Students</Typography>
                        <Typography variant="h4">{stats.totalStudentsEnrolled}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <Typography variant="h6">Quizzes Created</Typography>
                        <Typography variant="h4">{stats.quizzesCreated}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h5" sx={{ mb: 2 }}>My Assigned Courses</Typography>
            <Grid container spacing={3}>
                {courses.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography variant="body1">No courses assigned to you yet.</Typography>
                    </Grid>
                ) : (
                    courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course._id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{course.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">Category: {course.category}</Typography>
                                    <Typography variant="body2" color="text.secondary">Daily Minutes: {course.daily_minutes}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="contained" onClick={() => navigate(`/teacher/quizzes/${course._id}`)}>
                                        Manage Quizzes
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default TeacherDashboard;
