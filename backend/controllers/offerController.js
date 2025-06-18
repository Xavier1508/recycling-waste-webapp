const db = require('../config/database');
const socketManager = require('../services/socketManager');
const { findNearestAvailableDriver } = require('./pickupController');

const handleDriverResponse = async (req, res, isAccept) => {
    const { offer_id } = req.params;
    const { id: userId } = req.user;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [offers] = await connection.query(
            `SELECT po.*, d.driver_id 
             FROM pickup_offers po 
             JOIN drivers d ON po.driver_id = d.driver_id
             WHERE po.offer_id = ? AND d.user_id = ? AND po.offer_status = 'sent'`,
            [offer_id, userId]
        );

        if (offers.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Tawaran tidak valid, sudah direspons, atau bukan untuk Anda.' });
        }
        const offer = offers[0];
        const { pickup_id, driver_id } = offer;

        if (isAccept) {
            await connection.query('UPDATE pickup_offers SET offer_status = ?, responded_at = NOW() WHERE offer_id = ?', ['accepted', offer_id]);

            await connection.query(
                "UPDATE trash_pickup_requests SET assigned_driver_id = ?, status = 'assigned_to_driver' WHERE pickup_id = ?",
                [driver_id, pickup_id]
            );

            await connection.query("UPDATE drivers SET availability_status = 'on_pickup' WHERE driver_id = ?", [driver_id]);

            await connection.commit();
            
            const [requestDetails] = await connection.query(
                `SELECT 
                    r.user_id as customer_id,
                    u.first_name as driver_first_name,
                    u.last_name as driver_last_name,
                    u.phone_number as driver_phone,
                    d.rating_average,
                    u.profile_picture_url,
                    v.license_plate,
                    v.vehicle_type
                 FROM trash_pickup_requests r
                 JOIN drivers d ON r.assigned_driver_id = d.driver_id
                 JOIN users u ON d.user_id = u.id
                 LEFT JOIN vehicles v ON d.vehicle_id = v.vehicle_id
                 WHERE r.pickup_id = ?`,
                [pickup_id]
            );

            if (requestDetails.length > 0) {
                const details = requestDetails[0];
                socketManager.notifyUser(details.customer_id, {
                    type: 'pickup_accepted',
                    pickupId: parseInt(pickup_id),
                    driver: {
                        driver_name: `${details.driver_first_name} ${details.driver_last_name}`,
                        phone_number: details.driver_phone,
                        license_plate: details.license_plate,
                        vehicle_type: details.vehicle_type,
                        rating_average: details.rating_average,
                        profile_picture_url: details.profile_picture_url
                    }
                });
            }

            const [fullPickupDetailsForDriver] = await connection.query(
                `SELECT
                    tpr.pickup_id,
                    tpr.pickup_address_text,
                    tpr.pickup_latitude,
                    tpr.pickup_longitude,
                    tpr.notes_for_driver,
                    tpr.preferred_pickup_date,
                    tpr.preferred_pickup_time_slot,
                    tpr.status,
                    u.first_name AS customer_first_name,
                    u.last_name AS customer_last_name,
                    u.phone_number AS customer_phone,
                    ds.site_name AS tpa_name,
                    ds.address_text AS tpa_address,
                    ds.latitude AS tpa_latitude,
                    ds.longitude AS tpa_longitude
                FROM trash_pickup_requests tpr
                JOIN users u ON tpr.user_id = u.id
                JOIN disposal_sites ds ON tpr.assigned_tpa_id = ds.tpa_id
                WHERE tpr.pickup_id = ?`,
                [pickup_id]
            );
            
            res.json({ 
                message: 'Tawaran berhasil diterima. Anda sekarang dalam mode on_pickup.',
                pickupDetails: fullPickupDetailsForDriver[0] || null
            });

        } else {
            await connection.query('UPDATE pickup_offers SET offer_status = ?, responded_at = NOW() WHERE offer_id = ?', ['rejected', offer_id]);
            await connection.commit();

            res.json({ message: 'Tawaran berhasil ditolak.' });

            const [requestDetails] = await db.query('SELECT pickup_latitude, pickup_longitude, user_id, pickup_address_text FROM trash_pickup_requests WHERE pickup_id = ?', [pickup_id]);
            const { pickup_latitude, pickup_longitude, pickup_address_text } = requestDetails[0];
            
            const nextDriver = await findNearestAvailableDriver(pickup_latitude, pickup_longitude, pickup_id);

            if (nextDriver) {
                const [userResult] = await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [requestDetails[0].user_id]);
                const userDetails = userResult[0];

                const [offerResult] = await db.query('INSERT INTO pickup_offers (pickup_id, driver_id, offer_status) VALUES (?, ?, ?)', [pickup_id, nextDriver.driver_id, 'sent']);
                socketManager.sendOfferToDriver(nextDriver.driver_id, { 
                    offer_id: offerResult.insertId,
                    pickup_id, 
                    user_address: pickup_address_text,
                    distance: nextDriver.distance_in_km,
                    user_name: `${userDetails.first_name} ${userDetails.last_name}`
                });
            } else {
                console.log(`Tidak ada driver lain yang tersedia untuk pickup ID: ${pickup_id}`);
                await db.query("UPDATE trash_pickup_requests SET status = 'pending_assignment' WHERE pickup_id = ?", [pickup_id]);
            }
        }

    } catch (err) {
        await connection.rollback();
        console.error('Error handling driver response:', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    } finally {
        if (connection) connection.release();
    }
};

const acceptOffer = (req, res) => handleDriverResponse(req, res, true);
const declineOffer = (req, res) => handleDriverResponse(req, res, false);

module.exports = {
    acceptOffer,
    declineOffer
};