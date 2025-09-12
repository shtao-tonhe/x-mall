
const prisma = global.prisma;
const redisClient = require('../utils/redis');
const Result = require('../utils/Result.js');
const emailService = require('./common/email.service');
const { serializeBigInt } = require('../utils/helpers');

class PaymentService {
  // 确认 USDT 支付
  async confirmUSDTPayment() {

  }
}

module.exports = new PaymentService();
