const db = require('../config/database');

const submitFeedback = async (req, res) => {
    const { pickupId } = req.params;
    const { rating, comment, tip } = req.body;
    const { id: userId } = req.user;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating bintang (1-5) wajib diisi.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [requests] = await connection.query(
            `SELECT user_id, assigned_driver_id, status FROM trash_pickup_requests 
             WHERE pickup_id = ?`, 
            [pickupId]
        );
        if (requests.length === 0 || requests[0].user_id !== userId || requests[0].status !== 'completed') {
            await connection.rollback();
            return res.status(403).json({ error: 'Anda tidak berwenang memberikan feedback untuk penjemputan ini atau penjemputan belum selesai.' });
        }
        
        const { assigned_driver_id: driverId } = requests[0];
        if (!driverId) {
            await connection.rollback();
            return res.status(400).json({ error: 'Tugas ini tidak memiliki driver yang ditugaskan.' });
        }
        
        const tipAmount = parseFloat(tip) || 0;

        await connection.query(
            'INSERT INTO pickup_ratings (pickup_id, user_id, driver_id, overall_rating, comment, tip_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [pickupId, userId, driverId, rating, comment || null, tipAmount]
        );

        if (tipAmount > 0) {
            const [wallet] = await connection.query('SELECT wallet_id FROM drivers WHERE driver_id = ?', [driverId]);
            if (wallet.length > 0 && wallet[0].wallet_id) {
                await connection.query('UPDATE driver_wallets SET balance = balance + ? WHERE wallet_id = ?', [tipAmount, wallet[0].wallet_id]);
                await connection.query(
                    'INSERT INTO wallet_transactions (wallet_id, pickup_id, amount, transaction_type, description) VALUES (?, ?, ?, ?, ?)',
                    [wallet[0].wallet_id, pickupId, tipAmount, 'credit_tip', `Tip dari penjemputan #${pickupId}`]
                );
            }
        }
        
        const avgQuery = `
            UPDATE drivers SET 
                rating_average = (SELECT AVG(overall_rating) FROM pickup_ratings WHERE driver_id = ?),
                total_ratings = (SELECT COUNT(*) FROM pickup_ratings WHERE driver_id = ?)
            WHERE driver_id = ?
        `;
        await connection.query(avgQuery, [driverId, driverId, driverId]);

        await connection.commit();
        res.status(201).json({ message: 'Terima kasih atas ulasan Anda!' });

    } catch (err) {
        await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Anda sudah memberikan ulasan untuk penjemputan ini.' });
        }
        console.error("Error submitting feedback:", err);
        res.status(500).json({ error: 'Gagal menyimpan ulasan.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { submitFeedback };