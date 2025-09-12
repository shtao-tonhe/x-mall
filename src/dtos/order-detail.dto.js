
const { serializeBigInt } = require('../utils/helpers');

class OrderDetailDTO {
  /**
   * 接收一个 order 对象，返回格式化后
   * @param {Object} order - Prisma 查询出来的 order
   */
  constructor(order) {
    this.data = {
      id: serializeBigInt(order.id),
      member_id: serializeBigInt(order.member_id),
      receiver_name: order.receiver_name,
      receiver_phone: order.receiver_phone,
      delete_status: order.delete_status,
      total_amount: order.total_amount,
      pay_amount: order.pay_amount,
      freight_amount: order.freight_amount,
      status: order.status,
    };
  }
}

module.exports = OrderDetailDTO;