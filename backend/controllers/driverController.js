const db = require('../config/database');

const getDriverProfile = async (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT 
            u.id as user_id, u.first_name, u.last_name, u.email, u.phone_number, u.profile_picture_url, u.role, u.account_status,
            d.driver_id, d.driver_code, d.license_number, d.license_expiry_date, d.availability_status, d.current_latitude, d.current_longitude, d.rating_average, d.total_ratings, d.is_approved,
            v.license_plate, v.vehicle_type
        FROM users u
        LEFT JOIN drivers d ON u.id = d.user_id
        LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
        WHERE u.id = ? AND u.role = 'driver'
    `;
    try {
        const [results] = await db.query(query, [userId]);
        if (results.length === 0 || !results[0].driver_id) {
            return res.status(404).json({ error: 'Profil driver tidak ditemukan.' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error("Error fetching driver profile:", err);
        res.status(500).json({ error: 'Server error saat mengambil profil driver.' });
    }
};

const getDriverHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const [driverResults] = await db.query('SELECT driver_id FROM drivers WHERE user_id = ?', [userId]);
        if (driverResults.length === 0) return res.status(404).json({ error: 'Driver tidak ditemukan.' });
        
        const driverId = driverResults[0].driver_id;
        const historyQuery = `
            SELECT tpr.pickup_id, tpr.status, tpr.requested_at, tpr.pickup_address_text as pickup_address,
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM trash_pickup_requests tpr
            JOIN users u ON tpr.user_id = u.id
            WHERE tpr.assigned_driver_id = ? ORDER BY tpr.requested_at DESC
        `;
        const [historyResults] = await db.query(historyQuery, [driverId]);
        res.json(historyResults);
    } catch (err) {
        console.error("Error fetching driver history:", err);
        res.status(500).json({ error: 'Server error saat mengambil riwayat tugas.' });
    }
};

const updateDriverStatus = async (req, res) => {
    const userId = req.user.id;
    const { availability_status } = req.body;
    const validStatuses = ['available', 'on_pickup', 'offline', 'on_break'];

    if (!availability_status || !validStatuses.includes(availability_status)) {
        return res.status(400).json({ error: 'Status yang diberikan tidak valid.' });
    }

    try {
        const [result] = await db.query('UPDATE drivers SET availability_status = ? WHERE user_id = ?', [availability_status, userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Driver tidak ditemukan.' });
        res.json({ message: `Status berhasil diubah menjadi ${availability_status}` });
    } catch (err) {
        console.error("Error updating driver status:", err);
        res.status(500).json({ error: 'Server error saat mengubah status.' });
    }
};

const getDriverActivityStats = async (req, res) => {
    const userId = req.user.id;
    try {
        const [driver] = await db.query('SELECT driver_id FROM drivers WHERE user_id = ?', [userId]);
        if (driver.length === 0) return res.status(404).json({ error: 'Driver tidak ditemukan.' });
        
        const driverId = driver[0].driver_id;

        const query = `
            SELECT 
                -- Tugas Masuk Hari Ini: Semua tugas yang ditugaskan ke driver hari ini
                (SELECT COUNT(*) FROM trash_pickup_requests WHERE assigned_driver_id = ? AND DATE(requested_at) = CURDATE()) as tasks_today,
                -- Tugas Selesai: Semua tugas yang pernah diselesaikan oleh driver
                (SELECT COUNT(*) FROM trash_pickup_requests WHERE assigned_driver_id = ? AND status = 'completed') as tasks_completed,
                -- Menunggu Konfirmasi: Tugas yang sudah dijemput tapi belum 'completed' atau 'failed'
                (SELECT COUNT(*) FROM trash_pickup_requests WHERE assigned_driver_id = ? AND status IN ('picked_up', 'processing_at_facility')) as tasks_pending_confirmation
            FROM DUAL;
        `;
        const [stats] = await db.query(query, [driverId, driverId, driverId]);
        res.json(stats[0]);
    } catch (err) {
        console.error("Error fetching driver activity stats:", err);
        res.status(500).json({ error: 'Server error saat mengambil statistik aktivitas.' });
    }
};

const updateDriverLocation = async (driverId, latitude, longitude) => {
    if (!driverId || latitude === undefined || longitude === undefined) {
        console.error("Data lokasi tidak lengkap untuk diupdate.");
        return;
    }
    try {
        await db.query(
            'UPDATE drivers SET current_latitude = ?, current_longitude = ?, last_location_update = NOW() WHERE driver_id = ?',
            [latitude, longitude, driverId]
        );
    } catch (err) {
        console.error(`Gagal update lokasi untuk driver ${driverId}:`, err);
    }
};

const getActiveTask = async (req, res) => {
    const userId = req.user.id;
    try {
        const [driver] = await db.query('SELECT driver_id FROM drivers WHERE user_id = ?', [userId]);
        if (driver.length === 0) {
            return res.json(null);
        }
        
        const driverId = driver[0].driver_id;

        const query = `
            SELECT 
                tpr.pickup_id, tpr.status, tpr.pickup_address_text,
                tpr.pickup_latitude as customer_latitude, tpr.pickup_longitude as customer_longitude,
                cust.first_name as customer_name,
                tpa.site_name as tpa_name, tpa.latitude as tpa_latitude, tpa.longitude as tpa_longitude
            FROM trash_pickup_requests tpr
            JOIN users cust ON tpr.user_id = cust.id
            LEFT JOIN disposal_sites tpa ON tpr.assigned_tpa_id = tpa.tpa_id
            WHERE tpr.assigned_driver_id = ? 
            AND tpr.status IN ('assigned_to_driver', 'driver_en_route', 'arrived_at_location', 'picked_up')
            LIMIT 1;
        `;
        
        const [task] = await db.query(query, [driverId]);

        res.json(task.length > 0 ? task[0] : null);

    } catch (err) {
        console.error("Error fetching driver's active task:", err);
        res.status(500).json({ error: 'Server error saat mengambil tugas aktif.' });
    }
};

module.exports = {
    getDriverProfile,
    getDriverHistory,
    updateDriverStatus,
    getDriverActivityStats,
    updateDriverLocation,
    getActiveTask
};