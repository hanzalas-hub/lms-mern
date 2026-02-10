import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Box,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (err) {
                setError('Failed to fetch dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                        <Typography variant="h6">Total Users</Typography>
                        <Typography variant="h4">{stats.totalUsers}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                        <Typography variant="h6">Total Courses</Typography>
                        <Typography variant="h4">{stats.totalCourses}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <Typography variant="h6">Enrollments</Typography>
                        <Typography variant="h4">{stats.totalEnrollments}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                        <Typography variant="h6">Total Quizzes</Typography>
                        <Typography variant="h4">{stats.totalQuizzes}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Payment Summaries</Typography>
                    <Grid container spacing={2}>
                        {stats.payments.map((p) => (
                            <Grid item xs={12} sm={4} key={p._id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            Status: {p._id.toUpperCase()}
                                        </Typography>
                                        <Typography variant="h6">Count: {p.count}</Typography>
                                        <Typography variant="h6">Total Amount: ₹{p.totalAmount}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
