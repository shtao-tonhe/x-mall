// # 验证调用方身份 (API Key, JWT等)
const { verifyToken } = require('../utils/jwt');
const Result = require('../utils/Result.js');

// 验证JWT的中间件
const authMiddleware = (options = {}) => {
  // 默认不需要验证的路由列表
  const defaultExcludedPaths = [];

  // 合并默认配置和用户传入的配置
  const { excludedPaths = [] } = options;
  const allExcludedPaths = [...defaultExcludedPaths, ...excludedPaths];

  return async (req, res, next) => {
    try {
      // 检查当前请求的路径是否在不需要验证的列表中
      const isExcluded = allExcludedPaths.some(path => {
        // 支持精确匹配和通配符匹配
        if (path.endsWith('*')) {
          const basePath = path.slice(0, -1);
          return req.path.startsWith(basePath);
        }
        return req.path === path;
      });

      // 如果是不需要验证的路径，直接放行
      if (isExcluded) {
        return next();
      }

      // 从请求头中获取token
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      // 如果没有token，返回未授权错误
      if (!token) {
        return res.json(Result.fail('您尚未登录，请先登录'));
      }

      // 验证token
      const decoded = await verifyToken(token);

      // 将解码后的用户信息添加到请求对象中
      req.userAuthDetail = decoded;

      next();
    } catch (error) {
      return res.status(401).json(Result.fail('登录已过期或无效，请重新登录'));
    }
  };
};

module.exports = authMiddleware;
