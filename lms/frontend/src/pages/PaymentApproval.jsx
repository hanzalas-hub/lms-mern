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
    Link
} from '@mui/material';
import api from '../services/api';

const PaymentApproval = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/payments/pending');
            setPayments(data);
        } catch (err) {
            setError('Failed to fetch pending payments');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setError('');
            setSuccess('');
            await api.put(`/payments/${id}`, { status });
            setSuccess(`Payment ${status} successfully`);
            fetchPayments(); // Refresh list
        } catch (err) {
            setError('Failed to update payment status');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Payment Approval Panel</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Receipt</TableCell>
                            <TableCell>Submitted At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No pending payments found</TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment._id}>
                                    <TableCell>
                                        {payment.user_id?.name} ({payment.user_id?.email})
                                    </TableCell>
                                    <TableCell>{payment.course_id?.title || 'Course Details Not Found'}</TableCell>
                                    <TableCell>
                                        <Link
                                            href={`http://localhost:5000${payment.receipt_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Receipt
                                        </Link>
                                    </TableCell>
                                    <TableCell>{new Date(payment.submitted_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => handleUpdateStatus(payment._id, 'approved')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleUpdateStatus(payment._id, 'rejected')}
                                            >
                                                Reject
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PaymentApproval;
