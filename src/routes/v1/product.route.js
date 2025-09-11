
const express = require('express')
const { detectLocale } = require('../../utils/i18n');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router.use(detectLocale);

// 查询商品列表
router.post('/list', productController.getProductsByHome);

// 查询商品详情
router.post('/:id', productController.getProductById);

module.exports = router;