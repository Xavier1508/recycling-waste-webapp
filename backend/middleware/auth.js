const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token dibutuhkan' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(403).json({ error: 'User tidak ditemukan' });
        }

        req.user = users[0];
        next();

    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa' });
        }
        console.error("Authentication error:", err);
        return res.status(500).json({ error: 'Kesalahan server saat otentikasi.' });
    }
};

const isDriver = (req, res, next) => {
    if (req.user && req.user.role === 'driver') {
        next();
    } else {
        res.status(403).json({ error: 'Akses ditolak. Rute ini hanya untuk driver.' });
    }
};

const isCustomer = (req, res, next) => {
    if (req.user && req.user.role === 'customer') {
        next();
    } else {
        res.status(403).json({ error: 'Akses ditolak. Rute ini hanya untuk customer.' });
    }
};

module.exports = { 
    authenticateToken, 
    isDriver,
    isCustomer
};