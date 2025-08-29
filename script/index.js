const { Server } = require('socket.io');
const { platformService } = require('../src/services/platformService');
const { socketUtil } = require('../src/utils/socketUtil');

/**
 * 初始化 Socket.IO 服务器
 * @param {number} port - 监听端口
 * @returns {Server} Socket.IO 实例
 */
function initSocketServer(port) {
  const io = new Server(port, {
    cors: {
      origin: "*", // 生产环境需改为具体域名
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // 客户端连接事件
  io.on('connection', async (socket) => {
    console.log('新客户端尝试连接:', socket.id);

    try {
      // 1. 获取并验证平台标识
      const { platformIdentifier } = socket.handshake.auth;
      if (!platformIdentifier) {
        throw new Error('缺少平台标识(platformIdentifier)');
      }

      // 2. 从数据库验证平台有效性
      const platform = await platformService.getPlatformByIdentifier(platformIdentifier);
      if (!platform || !platform.status) {
        throw new Error('平台不存在或已禁用');
      }

      // 3. 初始化平台相关业务
      socketUtil.initClient(socket, platform);

      // 4. 发送连接成功消息
      socket.emit('connected', {
        message: '连接成功',
        platform: {
          id: platform.id,
          name: platform.name
        },
        socketId: socket.id
      });

      console.log(`客户端 ${socket.id} 已连接到平台 ${platform.name}`);

      // 5. 监听客户端断开连接
      socket.on('disconnect', () => {
        console.log(`客户端 ${socket.id} 断开连接`);
        socketUtil.removeClient(socket);
      });

    } catch (error) {
      console.error('连接验证失败:', error.message);
      socket.emit('error', { message: error.message });
      socket.disconnect(true); // 验证失败，强制断开连接
    }
  });

  console.log(`Socket.IO 服务器已启动，监听端口 ${port}`);
  return io;
}

// 启动服务器（可在入口脚本中调用）
// initSocketServer(3001);

module.exports = { initSocketServer };
