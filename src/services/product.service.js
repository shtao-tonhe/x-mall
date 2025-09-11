
const prisma = global.prisma;

class ProductService {
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