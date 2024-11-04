const jwt = require('jsonwebtoken');
const JWT_SECRET = 'supersecretjwt';

function auth(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token no válido' });
    }
}

module.exports = auth;
