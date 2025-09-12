const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/coupon.controller');

// const userAuth = require('../../middlewares/auth.middleware'); // 登录中间件
// router.use(userAuth); // 需要登录

// // 允许指定接口无需登录
// router.use(userAuth({
//   excludedPaths: ['/available'] // 这些接口不需要登录
// }));

router.post('/available', couponController.getAvailableCoupons);
router.post('/receive', couponController.receiveCoupon);
router.get('/my', couponController.getMyCoupons);
router.post('/validate', couponController.validateCoupon);

module.exports = router;