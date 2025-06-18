const db = require('../config/database');
const socketManager = require('../services/socketManager');

const findNearestTPA = async (pickupLat, pickupLon) => {
    if (!pickupLat || !pickupLon) return null;
    const query = `
        SELECT tpa_id, site_name, latitude, longitude, (
            111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(? - longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude)))))
        ) AS distance_in_km
        FROM disposal_sites WHERE is_active = TRUE ORDER BY distance_in_km ASC LIMIT 1;
    `;
    const [tpas] = await db.query(query, [pickupLat, pickupLon, pickupLat]);
    return tpas.length > 0 ? tpas[0] : null;
};

// Fungsi internal untuk mencari driver terdekat
const findNearestAvailableDriver = async (pickupLat, pickupLon, pickupIdToExcludeOffers = null) => {
    if (!pickupLat || !pickupLon) return null;
    let query = `
        SELECT d.driver_id, u.first_name, u.last_name, u.phone_number, v.license_plate, v.vehicle_type,
        (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(?)) * COS(RADIANS(d.current_latitude)) * COS(RADIANS(? - d.current_longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(d.current_latitude)))))) AS distance_in_km
        FROM drivers d JOIN users u ON d.user_id = u.id LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
        WHERE d.availability_status = 'available' AND d.current_latitude IS NOT NULL AND d.current_longitude IS NOT NULL
    `;
    const queryParams = [pickupLat, pickupLon, pickupLat];
    
    if (pickupIdToExcludeOffers) {
        query += ` AND d.driver_id NOT IN (SELECT driver_id FROM pickup_offers WHERE pickup_id = ? AND offer_status IN ('rejected', 'timed_out'))`;
        queryParams.push(pickupIdToExcludeOffers);
    }
    query += ` ORDER BY distance_in_km ASC LIMIT 1;`;
    
    const [drivers] = await db.query(query, queryParams);
    return drivers.length > 0 ? drivers[0] : null;
};

// Membuat permintaan penjemputan baru
const createPickupRequest = async (req, res) => {
    const { address_id, pickup_date, pickup_time, notes, trash_types, estimated_weight_kg } = req.body;
    const userId = req.user.id;

    if (!address_id || !pickup_date || !pickup_time || !trash_types || !estimated_weight_kg) {
        return res.status(400).json({ error: "Semua field, termasuk estimasi berat, wajib diisi." });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [addressDetails] = await connection.query('SELECT * FROM addresses WHERE address_id = ? AND user_id = ?', [address_id, userId]);
        if (addressDetails.length === 0 || !addressDetails[0].latitude || !addressDetails[0].longitude) {
            await connection.rollback();
            return res.status(400).json({ error: 'Alamat yang dipilih tidak memiliki data lokasi (GPS). Mohon perbarui alamat Anda.' });
        }
        const addr = addressDetails[0];

        const nearestTPA = await findNearestTPA(addr.latitude, addr.longitude);
        if (!nearestTPA) {
            await connection.rollback();
            return res.status(500).json({ error: "Tidak dapat menemukan TPA terdekat yang aktif dari lokasi Anda." });
        }

        const newRequest = { 
            user_id: userId, 
            address_id: addr.address_id, 
            pickup_address_text: addr.address_text, 
            pickup_city: addr.city, 
            pickup_postal_code: addr.postal_code, 
            pickup_latitude: addr.latitude, 
            pickup_longitude: addr.longitude, 
            preferred_pickup_date: pickup_date, 
            preferred_pickup_time_slot: pickup_time, 
            notes_for_driver: notes, 
            status: 'pending_assignment', 
            assigned_tpa_id: nearestTPA.tpa_id, 
            total_weight_kg: estimated_weight_kg || 0 
        };
        const [results] = await connection.query('INSERT INTO trash_pickup_requests SET ?', newRequest);
        const pickupId = results.insertId;

        // Simpan foto ke tabel 'trash_photos' jika ada
        let photoUrl = null;
        if (req.file) {
            photoUrl = `/uploads/pickups/${req.file.filename}`;
            await connection.query(
                'INSERT INTO trash_photos (request_id, photo_url, photo_type) VALUES (?, ?, ?)',
                [pickupId, photoUrl, 'before_pickup']
            );
        }
        
        // Simpan jenis sampah yang dipilih ke tabel trash_items
        const parsedTrashTypes = JSON.parse(trash_types);
        if (Array.isArray(parsedTrashTypes) && parsedTrashTypes.length > 0) {
            const trashItemsQuery = 'INSERT INTO trash_items (pickup_id, category_id, weight_kg, points_earned) SELECT ?, tc.category_id, 0, 0 FROM trash_categories tc WHERE tc.category_code IN (?)';
            await connection.query(trashItemsQuery, [pickupId, parsedTrashTypes]);
        }
        
        await connection.commit();
        
        // Cari driver terdekat dan kirim penawaran
        const nearestDriver = await findNearestAvailableDriver(addr.latitude, addr.longitude);
        if (nearestDriver) {
            const [offerResult] = await db.query('INSERT INTO pickup_offers (pickup_id, driver_id) VALUES (?, ?)', [pickupId, nearestDriver.driver_id]);
            socketManager.sendOfferToDriver(nearestDriver.driver_id, {
                offer_id: offerResult.insertId,
                pickup_id: pickupId,
                user_name: `${req.user.first_name} ${req.user.last_name}`,
                user_address: addr.address_text,
                trash_photo_url: photoUrl,
                trash_types: parsedTrashTypes,
                estimated_weight: estimated_weight_kg,
                destination_tpa: nearestTPA,
                distance: nearestDriver.distance_in_km
            });
        }

        res.status(201).json({ message: 'Permintaan penjemputan berhasil dibuat dan sedang mencari driver.', pickup_id: pickupId });
    } catch (err) {
        await connection.rollback();
        console.error('Error creating pickup request:', err);
        res.status(500).json({ error: 'Gagal membuat permintaan penjemputan.' });
    } finally {
        if (connection) connection.release();
    }
};

// Mengambil detail sebuah pickup
const getPickupDetailsById = async (req, res) => {
    const { pickupId } = req.params;
    const { id: userId, role } = req.user;

    try {
        const query = `
            SELECT 
                tpr.*, 
                cust.first_name as customer_name,
                cust.profile_picture_url as customer_profile_url,
                
                -- Mengambil data lokasi customer dari tabel request (sumber yang paling akurat)
                tpr.pickup_latitude as customer_latitude,
                tpr.pickup_longitude as customer_longitude,
                
                driver_user.first_name as driver_name,
                driver_user.profile_picture_url as driver_profile_url,
                d.driver_id,
                
                -- Mengambil data lokasi driver
                d.current_latitude as driver_latitude,
                d.current_longitude as driver_longitude,

                v.license_plate,
                v.vehicle_type,
                tpa.site_name as tpa_name,
                tpa.latitude as tpa_latitude,
                tpa.longitude as tpa_longitude
            FROM trash_pickup_requests tpr
            JOIN users cust ON tpr.user_id = cust.id
            -- Mengubah ke LEFT JOIN untuk keamanan jika alamat terhapus
            LEFT JOIN addresses addr ON tpr.address_id = addr.address_id
            LEFT JOIN drivers d ON tpr.assigned_driver_id = d.driver_id
            LEFT JOIN users driver_user ON d.user_id = driver_user.id
            LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
            LEFT JOIN disposal_sites tpa ON tpr.assigned_tpa_id = tpa.tpa_id
            WHERE tpr.pickup_id = ?
        `;
        const [requests] = await db.query(query, [pickupId]);
        
        if (requests.length === 0) {
            return res.status(404).json({ error: 'Detail penjemputan tidak ditemukan.' });
        }
        
        const request = requests[0];
        
        if (role === 'customer' && request.user_id !== userId) {
            return res.status(403).json({ error: 'Akses ditolak.' });
        }
        if (role === 'driver' && request.assigned_driver_id) {
            const [driverCheck] = await db.query('SELECT user_id FROM drivers WHERE driver_id = ?', [request.assigned_driver_id]);
            if(driverCheck.length === 0 || driverCheck[0].user_id !== userId) {
                return res.status(403).json({ error: 'Ini bukan tugas Anda.' });
            }
        } else if (role === 'driver' && !request.assigned_driver_id) {
            return res.status(403).json({ error: 'Tugas ini belum ditugaskan ke Anda.' });
        }
        
        const [items] = await db.query(
            `SELECT ti.item_id, ti.weight_kg, tc.category_name 
             FROM trash_items ti
             JOIN trash_categories tc ON ti.category_id = tc.category_id
             WHERE ti.pickup_id = ?`, 
            [pickupId]
        );
        
        request.items = items;

        res.json(request);

    } catch (err) {
        console.error("Error fetching pickup details by ID:", err);
        res.status(500).json({ error: 'Gagal mengambil detail penjemputan.' });
    }
};

// Mengupdate berat item-item dalam sebuah pickup oleh driver
const updatePickupItems = async (req, res) => {
    const { pickupId } = req.params;
    const { items } = req.body;
    const { id: userId } = req.user;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Data item tidak valid.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [requests] = await connection.query(
            `SELECT d.driver_id FROM trash_pickup_requests tpr 
             JOIN drivers d ON tpr.assigned_driver_id = d.driver_id 
             WHERE tpr.pickup_id = ? AND d.user_id = ?`,
            [pickupId, userId]
        );
        if (requests.length === 0) {
            await connection.rollback();
            return res.status(403).json({ error: 'Anda tidak berwenang untuk mengupdate tugas ini.' });
        }
        
        await Promise.all(items.map(item => {
            if (item.item_id && typeof item.weight_kg !== 'undefined') {
                return connection.query(
                    'UPDATE trash_items SET weight_kg = ? WHERE item_id = ? AND pickup_id = ?',
                    [parseFloat(item.weight_kg) || 0, item.item_id, pickupId]
                );
            }
            return Promise.resolve();
        }));
        
        await connection.commit();
        res.status(200).json({ message: 'Berat sampah berhasil diperbarui. Poin telah dihitung ulang.' });
    } catch (err) {
        await connection.rollback();
        console.error('Error updating pickup items:', err);
        res.status(500).json({ error: 'Gagal memperbarui berat item.' });
    } finally {
        if (connection) connection.release();
    }
};

// Menyelesaikan tugas pickup oleh driver
const completePickupRequest = async (req, res) => {
    const { pickupId } = req.params;
    const { id: userId } = req.user;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [requests] = await connection.query(
            `SELECT tpr.*, d.driver_id, tpa.site_name as tpa_name 
             FROM trash_pickup_requests tpr
             JOIN drivers d ON tpr.assigned_driver_id = d.driver_id
             LEFT JOIN disposal_sites tpa ON tpr.assigned_tpa_id = tpa.tpa_id
             WHERE tpr.pickup_id = ? AND d.user_id = ? AND tpr.status NOT IN ('completed', 'cancelled_by_user', 'failed')`,
            [pickupId, userId]
        );
        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Tugas tidak valid atau sudah diselesaikan.' });
        }
        const request = requests[0];
        const customerUserId = request.user_id;

        await connection.query("UPDATE trash_pickup_requests SET status = 'completed', actual_pickup_time = NOW() WHERE pickup_id = ?", [pickupId]);
        await connection.query('CALL CalculatePickupPoints(?)', [pickupId]);
        
        const [updatedRequest] = await connection.query('SELECT total_points_earned FROM trash_pickup_requests WHERE pickup_id = ?', [pickupId]);
        const pointsEarned = updatedRequest[0].total_points_earned || 0;

        if (pointsEarned > 0) {
            await connection.query(
                'INSERT INTO points (user_id, request_id, points_earned, points_type, description) VALUES (?, ?, ?, ?, ?)',
                [customerUserId, pickupId, pointsEarned, 'pickup', `Poin dari penjemputan sampah #${pickupId}`]
            );
        }

        await connection.query("UPDATE drivers SET availability_status = 'available' WHERE driver_id = ?", [request.driver_id]);
        await connection.commit();
        
        socketManager.notifyUser(customerUserId, {
            type: 'pickup_completed',
            pickupId: parseInt(pickupId),
            tpa: { name: request.tpa_name },
            points_earned: pointsEarned
        });
        
        res.json({ message: 'Tugas berhasil diselesaikan! Poin telah diberikan kepada user.' });
    } catch (err) {
        await connection.rollback();
        console.error('Error completing pickup request:', err);
        res.status(500).json({ error: 'Gagal menyelesaikan tugas karena kesalahan server.' });
    } finally {
        if (connection) connection.release();
    }
};

// Mendapatkan riwayat pickup
const getPickupHistory = async (req,res) => {
    const userId = req.user.id;
    try {
        const [results] = await db.query('SELECT * FROM pickup_details WHERE user_id = ? ORDER BY requested_at DESC', [userId]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching pickup history:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Mendapatkan kategori sampah
const getTrashCategories = async (req,res) => {
    try {
        const [results] = await db.query('SELECT * FROM trash_categories ORDER BY category_id ASC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching trash categories:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = {
    createPickupRequest,
    getPickupHistory,
    getTrashCategories,
    findNearestAvailableDriver,
    completePickupRequest,
    getPickupDetailsById,
    updatePickupItems,
};