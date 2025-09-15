
const prisma = global.prisma;
const CategoryDTO = require('../dtos/category.dto');

class CategoryService {
  // 获取一级分类
  async getCategories() {
    try {
      const categories = await prisma.pms_product_category.findMany({
        where: { level: 0 },
        select: { id: true, name: true },
      });

      return {
        list: categories.map(CategoryDTO.toResponse),
      };
    } catch (error) {
      console.error("获取分类失败:", error);
      throw new Error("无法获取分类数据");
    }
  }

  // 获取分类标签
  async getCategoryTags(tagId) {
    try {
      const categories = await prisma.pms_product_category.findMany({
        where: {
          level: 1,
          parent_id: tagId,
        },
        select: { id: true, name: true, parent_id: true },
      });

      return {
        list: categories.map(CategoryDTO.toResponse),
      };
    } catch (error) {
      console.error("获取分类失败:", error);
      throw new Error("无法获取分类数据");
    }
  }

  //获取二级分类
  async getSubCategories(tagId) {
    return prisma.pms_product_category.findMany({
      where: {
        id: tagId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}

module.exports = new CategoryService();