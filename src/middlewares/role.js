function roleMiddleware(requiredRole) {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: `Access forbidden: ${req.user.role}` });
        }
        next();
    };
}

module.exports = roleMiddleware;
