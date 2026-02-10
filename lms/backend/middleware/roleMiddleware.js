const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied: You do not have the required permissions for this action'
            });
        }
        next();
    };
};

module.exports = roleMiddleware;
