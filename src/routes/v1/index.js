const express = require('express');
const router = express.Router();

// 导入各业务路由模块
const sessionRoutes = require('./session.route');
// 可在此处导入其他路由，例如：
// const agentRoutes = require('./agent.route');
// const userRoutes = require('./user.route');
// const workOrderRoutes = require('./workOrder.route');

// 挂载会话相关路由
// 所有会话接口路径前缀为 /api/v1/sessions
router.use('/sessions', sessionRoutes);

// 可在此处挂载其他路由，例如：
// router.use('/agents', agentRoutes);
// router.use('/users', userRoutes);
// router.use('/work-orders', workOrderRoutes);

// 根路径测试接口
router.get('/', (req, res) => {
  res.json({
    message: 'API V1',
    availableEndpoints: [
      '|- /sessions',
      '|- /agents',
      '|- /users'
    ]
  });
});

module.exports = router;