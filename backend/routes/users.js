const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = req.user.id + '-' + Date.now() + path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diizinkan!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// RUTE UNTUK PROFIL PENGGUNA
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.put('/profile/password', authenticateToken, userController.changePassword);
router.post('/profile/avatar', authenticateToken, upload.single('avatar'), userController.uploadProfilePicture);

// RUTE UNTUK DATA DINAMIS PADA PROFIL
router.get('/active-pickup', authenticateToken, userController.getActivePickup);

// RUTE UNTUK POIN
// Menyediakan data ringkasan total poin (Card besar di profil)
router.get('/me/points/summary', authenticateToken, userController.getPointsSummary);

// Menyediakan data riwayat poin (Card poin masuk & keluar di profil)
router.get('/me/points/history', authenticateToken, userController.getRecentPointsHistory);


module.exports = router;