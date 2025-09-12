const prisma = global.prisma;
const CouponDTO = require('../dtos/coupon.dto');

class CouponService {
  // 获取用户可领取的优惠券列表（分页）
  async getAvailableCoupons(memberId, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const coupons = await prisma.sms_coupon.findMany({
      // where: {
      //   end_time: { gte: new Date() },
      //   start_time: { lte: new Date() },
      //   enable_time: { lte: new Date() },
      //   count: { gt: 0 },
      // },
      // include: {
      //   sms_coupon_history: {
      //     where: { member_id: BigInt(memberId) },
      //     take: 1,
      //   },
      // },
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    // 过滤掉已领取的
    const available = coupons.filter(c => c.sms_coupon_history.length === 0);

    return {
      list: available.map(CouponDTO.toResponse),
      total: available.length,
      page,
      pageSize,
    };
  }

  // 领取优惠券
  async receiveCoupon(memberId, couponId, memberNickname) {
    const coupon = await prisma.sms_coupon.findUnique({
      where: { id: BigInt(couponId) },
    });

    if (!coupon) {
      throw new Error('优惠券不存在');
    }

    if (new Date() < new Date(coupon.start_time) || new Date() > new Date(coupon.end_time)) {
      throw new Error('优惠券不在有效期内');
    }

    if (coupon.count <= 0) {
      throw new Error('优惠券已领完');
    }

    // 检查用户是否已领取过
    const existing = await prisma.sms_coupon_history.findFirst({
      where: {
        coupon_id: BigInt(couponId),
        member_id: BigInt(memberId),
      },
    });

    if (existing) {
      throw new Error('您已领取过该优惠券');
    }

    // 使用事务：扣减数量 + 创建领取记录
    return await prisma.$transaction(async (tx) => {
      // 扣减剩余数量
      await tx.sms_coupon.update({
        where: {
          id: BigInt(couponId),
          count: { gt: 0 }, // 乐观锁：确保还有库存
        },
        data: {
          count: { decrement: 1 },
          receive_count: { increment: 1 },
        },
      });

      // 创建领取记录
      const history = await tx.sms_coupon_history.create({
        data: {
          coupon_id: BigInt(couponId),
          member_id: BigInt(memberId),
          coupon_code: coupon.code || `COUPON_${couponId}_${memberId}`,
          member_nickname: memberNickname,
          get_type: 1, // 1=主动领取
          create_time: new Date(),
          use_status: 0, // 未使用
        },
      });

      return CouponDTO.toHistoryResponse(history);
    });
  }

  // 获取用户已领取的优惠券（按状态过滤）
  async getCouponsByMember(memberId, status = null) {
    const where = { member_id: BigInt(memberId) };
    if (status !== null) {
      where.use_status = status;
    }

    const histories = await prisma.sms_coupon_history.findMany({
      where,
      include: {
        sms_coupon: true,
      },
      orderBy: { create_time: 'desc' },
    });

    return histories.map(h => ({
      ...CouponDTO.toResponse(h.sms_coupon),
      historyId: h.id.toString(),
      couponCode: h.coupon_code,
      useStatus: h.use_status,
      createTime: h.create_time,
      useTime: h.use_time,
      orderId: h.order_id?.toString(),
      orderSn: h.order_sn,
    }));
  }

  // 校验优惠券是否可用（用于下单时）
  async validateCoupon(couponId, memberId, orderAmount) {
    const history = await prisma.sms_coupon_history.findFirst({
      where: {
        coupon_id: BigInt(couponId),
        member_id: BigInt(memberId),
        use_status: 0, // 未使用
      },
      include: {
        sms_coupon: true,
      },
    });

    if (!history) {
      throw new Error('未找到可用优惠券');
    }

    const coupon = history.sms_coupon;

    if (new Date() < new Date(coupon.start_time) || new Date() > new Date(coupon.end_time)) {
      throw new Error('优惠券已过期');
    }

    if (Number(orderAmount) < Number(coupon.min_point)) {
      throw new Error(`订单金额需满 ${coupon.min_point} 才可使用`);
    }

    return {
      valid: true,
      discount: Number(coupon.amount),
      coupon: CouponDTO.toResponse(coupon),
    };
  }
}

module.exports = new CouponService();