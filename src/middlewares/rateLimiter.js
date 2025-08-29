// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { Result } = require('../utils/Result');
const { t, detectLocale } = require('../utils/i18n');

/**
 * 全局限流：保护服务器基础资源
 * 例如：防止暴力注册、频繁请求
 */
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  message: (req, res) => {
    const locale = req.locale || 'zh-CN';
    return res.status(429).json(Result.fail(
      t('TOO_MANY_REQUESTS', locale),
      'TOO_MANY_REQUESTS',
      null,
      [],
      locale
    ));
  },
  standardHeaders: true, // 返回 RateLimit-* 头信息
  legacyHeaders: false,  // 不使用 X-RateLimit headers
  skipSuccessfulRequests: false, // 统计所有请求（包括 4xx/5xx）
  keyGenerator: (req) => {
    // 使用 IP 作为 key（注意：反向代理时需读取 x-forwarded-for）
    return req.ip;
  }
});

// 比如：对已登录用户用 userId，未登录用 IP
const customKeyGenerator = (req) => {
  if (req.user) {
    return req.user.id; // 用户ID
  }
  return ipKeyGenerator(req); // 未登录用户，用安全 IP 提取
};

/**
 * API 专用限流：针对敏感接口
 * 例如：创建会话、登录接口
 */
const apiCreateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 20, // 每小时最多创建 20 个会话
  message: (req, res) => {
    const locale = req.locale || 'zh-CN';
    return res.status(429).json(Result.fail(
      t('CREATE_SESSION_TOO_FREQUENT', locale),
      'CREATE_SESSION_TOO_FREQUENT',
      null,
      [],
      locale
    ));
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: customKeyGenerator
});

/**
 * 登录专用限流（可选）
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15分钟内最多5次登录失败
  message: (req, res) => {
    const locale = req.locale || 'zh-CN';
    return res.status(429).json(Result.fail(
      t('LOGIN_TOO_FREQUENT', locale),
      'LOGIN_TOO_FREQUENT',
      null,
      [],
      locale
    ));
  },
  skipSuccessfulRequests: true, // 只统计失败请求
  keyGenerator: (req) => req.body?.username || req.ip
});

module.exports = {
  globalRateLimiter,
  apiCreateRateLimiter,
  loginRateLimiter
};