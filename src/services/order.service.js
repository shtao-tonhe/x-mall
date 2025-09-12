
const prisma = global.prisma;
const redisClient = require('../utils/redis');
const Result = require('../utils/Result.js');
const productService = require('./product.service.js')
const emailService = require('./common/email.service');
const { serializeBigInt } = require('../utils/helpers');
const calculateOrderAmount = require('../utils/calculateOrderAmount');

class OrderService {
  // 创建订单
  async create(userId, inputData) {
    const { items, addressId, paymentMethod, couponCode } = inputData
    console.log("创建订单--service");

    // 1. 获取真实商品数据
    const productMap = await productService.getProductsForOrder(items.map(i => i.productId));
    console.log("🚀 ~ OrderService ~ create ~ productMap:", productMap)

    // 2. 校验商品是否存在
    const invalidProductIds = items
      .map(item => item.productId)
      .filter(id => !productMap[id]);

    if (invalidProductIds.length > 0) {
      // return Result.fail('商品信息有新变化啦，请刷新后重试')
      return Result.fail('商品不存在或已下架')
    }

    // 3. 校验价格是否被篡改
    const priceMismatch = items.some(item => {
      const serverPrice = productMap[item.productId].price;
      const clientPrice = parseFloat(item.price);
      return Math.abs(serverPrice - clientPrice) > 0.01; // 允许浮点误差
    });

    if (priceMismatch) {
      return Result.fail('商品信息有新变化啦，请刷新后重试', null, priceMismatch)
    }

    // 4. 校验库存是否充足
    const outOfStockItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (item.quantity > product.stock) {
        outOfStockItems.push({
          productId: product.id,
          name: product.name,
          available: product.stock,
          requested: item.quantity
        });
      }
    }

    if (outOfStockItems.length > 0) {
      return Result.fail('库存不足，请刷新后重试', null, outOfStockItems)
    }

    // 5. ✅所有校验通过，使用服务端价格计算金额
    const itemsWithPrice = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: productMap[item.productId].price,
      name: productMap[item.productId].name
    }));
    console.log("🚀 ~ OrderService ~ 总金额:", itemsWithPrice)

    const discount = couponCode ? await getCouponValue(couponCode, userId) : 0
    const shipping = await getShippingFee(addressId)
    // const taxRate = getTaxRate(addressId)

    const amount = calculateOrderAmount(itemsWithPrice, {
      discount: discount, // 优惠券减 10 USDT
      shipping: 0,      // 运费
      taxRate: 0        // 8% 税
    });

    // 6. 创建订单
    const order = await prisma.oms_order.create({
      data: {
        member_id: BigInt(userId),
        // items: items,
        receiver_name: "章伞伞",
        receiver_phone: "17501615104",
        delete_status: 0,// 删除状态：0->未删除；1->已删除
        total_amount: amount, // 订单总金额
        pay_amount: amount, // 应付金额（实际支付金额）
        freight_amount: 0, // 运费金额
        status: 0 // 订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单
      }
    });

    return order;
  }

  // 获取订单列表
  async getList() {

  }

  // 获取订单详情
  async getDetail() {

  }

  // 取消订单
  async cancel() {

  }

  // 确认收货
  async confirm() {

  }

  // 删除订单
  async delete() {

  }
}

module.exports = new OrderService();