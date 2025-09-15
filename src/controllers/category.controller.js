
const categoryService = require('../services/category.service');
// const CategoryListDTO = require('../dtos/category-list.dto.js');
// const CategoryDetailDTO = require('../dtos/category-detail.dto.js');
const Result = require('../utils/Result.js');
const { t } = require('../utils/i18n/index.js');

class CategoryController {
  // 获取一级分类
  async getCategorys(req, res, next) {
    const locale = req.locale || 'zh-CN';
    return res.json(Result.success(await categoryService.getCategories(), t('CATEGORY_FOUND', locale), null, locale));
  }

  // 获取分类标签
  async getCategoryTags(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { parentId } = req.body;
    console.log("🚀 ~ 父级ID:", parentId)
    return res.json(Result.success(await categoryService.getCategoryTags(parentId), t('CATEGORY_FOUND', locale), null, locale));
  }

  // 获取二级分类
  async getSubCategorys(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { tagId } = req.body;
    console.log("🚀 ~ 标签ID:", tagId)
    return res.json(Result.success(await categoryService.getCategoryTags(tagId), t('CATEGORY_FOUND', locale), null, locale));
  }
}

module.exports = new CategoryController();