const express = require('express');
const router = express.Router();
const { authenticateToken, isDriver } = require('../middleware/auth');
const { acceptOffer, declineOffer } = require('../controllers/offerController');

router.use(authenticateToken, isDriver);

router.post('/:offer_id/accept', acceptOffer);

router.post('/:offer_id/decline', declineOffer);

module.exports = router;