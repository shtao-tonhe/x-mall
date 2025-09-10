
const express = require('express')
const { detectLocale } = require('../../utils/i18n');
const goodController = require('../../controllers/good.controller');

const router = express.Router();

router.use(detectLocale);

// 查询商品列表
router.post('/list', goodController.getGoodsByHome);

// 查询商品详情
router.get(':id', goodController.getGoodsByHome);

module.exports = router;