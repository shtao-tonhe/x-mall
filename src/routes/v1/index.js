const express = require('express');
const router = express.Router();

// 导入各业务路由模块
const productRoute = require('./product.route');
const userRoute = require('./user.route');
const orderRoute = require('./order.route');
const paymentRoute = require('./payment.route');

// 所有会话接口路径前缀为 /api/v1/xxxxx
router.use('/product', productRoute);
router.use('/user', userRoute);
router.use('/order', orderRoute);
router.use('/payment', paymentRoute);

// 根路径测试接口
router.get('/', (req, res) => {
  res.json({
    message: 'API V1',
    availableEndpoints: [
      '|- /sessions',
      '|- /agents',
      '|- /users'
    ]
  });
});

module.exports = router;