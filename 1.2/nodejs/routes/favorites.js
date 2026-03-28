const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const favoriteController = require('../controllers/favoriteController');

// 所有收藏接口都需要登录
router.use(authMiddleware);

router.post('/', favoriteController.addFavorite);
router.delete('/:exhibitionId', favoriteController.removeFavorite);
router.get('/', favoriteController.getFavorites);
router.get('/check/:exhibitionId', favoriteController.checkFavorite);

module.exports = router;