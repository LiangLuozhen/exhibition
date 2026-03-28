const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// 提交/更新评分评论（需要登录）
router.post('/:exhibitionId', authMiddleware, ratingController.upsertRating);

// 获取某个展览的所有评分评论（公开）
router.get('/exhibition/:exhibitionId', ratingController.getExhibitionRatings);

// 获取当前用户对某展览的评分评论（需要登录）
router.get('/user/:exhibitionId', authMiddleware, ratingController.getUserRating);

// 获取当前用户的所有评分评论（需要登录）
router.get('/me', authMiddleware, ratingController.getMyRatings);

module.exports = router;