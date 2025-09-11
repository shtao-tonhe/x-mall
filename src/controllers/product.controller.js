
const ProductService = require('../services/product.service');
const ProductListDTO = require('../dtos/product-list.dto.js');
const ProductDetailDTO = require('../dtos/product-detail.dto.js');
// const { ProductStatus } = require('../models/enums.js');
// const productValidator = require('../validators/product.validator.js');
const Result = require('../utils/Result.js');
const { t } = require('../utils/i18n/index.js');

class ProductController {
  // 获取详情 /products/:id
  async getProductById(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { id: productId } = req.params;

    if (!productId || isNaN(parseInt(productId))) {
      return res.json(Result.fail(
        t('INVALID_GOOD_ID', locale),
        'INVALID_GOOD_ID',
        null,
        [{ field: 'id', msg: t('GOOD_ID_MUST_BE_NUMBER', locale) }],
        locale
      ));
    }

    try {
      const product = await ProductService.getProductById(productId);

      if (!product) {
        return res.json(Result.fail(
          t('GOOD_NOT_FOUND', locale),
          'GOOD_NOT_FOUND',
          null,
          [],
          locale
        ));
      }

      const productDto = new ProductDetailDTO(product);
      return res.json(Result.success(productDto.data, t('GOOD_FOUND', locale), null, locale));
    } catch (error) {
      next(error);
    }
  }

  // 获取商品列表
  async getProductsByHome(req, res, next) {
    const locale = req.locale || 'zh-CN';

    const page = parseInt(req.body.pageNum) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    // 参数校验
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return res.json(Result.fail(
        t('INVALID_PAGINATION_PARAMS', locale),
        'INVALID_PAGINATION',
        null,
        [
          { field: 'page', msg: t('PAGE_MUST_BE_POSITIVE', locale) },
          { field: 'pageSize', msg: t('PAGE_SIZE_RANGE', locale, { min: 1, max: 100 }) }
        ],
        locale
      ));
    }

    try {
      const result = await ProductService.getProducts(page, pageSize);

      const productsDto = new ProductListDTO(result.data);

      const pagination = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };

      return res.json(Result.page(
        productsDto.data,
        pagination,
        null,
        'ACTIVE_GOODS_FOUND',
        locale
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();