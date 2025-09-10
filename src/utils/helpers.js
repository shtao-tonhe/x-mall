/**
 * 🛠️ 电商项目通用工具函数库
 * 包含：日期、金额、分页、对象处理、类型判断、安全过滤、价格计算等
 */

/**
 * 格式化日期为 YYYY-MM-DD HH:MM:SS
 * @param {Date|string|number} date
 * @returns {string|null}
 */
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string|number} date
 * @returns {string|null}
 */
function formatDate(date) {
  const dateTime = formatDateTime(date);
  return dateTime ? dateTime.split(' ')[0] : null;
}

/**
 * 序列化包含 BigInt 的对象为 JSON 安全对象
 * @param {*} obj
 * @returns {any}
 */
function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * 安全的金额计算（避免浮点误差），单位：分 → 元
 * @param {number|string} amountInCents
 * @returns {string} 保留两位小数的元
 */
function centsToYuan(amountInCents) {
  const cents = parseFloat(amountInCents) || 0;
  return (cents / 100).toFixed(2);
}

/**
 * 元 → 分（用于数据库存储或支付接口）
 * @param {number|string} yuan
 * @returns {number}
 */
function yuanToCents(yuan) {
  const y = parseFloat(yuan) || 0;
  return Math.round(y * 100); // 避免 0.1 * 100 = 10.0000000001
}

/**
 * 格式化价格显示（如：1,234.56）
 * @param {number|string} price
 * @returns {string}
 */
function formatPrice(price) {
  const num = parseFloat(price) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 深拷贝对象（简单版，不支持函数、Symbol、循环引用）
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  if (typeof obj === 'object') {
    const cloned = {};
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * 安全获取嵌套对象属性，避免 Cannot read property 'xxx' of undefined
 * get(obj, 'user.profile.name', 'N/A')
 * @param {Object} obj
 * @param {string} path - 支持 'a.b.c' 或 'a[0].b'
 * @param {*} defaultValue
 * @returns {*}
 */
function get(obj, path, defaultValue = null) {
  const keys = path.replace(/\[([^[\]]*)\]/g, '.$1').split('.').filter(Boolean);
  let result = obj;
  for (const key of keys) {
    if (result == null || result[key] === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  return result;
}

/**
 * 去除对象中的空值（null, undefined, '', NaN）
 * @param {Object} obj
 * @param {boolean} recursive - 是否递归清理
 * @returns {Object}
 */
function cleanObject(obj, recursive = true) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = {};
  for (let key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    if (value == null || value === '' || (typeof value === 'number' && isNaN(value))) {
      continue;
    }
    if (recursive && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = cleanObject(value, true);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * 生成唯一订单号（示例：ORD20250909123045789）
 * 实际项目建议结合 Redis 或雪花算法（Snowflake）
 * @returns {string}
 */
function generateOrderNo() {
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const timeStr = now.getHours() +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `ORD${dateStr}${timeStr}${ms}${random}`;
}

/**
 * 判断是否为手机号（中国）
 * @param {string} phone
 * @returns {boolean}
 */
function isMobilePhone(phone) {
  return /^1[3-9]\d{9}$/.test(String(phone).trim());
}

/**
 * 判断是否为邮箱
 * @param {string} email
 * @returns {boolean}
 */
function isEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
}

/**
 * 脱敏处理手机号：138****1234
 * @param {string} phone
 * @returns {string}
 */
function maskMobile(phone) {
  const str = String(phone);
  return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 脱敏处理身份证
 * @param {string} idCard
 * @returns {string}
 */
function maskIdCard(idCard) {
  const str = String(idCard);
  return str.replace(/^(.{6})(?:\d+)(.{4})$/, '$1******$2');
}

/**
 * 计算折扣价
 * @param {number|string} originalPrice 原价（元）
 * @param {number} discountRate 折扣率（0.8 表示 8 折）
 * @returns {string} 折扣后价格（保留两位小数）
 */
function calculateDiscountPrice(originalPrice, discountRate) {
  const price = parseFloat(originalPrice) || 0;
  const rate = Math.max(0, Math.min(1, discountRate || 1));
  return (price * rate).toFixed(2);
}

/**
 * 计算满减优惠：满 100 减 20
 * @param {number|string} totalAmount
 * @param {number} meet 满足金额
 * @param {number} reduce 减免金额
 * @returns {number} 优惠金额
 */
function calculateDiscountAmount(totalAmount, meet, reduce) {
  const amount = parseFloat(totalAmount) || 0;
  if (amount < meet) return 0;
  return Math.min(reduce, amount); // 不超过总金额
}

/**
 * 驼峰转下划线（用于数据库字段兼容）
 * @param {string} str
 * @returns {string}
 */
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 下划线转驼峰
 * @param {string} str
 * @returns {string}
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * 安全的 JSON.parse，失败时返回默认值
 * @param {string} str
 * @param {*} defaultValue
 * @returns {*}
 */
function safeJsonParse(str, defaultValue = null) {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch (e) {
    console.warn('JSON parse error:', e.message);
    return defaultValue;
  }
}

/**
 * 延时函数（可用于模拟 loading）
 * await sleep(1000)
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 👇 导出所有工具函数
module.exports = {
  // 📅 日期
  formatDateTime,
  formatDate,

  // 💰 金额与价格
  centsToYuan,
  yuanToCents,
  formatPrice,
  calculateDiscountPrice,
  calculateDiscountAmount,

  // 📦 数据处理
  serializeBigInt,
  deepClone,
  get,
  cleanObject,
  safeJsonParse,

  // 🔐 安全与校验
  isMobilePhone,
  isEmail,
  maskMobile,
  maskIdCard,

  // 🛒 业务工具
  generateOrderNo,

  // 🔤 字符串转换
  camelToSnake,
  snakeToCamel,

  // ⏳ 异步辅助
  sleep,
};