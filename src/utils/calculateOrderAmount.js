

/**
 * 计算订单总金额（以稳定币/法币单位）
 * @param {Array} items - 订单商品列表
 *    item 结构: { price: Number, quantity: Number }
 * @param {Object} options - 可选参数
 *    - discount: Number (折扣金额，如 5.00)
 *    - taxRate: Number (税率，如 0.08 表示 8%)
 *    - shipping: Number (运费)
 * @returns {number} 总金额，保留两位小数
 */
function calculateOrderAmount(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  // 1. 计算商品小计
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  let total = subtotal;

  // 2. 减去折扣
  if (options.discount) {
    total -= parseFloat(options.discount) || 0;
  }

  // 3. 加上运费
  if (options.shipping) {
    total += parseFloat(options.shipping) || 0;
  }

  // 4. 加上税费（基于折扣后的金额）
  if (options.taxRate !== undefined) {
    const taxRate = parseFloat(options.taxRate) || 0;
    const tax = total * taxRate;
    total += tax;
  }

  // 5. 确保不低于 0，并保留两位小数
  return Math.max(0, parseFloat(total.toFixed(2)));
}

module.exports = calculateOrderAmount;