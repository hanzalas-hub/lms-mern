import React, { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import api from '../services/api';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog state
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({
        title: '',
        category: '',
        description: '',
        daily_minutes: 0,
        teacher_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [courseRes, userRes] = await Promise.all([
                api.get('/courses'),
                api.get('/admin/users')
            ]);
            setCourses(courseRes.data);
            setTeachers(userRes.data.filter(user => user.role === 'teacher'));
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (course = null) => {
        if (course) {
            setIsEdit(true);
            setCurrentCourse({
                _id: course._id,
                title: course.title,
                category: course.category,
                description: course.description,
                daily_minutes: course.daily_minutes,
                teacher_id: course.teacher?._id || '', // Updated to check teacher object
                lecture_minutes: course.lecture_details?.lecture_minutes || 60,
                lectures_per_day: course.lecture_details?.lectures_per_day || 1
            });
        } else {
            setIsEdit(false);
            setCurrentCourse({
                title: '',
                category: '',
                description: '',
                daily_minutes: 0,
                teacher_id: '',
                lecture_minutes: 60,
                lectures_per_day: 1
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError('');
    };

    const handleChange = (e) => {
        setCurrentCourse({ ...currentCourse, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put(`/courses/${currentCourse._id}`, currentCourse);
                setSuccess('Course updated successfully');
            } else {
                await api.post('/courses', currentCourse);
                setSuccess('Course created successfully');
            }
            handleClose();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/courses/${id}`);
                setSuccess('Course deleted successfully');
                fetchData();
            } catch (err) {
                setError('Failed to delete course');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Course Management</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                    Create Course
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Teacher</TableCell>
                            <TableCell>Minutes/Day</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course._id}>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.category}</TableCell>
                                <TableCell>{course.teacher_id?.name || 'Unassigned'}</TableCell>
                                <TableCell>{course.daily_minutes}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => handleOpen(course)}>Edit</Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(course._id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Course' : 'Create Course'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            name="title"
                            label="Course Title"
                            fullWidth
                            required
                            value={currentCourse.title}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="category"
                            label="Category"
                            fullWidth
                            required
                            value={currentCourse.category}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            fullWidth
                            required
                            multiline
                            rows={3}
                            value={currentCourse.description}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="daily_minutes"
                            label="Daily Minutes"
                            type="number"
                            fullWidth
                            required
                            value={currentCourse.daily_minutes}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="lecture_minutes"
                            label="Lecture Duration (Minutes)"
                            select
                            fullWidth
                            required
                            value={currentCourse.lecture_minutes}
                            onChange={handleChange}
                        >
                            <MenuItem value={30}>30 Minutes</MenuItem>
                            <MenuItem value={45}>45 Minutes</MenuItem>
                            <MenuItem value={60}>60 Minutes</MenuItem>
                        </TextField>
                        <TextField
                            margin="dense"
                            name="lectures_per_day"
                            label="Lectures Per Day"
                            type="number"
                            fullWidth
                            required
                            value={currentCourse.lectures_per_day}
                            onChange={handleChange}
                        />
                        onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="teacher_id"
                            label="Assign Teacher"
                            select
                            fullWidth
                            required
                            value={currentCourse.teacher_id}
                            onChange={handleChange}
                        >
                            {teachers.map((teacher) => (
                                <MenuItem key={teacher._id} value={teacher._id}>
                                    {teacher.name} ({teacher.email})
                                </MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default CourseManagement;
