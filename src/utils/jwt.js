
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '89f01f4329hfg347g917624078fyh3178fy';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '2fgw08g7e98rgy247y8732g241276fojhfweiuf';

const ACCESS_TOKEN_EXPIRES_IN = '1h';   // 1小时
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30天

module.exports = {
  // 生成访问 token
  generateToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  },

  // 生成刷新 token
  generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  },

  // 验证 access token
  verifyToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  },

  // 验证 refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  }
};