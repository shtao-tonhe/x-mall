// routes/v1/session.route.js
const express = require('express');
const { detectLocale } = require('../../utils/i18n');
const sessionController = require('../../controllers/sessionController');
const { apiCreateRateLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

// 所有 session 接口自动支持多语言
router.use(detectLocale); // 假设你已经定义了这个中间件

// 创建会话
router.post('/', sessionController.createSession);

// 查询已激活会话
router.post('/active', sessionController.getActiveSessionsByPlatform);

// 查询会话详情
router.get('/:id', sessionController.getSessionById);

// 更新会话
router.patch('/:id', sessionController.updateSession);

module.exports = router;