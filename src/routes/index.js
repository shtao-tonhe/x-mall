// routes/index.js
const express = require('express');
const v1Routes = require('./v1'); // 自动加载 v1/index.js

const router = express.Router();

// 挂载不同版本的 API（目前只有 v1）
router.use('/v1', v1Routes);

// 将来可以加 v2
// router.use('/v2', v2Routes);

module.exports = router;