
const couponService = require('../services/coupon.service');
const Result = require('../utils/Result.js');

class CouponController {
  // 获取可领取的优惠券列表
  getAvailableCoupons = async (req, res, next) => {
    const { pageNum = 1, pageSize = 10 } = req.body;
    console.log("🚀 ~ CouponController ~ pageSize~!!!!!!!!:", pageSize)
    const memberId = req.userAuthDetail.id;

    try {
      const result = await couponService.getAvailableCoupons(
        memberId,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      return res.json(Result.success(result));
    } catch (error) {
      return res.json(Result.fail(error.message));
    }
  };

  // 领取优惠券
  receiveCoupon = async (req, res, next) => {
    const { couponId } = req.body;
    const memberId = req.userId;
    const memberNickname = req.userNickname || '用户';

    if (!couponId) {
      return res.json(Result.error('缺少 couponId'));
    }

    try {
      const result = await couponService.receiveCoupon(memberId, couponId, memberNickname);
      return res.json(Result.success(result, '领取成功'));
    } catch (error) {
      return res.json(Result.fail(error.message));
    }
  };

  // 获取我的优惠券（0:未使用, 1:已使用, 2:已过期, null:全部）
  getMyCoupons = async (req, res, next) => {
    const { status } = req.query;
    const memberId = req.userId;

    try {
      const result = await couponService.getCouponsByMember(
        memberId,
        status !== undefined ? parseInt(status) : null
      );
      return res.json(Result.success(result));
    } catch (error) {
      return res.json(Result.fail(error.message));
    }
  };

  // 校验优惠券（下单前）
  validateCoupon = async (req, res, next) => {
    const { couponId, orderAmount } = req.body;
    const memberId = req.userId;

    if (!couponId || orderAmount == null) {
      return res.json(Result.error('参数缺失'));
    }

    try {
      const result = await couponService.validateCoupon(couponId, memberId, orderAmount);
      return res.json(Result.success(result));
    } catch (error) {
      return res.json(Result.fail(error.message));
    }
  };
}

module.exports = new CouponController();