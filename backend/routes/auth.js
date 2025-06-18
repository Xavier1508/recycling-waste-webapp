const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    logout,
    registerDriver,
    loginDriver
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Import middleware upload

// === Rute untuk Customer ===
router.post('/register', register);
router.post('/login', login);

// === Rute untuk Driver ===
router.post('/driver/register', upload.single('profile_picture'), registerDriver);
router.post('/driver/login', loginDriver);

// === Rute General ===
router.post('/logout', authenticateToken, logout);

module.exports = router;
