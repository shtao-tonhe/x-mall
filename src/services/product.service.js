
const prisma = global.prisma;

class ProductService {
  /**
   * 批量获取商品（用于下单校验）
   * @param {Array} productIds - 商品ID数组
   * @returns {Promise<Object>} 商品Map对象，key为商品ID，value为商品详细信息
   */
  async getProductsForOrder(productIds) {
    console.log("查询商品--getProductsForOrder");

    // 查询数据库，获取商品详情
    const products = await prisma.pms_product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
      }
    });

    if (products.length === 0) {
      throw new Error('未找到有效产品');
    }

    // 将查询结果转换为Map，便于快速查找
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = {
        id: product.id,
        name: product.name,
        price: product.price,     // 数据库中的真实价格
        stock: product.stock,
        image: product.image
      };
    });

    return productMap;
  }

  // 获取商品详情
  async getProductById(productId) {
    return await prisma.pms_product.findUnique({
      where: { id: parseInt(productId) },
    });
  }

  // 获取商品列表（带分页）
  async getProducts(page, pageSize) {
    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      prisma.pms_product.findMany({
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.pms_product.count(),
    ]);

    return {
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

module.exports = new ProductService();