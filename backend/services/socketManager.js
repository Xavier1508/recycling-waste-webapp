const driverController = require('../controllers/driverController');
const db = require('../config/database');

// Objek untuk memetakan ID ke socketId
const driverSockets = {};
const userSockets = {};

let ioInstance = null;

const haversineDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return Infinity;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const sendOfferToDriver = (driverId, offerDetails) => {
    const socketId = driverSockets[driverId];
    if (ioInstance && socketId) {
        ioInstance.to(socketId).emit('new_pickup_offer', offerDetails);
        console.log(`Mengirim tawaran pickup ${offerDetails.pickup_id} ke driver ${driverId}`);
        return true;
    }
    console.log(`Gagal mengirim tawaran: Driver ${driverId} tidak terhubung atau ioInstance belum siap.`);
    return false;
};

const notifyUser = (userId, payload) => {
    const socketId = userSockets[userId];
    if (ioInstance && socketId) {
        ioInstance.to(socketId).emit(payload.type, payload);
        console.log(`Mengirim notifikasi '${payload.type}' ke user ${userId} via socket ${socketId}`);
        return true;
    }
    console.log(`Gagal mengirim notifikasi: User ${userId} tidak terhubung atau ioInstance belum siap.`);
    return false;
};

const initializeSocketManager = (io) => {
    ioInstance = io;
    
    io.on('connection', async (socket) => {
        const { driverId, userId } = socket.handshake.query;

        if (driverId) {
            console.log(`Driver ${driverId} terhubung dengan socket ID: ${socket.id}`);
            driverSockets[driverId] = socket.id;
        } else if (userId) {
            console.log(`User ${userId} terhubung dengan socket ID: ${socket.id}`);
            userSockets[userId] = socket.id;
        } else {
            console.log(`Koneksi (non-user) terhubung: ${socket.id}`);
        }

        socket.on('driver-location-update', async (data) => {
            if (data && data.driverId && data.latitude && data.longitude) {
                await driverController.updateDriverLocation(data.driverId, data.latitude, data.longitude);
                
                io.emit('driver-location-broadcast', {
                    driver_id: data.driverId,
                    current_latitude: data.latitude,
                    current_longitude: data.longitude
                });

                try {
                    const [activeTasks] = await db.query(
                        `SELECT tpr.pickup_id, tpr.user_id, tpr.status, 
                                tpr.pickup_latitude, tpr.pickup_longitude,
                                ds.site_name as tpa_name, ds.latitude as tpa_latitude, ds.longitude as tpa_longitude
                         FROM trash_pickup_requests tpr
                         LEFT JOIN disposal_sites ds ON tpr.assigned_tpa_id = ds.tpa_id
                         WHERE tpr.assigned_driver_id = ? AND tpr.status IN ('assigned_to_driver', 'driver_en_route', 'arrived_at_location', 'picked_up')`,
                        [data.driverId]
                    );

                    if (activeTasks.length > 0) {
                        const task = activeTasks[0];
                        const driverCoords = { lat: data.latitude, lon: data.longitude };
                        const userCoords = { lat: task.pickup_latitude, lon: task.pickup_longitude };
                        const tpaCoords = { lat: task.tpa_latitude, lon: task.tpa_longitude };

                        let statusMessage = "Dalam perjalanan...";
                        let newStatus = task.status;

                        if (task.status === 'assigned_to_driver' || task.status === 'driver_en_route') {
                            const distanceToUser = haversineDistance(driverCoords, userCoords);
                            if (distanceToUser < 0.1) {
                                statusMessage = "Driver telah tiba di lokasi Anda!";
                                newStatus = 'arrived_at_location';
                            } else if (distanceToUser < 0.5) {
                                statusMessage = "Driver sudah dekat dengan lokasi Anda.";
                                newStatus = 'driver_en_route';
                            } else {
                                statusMessage = `Driver sedang menuju lokasi Anda (${distanceToUser.toFixed(1)} km)`;
                                newStatus = 'driver_en_route';
                            }
                        } else if (task.status === 'picked_up') {
                            const distanceToTPA = haversineDistance(driverCoords, tpaCoords);
                            statusMessage = `Dalam perjalanan menuju TPA ${task.tpa_name || ''} (${distanceToTPA.toFixed(1)} km)`;
                        }

                        if (newStatus !== task.status) {
                            await db.query("UPDATE trash_pickup_requests SET status = ? WHERE pickup_id = ?", [newStatus, task.pickup_id]);
                        }

                        notifyUser(task.user_id, {
                            type: 'pickup_status_update',
                            pickupId: task.pickup_id,
                            status_message: statusMessage
                        });
                    }
                } catch (err) {
                    console.error("Error saat proses update lokasi & status:", err);
                }
            }
        });

        socket.on('disconnect', () => {
            for (const id in driverSockets) {
                if (driverSockets[id] === socket.id) {
                    delete driverSockets[id];
                    console.log(`Driver ${id} terputus.`);
                    break;
                }
            }
            for (const id in userSockets) {
                if (userSockets[id] === socket.id) {
                    delete userSockets[id];
                    console.log(`User ${id} terputus.`);
                    break;
                }
            }
        });
    });
};

module.exports = {
    initializeSocketManager,
    sendOfferToDriver,
    notifyUser
};