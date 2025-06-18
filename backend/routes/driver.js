const express = require('express');
const router = express.Router();
const { authenticateToken, isDriver } = require('../middleware/auth');
const { 
    getDriverProfile, 
    getDriverHistory,
    updateDriverStatus,
    getDriverActivityStats,
    getActiveTask,
} = require('../controllers/driverController');

router.use(authenticateToken, isDriver);

// GET /api/drivers/profile -> Mengambil data profil lengkap driver
router.get('/profile', getDriverProfile);

// GET /api/drivers/stats -> RUTE BARU untuk mengambil statistik aktivitas
router.get('/stats', getDriverActivityStats);

router.get('/active-task', getActiveTask);

// GET /api/drivers/history
router.get('/history', getDriverHistory);

// PUT /api/drivers/status (untuk mengubah status online/offline, dll)
router.put('/status', updateDriverStatus);

module.exports = router;