const isClient = (req, res, next) => {
    if (req.user.role !== 'client' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

module.exports = isClient;