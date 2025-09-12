
const { serializeBigInt } = require('../utils/helpers');

class CouponDTO {
  static toResponse(coupon) {
    if (!coupon) return null;

    const data = {
      id: serializeBigInt(coupon.id),
      name: coupon.name,
      type: coupon.type, // 0->全场赠券；1->会员赠送；2->购物赠券；3->注册赠券
      platform: coupon.platform, // 0->全部；1->移动端；2->PC端
      count: coupon.count,
      amount: Number(coupon.amount) || 0,
      perLimit: coupon.per_limit,
      minPoint: Number(coupon.min_point) || 0,
      startTime: coupon.start_time,
      endTime: coupon.end_time,
      useType: coupon.use_type, // 0->全场通用；1->指定分类；2->指定商品
      note: coupon.note,
      publishCount: coupon.publish_count,
      useCount: coupon.use_count,
      receiveCount: coupon.receive_count,
      enableTime: coupon.enable_time,
      code: coupon.code,
      memberLevel: coupon.member_level,
      productList: [],
      categoryList: [],
    };

    // 如果包含关联数据，提取商品和分类
    if (coupon.sms_coupon_product_relation) {
      data.productList = coupon.sms_coupon_product_relation.map(p => ({
        productId: serializeBigInt(p.product_id.id),
        productName: p.product_name,
        productSn: p.product_sn,
      }));
    }

    if (coupon.sms_coupon_product_category_relation) {
      data.categoryList = coupon.sms_coupon_product_category_relation.map(c => ({
        categoryId: serializeBigInt(c.product_category_id),
        categoryName: c.product_category_name,
        parentCategoryName: c.parent_category_name,
      }));
    }

    return data;
  }

  static toHistoryResponse(history) {
    if (!history) return null;

    return {
      id: history.id?.toString(),
      couponId: serializeBigInt(history.coupon_id),
      couponCode: history.coupon_code,
      memberId: serializeBigInt(history.member_id),
      memberNickname: history.member_nickname,
      getType: history.get_type,
      createTime: history.create_time,
      useStatus: history.use_status, // 0: 未使用, 1: 已使用, 2: 已过期
      useTime: history.use_time,
      orderId: serializeBigInt(history.order_id),
      orderSn: history.order_sn,
    };
  }
}

module.exports = CouponDTO;