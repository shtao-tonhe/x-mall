// middlewares/errorHandler.js
const { Result } = require('../utils/Result');
const { t, detectLocale } = require('../utils/i18n');

/**
 * 全局错误处理中间件
 * 必须定义为 (err, req, res, next) 四个参数，Express 才会识别为错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 设置默认语言
  const locale = req.locale || 'zh-CN';

  // 日志：建议集成 winston 或 console.error
  console.error(`[ERROR] ${req.method} ${req.url}`);
  console.error(err.stack || err.message);

  // 1. Prisma 特殊错误处理
  if (err.code && err.clientVersion) {
    // PrismaClientKnownRequestError
    switch (err.code) {
      case 'P2002': // 唯一约束冲突
        return res.status(409).json(Result.fail(
          t('DUPLICATE_ENTRY', locale),
          'DUPLICATE_ENTRY',
          null,
          [{ field: err.meta?.target, msg: t('FIELD_MUST_BE_UNIQUE', locale) }],
          locale
        ));
      case 'P2025': // 记录未找到（update/delete 失败）
        return res.status(404).json(Result.fail(
          t('RESOURCE_NOT_FOUND', locale),
          'RESOURCE_NOT_FOUND',
          null,
          [],
          locale
        ));
      default:
        break;
    }
  }

  // 2. 验证失败（来自 validator）
  if (err.name === 'ValidationError') {
    return res.status(400).json(Result.validation(err.errors || [], locale));
  }

  // 3. 业务逻辑自定义错误（如 ServiceError）
  if (err.name && err.code && err.userMessage) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json(Result.fail(
      err.userMessage,
      err.code,
      null,
      [],
      locale
    ));
  }

  // 4. 身份认证错误
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(Result.fail(
      t('UNAUTHORIZED', locale),
      'UNAUTHORIZED',
      null,
      [],
      locale
    ));
  }

  // 5. 权限不足
  if (err.name === 'ForbiddenError') {
    return res.status(403).json(Result.fail(
      t('FORBIDDEN', locale),
      'FORBIDDEN',
      null,
      [],
      locale
    ));
  }

  // 6. 默认：未知错误（500）
  res.status(500).json(Result.error(t('INTERNAL_ERROR', locale), 'INTERNAL_ERROR', locale));
};

module.exports = errorHandler;