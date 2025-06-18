const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, isCustomer } = require('../middleware/auth');

router.post('/:pickupId', authenticateToken, isCustomer, feedbackController.submitFeedback);

module.exports = router;