const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');

router.post('/parent', categoryController.getCategorys);
router.post('/tags', categoryController.getSubCategorys);
router.post('/children', categoryController.getSubCategorys);

module.exports = router;