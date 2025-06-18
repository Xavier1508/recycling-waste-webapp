const express = require('express');
const router = express.Router();
const { redeemPoints, getRedemptionHistory } = require('../controllers/redeemController');

const { authenticateToken, isCustomer } = require('../middleware/auth');

router.use(authenticateToken, isCustomer);

router.post('/redeem', redeemPoints);
router.get('/history', getRedemptionHistory);

module.exports = router;