const express = require('express');
const { detectLocale } = require('./utils/i18n');
// const { globalRateLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const http = require('http');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// const { initializeSocket } = require('../socket/socket.io');

const morgan = require('morgan');

// 初始化Prisma客户端（全局单例）
global.prisma = new PrismaClient();

// 初始化Express应用
const app = express();
const server = http.createServer(app);

// 初始化 Socket
// initializeSocket(server);

// ===== 中间件配置 =====
// 解析JSON请求体
app.use(express.json())
app.use(morgan('combined')) // 记录请求日志
app.use(detectLocale)
// app.use(globalRateLimiter);

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

// 跨域配置（根据实际环境调整）
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*', // 生产环境需指定具体域名
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use('/api', require('./routes')); // 自动加载 routes/index.js
// app.use('/api', require('./routes').v1);  // 显式控制版本

// ===== 健康检查接口 =====
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected', // 实际项目可添加数据库连接检查
      websocket: 'running'
    }
  });
});

app.use(errorHandler);

// ===== 启动服务 =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`📅 [${new Date()}] 服务已启动，当前代码版本已加载！`);

  // // 启动WebSocket服务（共享HTTP服务器）
  // const io = initSocketServer(server);
  // console.log('WebSocket server initialized');
});

// 处理进程退出，关闭Prisma连接
process.on('SIGINT', async () => {
  await global.prisma.$disconnect();
  process.exit(0);
});


module.exports = app;
