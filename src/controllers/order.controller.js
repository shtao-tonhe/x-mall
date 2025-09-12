// 生成正式订单，扣减库存
// 退款、支付记录查询、对账、发票

require('dotenv').config();
const orderService = require('../services/order.service.js');

// const OrderListDTO = require('../dtos/order-list.dto.js');
// const OrderDetailDTO = require('../dtos/order-detail.dto.js');
const Result = require('../utils/Result.js');
const { t, detectLocale } = require('../utils/i18n/index.js');

/**
 * 订单控制器
 */
class orderController {
  getPaymentInfo(method, amount) {
    if (method === 'usdt') {
      return {
        toAddress: process.env.USDT_WALLET_ADDRESS,
        amount,
        token: 'USDT',
        network: 'Ethereum'
      };
    }
    return null;
  }

  // 生成订单
  async createOrder(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { items, addressId, paymentMethod, couponCode } = req.body;
    console.log("🚀 ~ orderController ~ createOrder ~ paymentMethod:", paymentMethod)
    console.log("🚀 ~ orderController ~ createOrder ~ addressId:", addressId)
    console.log("🚀 ~ orderController ~ createOrder ~ items:", items)
    // paymentMethod: 'stripe', 'paypal', 'usdt'
    // items: [
    //    { price: 29.99, quantity: 1 }, // 一件衣服
    //    { price: 15.50, quantity: 2 }  // 两件配饰
    // ]

    if (!items || items.length === 0) {
      console.log("🚀 ~ 请至少选择一个商品:")
      return res.json(Result.error('请至少选择一个商品'));
    }

    try {
      const order = await orderService.create(req.body.uid, {
        items,
        addressId,
        paymentMethod,
        couponCode
      });

      // ✅ 所有校验通过，返回订单 + 支付信息
      const paymentInfo = getPaymentInfo(paymentMethod, order.amount);

      res.json(Result.success({
        ...order,
        paymentInfo
      }));

    } catch (error) {
      // 💡 统一处理业务错误
      if (error) {
        console.log(`[order---created---error---]`, error);
        return res.json(Result.fail(error.message, error.code));
      }

      // 处理数据库错误、网络错误等
      console.error('[Internal Error]', error);
      return res.json(Result.fail("订单创建失败，请稍后重试", "ORDER_CREATE_FAILED"));
    }
  }

  // 获取订单列表
  async getOrderList(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { page, pageSize } = req.query;

    const orderList = await orderService.getList({
      userId: req.user.id,
      page,
      pageSize
    });

    return Result.page(orderList, { page, pageSize }, t('ORDER_LIST_FETCHED', locale), locale);
  }
  // 获取订单详情
  // 取消订单
  // 确认收货
  // 删除订单
  // 获取支付快照信息
  // 获取物流信息
  // 获取发票信息
  // 获取评价信息
  // 获取退货信息
  // 获取换货信息
  // 获取售后信息
  // 获取退款信息
  // 获取对账信息
}

module.exports = new orderController();