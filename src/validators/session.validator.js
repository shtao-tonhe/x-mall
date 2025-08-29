
const Joi = require('joi');

class SessionValidator {
  // 通用验证函数，可被不同入口调用
  static validateCreateInput(input) {
    const errors = [];

    if (!input.platformId || typeof input.platformId !== 'number') {
      errors.push({ field: 'platformId', msg: '必须提供有效的 platformId' });
    }

    if (input.userId !== undefined && (typeof input.userId !== 'number' || input.userId <= 0)) {
      errors.push({ field: 'userId', msg: 'userId 必须是正整数' });
    }

    if (!input.userIp || !this.isValidIp(input.userIp)) {
      errors.push({ field: 'userIp', msg: 'IP 地址无效' });
    }

    return errors;
  }

  static isValidIp(ip) {
    // 简单 IP 校验
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(ip);
  }
}
module.exports = SessionValidator;
