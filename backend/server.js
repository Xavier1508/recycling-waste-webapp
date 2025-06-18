const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

//Express dan HTTP server
const app = express();
const server = http.createServer(app); 

// Inisialisasi Socket.IO
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
        methods: ["GET", "POST"]
    }
});

const socketManager = require('./services/socketManager'); //
socketManager.initializeSocketManager(io); //

// Import database
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const addressRoutes = require('./routes/address');
const pickupRoutes = require('./routes/pickups');
const catalogRoutes = require('./routes/catalog');
const redeemRoutes = require('./routes/redeem');
const driverRoutes = require('./routes/driver');
const offerRoutes = require('./routes/offers');
const feedbackRoutes = require('./routes/feedback');

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk file statis (misalnya gambar user di folder public)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/catalog-items', catalogRoutes);
app.use('/api/points', redeemRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/feedback', feedbackRoutes);

// Tes route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running successfully!' });
});

// Global error handler (termasuk error dari multer)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File terlalu besar. Maksimal 5MB.' });
        }
    }

    if (err.message === 'Hanya file gambar yang diizinkan!') {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Terjadi kesalahan pada server!' });
});

// Jalankan server
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    try {
        await db.query('SELECT 1');
        console.log('Koneksi MySQL berhasil diverifikasi saat startup.');
    } catch (err) {
        console.error('Gagal menyambung ke MySQL saat startup:', err.message);
        process.exit(1);
    }
});