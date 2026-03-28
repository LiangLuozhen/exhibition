const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController');

router.get('/', exhibitionController.getExhibitions);
router.get('/:id', exhibitionController.getExhibitionById);

module.exports = router;