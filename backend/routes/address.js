const express = require('express');
const router = express.Router();
const { getAllAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = require('../controllers/addressController');

// --- PERBAIKAN KEAMANAN ---
const { authenticateToken, isCustomer } = require('../middleware/auth');

// Terapkan middleware untuk memastikan hanya customer yang bisa mengelola alamat
router.use(authenticateToken, isCustomer);

router.get('/', getAllAddresses);
router.post('/', addAddress);
router.put('/:address_id', updateAddress);
router.delete('/:address_id', deleteAddress);
router.put('/:address_id/set-default', setDefaultAddress);

module.exports = router;