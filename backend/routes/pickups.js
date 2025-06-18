const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { submitFeedback } = require('../controllers/feedbackController');
const uploadTrashPhoto = require('../middleware/upload'); 
const { authenticateToken, isCustomer, isDriver } = require('../middleware/auth');


router.post(
    '/', 
    authenticateToken, 
    isCustomer, 
    uploadTrashPhoto.single('trash_photo'),
    pickupController.createPickupRequest
);

router.get('/history', authenticateToken, isCustomer, pickupController.getPickupHistory);

router.post('/:pickupId/feedback', authenticateToken, isCustomer, submitFeedback);

router.get('/categories', authenticateToken, pickupController.getTrashCategories);

router.get('/:pickupId', authenticateToken, pickupController.getPickupDetailsById);

router.put(
    '/:pickupId/items', 
    authenticateToken, 
    isDriver, 
    pickupController.updatePickupItems
);

router.post(
    '/:pickupId/complete', 
    authenticateToken, 
    isDriver, 
    pickupController.completePickupRequest
);


module.exports = router;