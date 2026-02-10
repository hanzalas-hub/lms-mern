const express = require('express');
const router = express.Router();
const {
    createSecurityFee,
    uploadReceipt,
    getMyPayments,
    getPendingPayments,
    updatePaymentStatus,
} = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student routes
router.post('/create', auth, roleMiddleware(['student']), createSecurityFee);
router.post('/upload/:security_fee_id', auth, roleMiddleware(['student']), upload.single('receipt'), uploadReceipt);
router.get('/my', auth, roleMiddleware(['student']), getMyPayments);

// Admin routes
router.get('/pending', auth, roleMiddleware(['admin']), getPendingPayments);
router.put('/:id', auth, roleMiddleware(['admin']), updatePaymentStatus);

module.exports = router;
