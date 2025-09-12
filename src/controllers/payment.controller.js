// 调起支付，处理回调，处理异步通知，更新订单状态
// 后续支持多种支付方式、分账
const orderService = require('../services/order.service.js');
const paymentService = require('../services/payment.service.js');

// const PaymentListDTO = require('../dtos/payment-list.dto.js');
// const PaymentDetailDTO = require('../dtos/payment-detail.dto.js');
const Result = require('../utils/Result.js');
const { t, detectLocale } = require('../utils/i18n/index.js');

/**
 * 订单控制器
 */
class paymentController {
  // 支持的支付类型
  supportedPaymentTypes = ['stripe', 'paypal', 'usdt'];

  // 获取支持的支付方式
  async getPaymentMethods(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const paymentMethods = [
      { type: 'stripe', name: 'Stripe' },
      { type: 'paypal', name: 'Paypal' },
      { type: 'usdt', name: 'USDT' },
    ];
    return res.json(Result.success(paymentMethods, t('success', locale)));
  }


  // 确认 USDT 支付
  // 接收 txHash，触发验证，更新订单状态
  async confirmUSDTPayment(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { orderId, txHash } = req.body;

    // 1. 查订单
    const order = await orderService.getById(orderId);
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ error: 'Order not pending' });
    }

    // 2. 调用 Service 验证 txHash 是否为有效 USDT 转账
    const isValid = await paymentService.verifyUSDTTransaction(txHash, {
      to: config.USDT_RECEIVE_ADDRESS,
      amount: order.amount,
      minConfirmations: 1
    });

    if (isValid) {
      // 3. 更新订单状态
      await orderService.markAsPaid(orderId, { paymentMethod: 'usdt', txHash });
      return res.json({ success: true, message: 'Payment confirmed' });
    } else {
      return res.status(400).json({ error: 'Invalid or pending transaction' });
    }
  }
}

module.exports = new paymentController();