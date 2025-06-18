const db = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Fungsi untuk mendapatkan profil user
const getProfile = async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT id, email, phone_number, first_name, last_name, profile_picture_url, role, account_status, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error("Error getProfile:", err);
        return res.status(500).json({ error: 'Database error' });
    }
};

// Fungsi untuk update profil user
const updateProfile = async (req, res) => {
    const { first_name, last_name, phone_number } = req.body;
    const userId = req.user.id;
    if (!first_name || !last_name || !phone_number) {
        return res.status(400).json({ error: 'Nama depan, nama belakang, dan nomor telepon wajib diisi.' });
    }
    try {
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, updated_at = NOW() WHERE id = ?',
            [first_name, last_name, phone_number, userId]
        );
        res.json({ message: 'Profil berhasil diperbarui.' });
    } catch (err) {
        console.error("Error updateProfile:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Nomor telepon sudah digunakan.' });
        }
        return res.status(500).json({ error: 'Gagal memperbarui profil.' });
    }
};

// Fungsi untuk upload foto profil
const uploadProfilePicture = async (req, res) => {
    const userId = req.user.id;
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file foto yang diunggah.' });
    }
    const profilePictureUrl = `/uploads/avatars/${req.file.filename}`;
    try {
        const [oldData] = await db.query('SELECT profile_picture_url FROM users WHERE id = ?', [userId]);
        if (oldData[0]?.profile_picture_url) {
            const oldFilePath = path.join(__dirname, '..', 'public', oldData[0].profile_picture_url);
            if (fs.existsSync(oldFilePath) && oldData[0].profile_picture_url.includes('/uploads/avatars/')) {
                fs.unlink(oldFilePath, (err) => err && console.error("Gagal hapus foto lama:", err));
            }
        }
        await db.query(
            'UPDATE users SET profile_picture_url = ?, updated_at = NOW() WHERE id = ?',
            [profilePictureUrl, userId]
        );
        res.json({ message: 'Foto profil berhasil diperbarui.', profile_picture_url: profilePictureUrl });
    } catch (err) {
        console.error("Error updateProfilePicture DB:", err);
        fs.unlink(req.file.path, (err) => err && console.error("Gagal hapus foto baru:", err));
        return res.status(500).json({ error: 'Gagal memperbarui foto profil.' });
    }
};

// Fungsi untuk ganti password
const changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;
    if (!oldPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Input tidak valid. Pastikan semua field terisi, password baru cocok dan minimal 6 karakter.' });
    }
    try {
        const [results] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (results.length === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
        
        const isMatch = await bcrypt.compare(oldPassword, results[0].password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Password lama salah.' });

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newPasswordHash, userId]);
        res.json({ message: 'Password berhasil diganti.' });
    } catch (error) {
        console.error("Server error changePassword:", error);
        res.status(500).json({ error: 'Kesalahan server.' });
    }
};

// Fungsi untuk mendapatkan pickup yang sedang aktif
const getActivePickup = async (req, res) => {
    const userId = req.user.id;
    try {
        const [pickup] = await db.query(
            `SELECT pickup_id, status FROM trash_pickup_requests WHERE user_id = ? 
             AND status IN ('assigned_to_driver', 'driver_en_route', 'arrived_at_location', 'picked_up') 
             ORDER BY requested_at DESC LIMIT 1;`,
            [userId]
        );
        res.json(pickup.length > 0 ? pickup[0] : null);
    } catch (err) {
        console.error("Error fetching active pickup:", err);
        res.status(500).json({ error: "Gagal mengambil data penjemputan aktif." });
    }
};

// Fungsi getUserPoints diubah ke async/await
const getUserPoints = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM user_points_summary WHERE user_id = ?', [req.user.id]);
        
        const userPoints = results.length > 0 ? results[0] : {
            user_id: req.user.id,
            total_points_earned: 0,
            total_points_redeemed: 0,
            current_points: 0
        };
        res.json(userPoints);
        
    } catch (err) {
        console.error('Error fetching user points:', err);
        return res.status(500).json({ error: 'Database error' });
    }
};

// Fungsi untuk mendapatkan ringkasan poin
const getPointsSummary = async (req, res) => {
    const userId = req.user.id;
    try {
        const [summary] = await db.query('SELECT * FROM user_points_summary WHERE user_id = ?', [userId]);
        if (summary.length === 0) {
            return res.json({ current_points: 0, total_points_earned: 0, total_points_redeemed: 0 });
        }
        res.json(summary[0]);
    } catch (err) {
        console.error('Error fetching points summary:', err);
        res.status(500).json({ error: 'Gagal memuat ringkasan poin.' });
    }
};

// Fungsi untuk mendapatkan riwayat poin
const getRecentPointsHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            (SELECT 'earned' as type, points_earned, description, created_at, request_id as 'transaction_id' 
             FROM points WHERE user_id = ? AND points_type IN ('pickup', 'bonus', 'manual'))
            UNION ALL
            (SELECT 'redeemed' as type, -points_redeemed as points_earned, description, redeemed_at as created_at, redeem_id as 'transaction_id' 
             FROM point_redemptions WHERE user_id = ? AND status = 'completed')
            ORDER BY created_at DESC LIMIT 10;
        `;
        const [history] = await db.query(query, [userId, userId]);
        res.json(history);
    } catch (err) {
        console.error('Error fetching recent points history:', err);
        res.status(500).json({ error: 'Gagal memuat riwayat poin.' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    getActivePickup,
    getUserPoints,
    getPointsSummary,
    getRecentPointsHistory,
};