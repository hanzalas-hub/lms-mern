import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                    >
                        LMS Platform
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {!user ? (
                            <>
                                <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                                <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                            </>
                        ) : (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <Button color="inherit" component={RouterLink} to="/admin/dashboard">Stats</Button>
                                        <Button color="inherit" component={RouterLink} to="/admin/users">Users</Button>
                                        <Button color="inherit" component={RouterLink} to="/admin/courses">Courses</Button>
                                        <Button color="inherit" component={RouterLink} to="/admin/payments">Payments</Button>
                                    </>
                                )}
                                {user.role === 'teacher' && (
                                    <Button color="inherit" component={RouterLink} to="/teacher/dashboard">Teacher Panel</Button>
                                )}
                                {user.role === 'student' && (
                                    <Button color="inherit" component={RouterLink} to="/student/dashboard">My Dashboard</Button>
                                )}
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
