
const express = require('express');
const { detectLocale } = require('../../utils/i18n');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

router.use(detectLocale);

// 支付 - 获取支付方式
router.post('/getMethods', paymentController.getPaymentMethods);

// 支付 - 确认USDT支付
router.post('/confirmUSDTPayment', paymentController.confirmUSDTPayment);

module.exports = router;