const express = require('express');
const router = express.Router();
const { getActiveCatalogItems, getCatalogItemById } = require('../controllers/catalogController');

router.get('/', getActiveCatalogItems);

router.get('/:catalog_id', getCatalogItemById);

module.exports = router;