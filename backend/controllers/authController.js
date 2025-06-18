const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const generateDriverCode = async (licensePlate) => {
    const prefix = 'XVR';
    const sanitizedPlate = licensePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase();
    let isUnique = false;
    let driverCode;
    while (!isUnique) {
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        driverCode = `${prefix}${randomDigits}${sanitizedPlate}`;
        const [rows] = await db.query('SELECT driver_id FROM drivers WHERE driver_code = ?', [driverCode]);
        if (rows.length === 0) isUnique = true;
    }
    return driverCode;
};

const register = async (req, res) => {
    try {
        const { email, phone_number, first_name, last_name, password } = req.body;
        if (!email || !phone_number || !first_name || !password) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }

        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (email, phone_number, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?, 'customer')`;
        await db.query(insertQuery, [email, phone_number, first_name, last_name || '', password_hash]);

        res.status(201).json({ message: 'User berhasil didaftarkan' });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }

        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }

        const token = generateToken(user.id, user.role);
        delete user.password_hash;
        res.json({ message: 'Login berhasil', token: token, user: user });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

const registerDriver = async (req, res) => {
    const {
        first_name, last_name, email, phone_number, password,
        license_number, license_expiry_date, license_plate, vehicle_type
    } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: "Foto profil wajib diunggah." });
    }
    const profile_picture_url = `/uploads/avatars/${req.file.filename}`;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        let userId;
        let isNewUser = false;

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
            const [existingDrivers] = await connection.query('SELECT driver_id FROM drivers WHERE user_id = ?', [userId]);
            if (existingDrivers.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({ error: 'Akun dengan email ini sudah terdaftar sebagai driver.' });
            }
        } else {
            isNewUser = true;
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUserPayload = {
                first_name, last_name, email, phone_number,
                password_hash: hashedPassword,
                profile_picture_url,
                role: 'driver',
                account_status: 'pending_verification'
            };
            const [userResult] = await connection.query('INSERT INTO users SET ?', newUserPayload);
            userId = userResult.insertId;
        }

        const newVehiclePayload = { license_plate, vehicle_type };
        const [vehicleResult] = await connection.query('INSERT INTO vehicles SET ?', newVehiclePayload);
        const vehicleId = vehicleResult.insertId;

        const driverCode = await generateDriverCode(license_plate);
        const newDriverPayload = {
            user_id: userId,
            driver_code: driverCode,
            license_number,
            license_expiry_date,
            vehicle_id: vehicleId,
            is_approved: false,
            profile_picture_url
        };
        await connection.query('INSERT INTO drivers SET ?', newDriverPayload);

        if (!isNewUser) {
            await connection.query('UPDATE users SET role = ?, profile_picture_url = ? WHERE id = ?', ['driver', profile_picture_url, userId]);
        }

        await connection.commit();

        res.status(201).json({
            message: 'Registrasi driver berhasil! Mohon tunggu approval dari admin.',
            driver_code: driverCode,
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error during driver registration:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Data duplikat. Plat nomor atau nomor SIM mungkin sudah terdaftar.' });
        }

        res.status(500).json({ error: 'Terjadi kesalahan pada server saat registrasi.' });
    } finally {
        if (connection) connection.release();
    }
};

const loginDriver = async (req, res) => {
    try {
        const { driver_code, password } = req.body;
        if (!driver_code || !password) {
            return res.status(400).json({ error: 'Kode Driver dan password wajib diisi' });
        }
        const query = `
            SELECT u.*, d.is_approved, d.driver_code FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.driver_code = ?
        `;
        const [results] = await db.query(query, [driver_code]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }
        const driverUser = results[0];
        if (!driverUser.is_approved) {
            return res.status(403).json({ error: 'Akun Anda belum disetujui oleh admin.' });
        }
        const isValidPassword = await bcrypt.compare(password, driverUser.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }
        const token = generateToken(driverUser.id, driverUser.role);
        delete driverUser.password_hash;
        res.json({ message: 'Login driver berhasil', token, user: driverUser });

    } catch (error) {
        console.error("Error during driver login:", error);
        res.status(500).json({ error: 'Server error' });
    }
};


const logout = (req, res) => {
    res.json({ message: 'Logout berhasil' });
};

module.exports = {
    register,
    login,
    logout,
    registerDriver,
    loginDriver
};