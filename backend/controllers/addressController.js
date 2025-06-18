const db = require('../config/database');
const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'locationiq',
  apiKey: process.env.LOCATIONIQ_ACCESS_TOKEN,
  formatter: null
};
const geocoder = NodeGeocoder(options);

const getCoordinatesFromAddress = async (addressData) => {
  const fullAddressString = `${addressData.address_text}, ${addressData.city}, ${addressData.province}, ${addressData.postal_code}, Indonesia`;

  try {
    const results = await geocoder.geocode(fullAddressString);
    
    if (results && results.length > 0) {
      const location = results[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        gmaps_place_id: `liq_${location.extra.place_id || Date.now()}`
      };
    }
    throw new Error("Alamat tidak dapat ditemukan oleh layanan Geocoding. Mohon periksa kembali.");
  } catch (error) {
    console.error("Node-geocoder error:", error);
    throw new Error(error.message || "Layanan Geocoding sedang tidak tersedia.");
  }
};

const addAddress = async (req, res) => {
    const userId = req.user.id;
    let { alias_name, address_text, city, province, postal_code, is_active, latitude, longitude, gmaps_place_id } = req.body;

    if (!address_text || !city || !postal_code) {
        return res.status(400).json({ error: 'Data alamat dasar wajib diisi.' });
    }

    const connection = await db.getConnection();
    try {
        if (!latitude || !longitude) {
            console.log("Koordinat tidak ada, menjalankan fallback geocoding...");
            const coordinates = await getCoordinatesFromAddress({ address_text, city, province, postal_code });
            if (!coordinates) throw new Error("Gagal geocode alamat.");
            latitude = coordinates.latitude;
            longitude = coordinates.longitude;
            gmaps_place_id = coordinates.gmaps_place_id;
        }
        
        await connection.beginTransaction();

        if (is_active) {
            await connection.query('UPDATE addresses SET is_active = FALSE WHERE user_id = ?', [userId]);
        }

        const newAddress = {
            user_id: userId, alias_name, address_text, city, province, postal_code,
            country: 'Indonesia', is_active: !!is_active,
            latitude: latitude, longitude: longitude, gmaps_place_id: gmaps_place_id
        };

        const [results] = await connection.query('INSERT INTO addresses SET ?', newAddress);
        await connection.commit();
        
        res.status(201).json({ message: 'Alamat berhasil ditambahkan.', address: { ...newAddress, address_id: results.insertId } });

    } catch (err) {
        await connection.rollback();
        console.error('Error adding address:', err);
        res.status(500).json({ error: err.message || 'Gagal menambahkan alamat baru.' });
    } finally {
        if (connection) connection.release();
    }
};

const getAllAddresses = async (req, res) => {
    const userId = req.user.id;
    try {
        const [results] = await db.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_active DESC, created_at DESC', 
            [userId]
        );
        res.json(results);
    } catch (err) {
        console.error('Error fetching addresses:', err);
        res.status(500).json({ error: 'Database error while fetching addresses.' });
    }
};

const updateAddress = async (req, res) => {
    const userId = req.user.id;
    const { address_id } = req.params;
    const { alias_name, address_text, city, province, postal_code } = req.body;

    if (!address_text || !city || !postal_code || !province) {
        return res.status(400).json({ error: 'Semua field alamat (termasuk provinsi) wajib diisi.' });
    }
    
    try {
        const coordinates = await getCoordinatesFromAddress({ address_text, city, province, postal_code });

        const [results] = await db.query(
            'UPDATE addresses SET alias_name = ?, address_text = ?, city = ?, province = ?, postal_code = ?, latitude = ?, longitude = ?, gmaps_place_id = ? WHERE address_id = ? AND user_id = ?',
            [alias_name, address_text, city, province, postal_code, coordinates.latitude, coordinates.longitude, coordinates.gmaps_place_id, address_id, userId]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Alamat tidak ditemukan.' });
        }
        res.json({ message: 'Alamat berhasil diperbarui.' });
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).json({ error: err.message || 'Gagal memperbarui alamat.' });
    }
};

const deleteAddress = async (req, res) => {
    const userId = req.user.id;
    const { address_id } = req.params;
    try {
        const [results] = await db.query('DELETE FROM addresses WHERE address_id = ? AND user_id = ?', [address_id, userId]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Alamat tidak ditemukan atau Anda tidak berwenang.' });
        }
        res.json({ message: 'Alamat berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).json({ error: 'Gagal menghapus alamat.' });
    }
};

const setDefaultAddress = async (req, res) => {
    const userId = req.user.id;
    const { address_id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE addresses SET is_active = FALSE WHERE user_id = ?', [userId]);
        const [resultsNew] = await connection.query('UPDATE addresses SET is_active = TRUE WHERE address_id = ? AND user_id = ?', [address_id, userId]);
        
        if (resultsNew.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Alamat tidak ditemukan.' });
        }
        
        await connection.commit();
        res.json({ message: 'Alamat default berhasil diatur.' });
    } catch (err) {
        await connection.rollback();
        console.error('Error setting default address:', err);
        res.status(500).json({ error: 'Gagal mengatur alamat default.' });
    } finally {
        if (connection) connection.release();
    }
};


module.exports = {
    getAllAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};