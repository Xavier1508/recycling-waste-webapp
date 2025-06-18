const db = require('../config/database');
const socketManager = require('../services/socketManager');

const redeemPoints = async (req, res) => {
    const userId = req.user.id;
    const { catalog_id } = req.body;

    if (!catalog_id) {
        return res.status(400).json({ error: 'ID item katalog wajib diisi.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [catalogItems] = await connection.query('SELECT * FROM catalog_items WHERE catalog_id = ? AND is_active = TRUE FOR UPDATE', [catalog_id]);
        if (catalogItems.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Item katalog tidak ditemukan atau tidak aktif.' });
        }
        const item = catalogItems[0];

        if (item.stock_quantity !== -1 && item.stock_quantity < 1) {
            await connection.rollback();
            return res.status(400).json({ error: 'Maaf, stok item ini telah habis.' });
        }

        const [userPointsSummary] = await connection.query('SELECT current_points FROM user_points_summary WHERE user_id = ?', [userId]);
        if (userPointsSummary.length === 0 || userPointsSummary[0].current_points < item.points_required) {
            await connection.rollback();
            return res.status(400).json({ error: 'Poin Anda tidak cukup untuk menukarkan item ini.' });
        }

        await connection.query(
            'INSERT INTO point_redemptions (user_id, points_redeemed, reward_type, reward_value, description, status, catalog_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, item.points_required, item.item_type, item.item_value, `Redeemed: ${item.item_name}`, 'completed', catalog_id]
        );

        if (item.stock_quantity !== -1) {
            await connection.query('UPDATE catalog_items SET stock_quantity = stock_quantity - 1 WHERE catalog_id = ?', [catalog_id]);
        }

        await connection.commit();
        const [finalPointsSummary] = await db.query('SELECT * FROM user_points_summary WHERE user_id = ?', [userId]);
        
        if (finalPointsSummary.length > 0) {
            socketManager.notifyUser(userId, {
                type: 'points_updated',
                ...finalPointsSummary[0]
            });
        }
        
        res.status(200).json({ message: 'Poin berhasil ditukarkan!' });

    } catch (error) {
        await connection.rollback();
        console.error('Error during point redemption:', error);
        res.status(500).json({ error: 'Gagal menukarkan poin karena kesalahan server.' });
    } finally {
        if (connection) connection.release();
    }
};

const getRedemptionHistory = async (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT pr.redeem_id, pr.points_redeemed, pr.description, pr.status, pr.redeemed_at, ci.item_name
        FROM point_redemptions pr
        LEFT JOIN catalog_items ci ON pr.catalog_id = ci.catalog_id
        WHERE pr.user_id = ?
        ORDER BY pr.redeemed_at DESC
    `;
    
    try {
        const [history] = await db.query(query, [userId]);
        res.json(history);
    } catch(err) {
        console.error("Gagal mengambil riwayat penukaran:", err);
        res.status(500).json({ error: "Gagal mengambil riwayat penukaran." });
    }
};

module.exports = {
    redeemPoints,
    getRedemptionHistory
};