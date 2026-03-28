const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/provinces', statisticsController.getProvinceStats);
router.get('/cities', statisticsController.getCityStats);

module.exports = router;