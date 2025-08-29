// utils/Result.js
const { t, detectLocale } = require('./i18n');

class Result {
  /**
   * 成功响应
   * @param {*} data - 返回数据
   * @param {string} message - 消息（可选，会自动翻译 code）
   * @param {string} code - 消息码
   * @param {string} locale - 当前请求语言
   */
  static success(data, message, code = 'SUCCESS', locale = 'zh-CN') {
    return {
      success: true,
      data,
      message: message || t(code, locale),
      code,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 失败响应
   * @param {string} message - 错误消息
   * @param {string} code - 错误码
   * @param {*} data - 附加数据（如分页信息）
   * @param {Array} errors - 字段级错误
   * @param {string} locale - 当前语言
   */
  static fail(message, code = 'ERROR', data = null, errors = [], locale = 'zh-CN') {
    return {
      success: false,
      data,
      message: message || t(code, locale),
      code,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 验证失败
   */
  static validation(errors, locale = 'zh-CN') {
    return this.fail(
      t('VALIDATION_FAILED', locale),
      'VALIDATION_FAILED',
      null,
      errors,
      locale
    );
  }

  /**
   * 服务器错误
   */
  static error(message = 'Internal Server Error', code = 'INTERNAL_ERROR', locale = 'zh-CN') {
    return this.fail(message, code, null, [], locale);
  }

  /**
   * 分页响应
   */
  static page(data, pagination, message, code = 'SUCCESS', locale = 'zh-CN') {
    return {
      success: true,
      data,
      pagination,
      message: message || t(code, locale),
      code,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = Result;