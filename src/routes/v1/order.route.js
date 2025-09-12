
const express = require('express');
const { detectLocale } = require('../../utils/i18n');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

router.use(detectLocale);

// 订单-创建
router.post('/created', orderController.createOrder);

module.exports = router;
