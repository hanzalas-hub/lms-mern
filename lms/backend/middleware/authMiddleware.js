const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_for_emergency_use_only';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found, authorization failed' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};

module.exports = auth;
