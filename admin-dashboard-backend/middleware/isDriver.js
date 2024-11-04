const isDriver = (req, res, next) => {
    if (req.user.role === 'driver' || req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = isDriver;