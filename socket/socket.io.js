// socket/socket.io.js

const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// 工具 & 服务
const { socketUtil } = require('../src/utils/socketUtil');
const { platformService } = require('../src/services/platformService');
const { sessionService } = require('../src/services/sessionService'); // ✅ 使用 Service 层
const { agentService } = require('../src/services/agentService');

// 事件常量
const EVENTS = require('./events');

// 客服 Socket 映射: { agentId: socketId }
const agentSockets = new Map();

let io;

function initializeSocket(server) {
  // io.use(async (socket, next) => {
  //   const token = socket.handshake.auth.token;
  //   if (!token) return next(new Error('未授权'));
  //   // 验证 JWT
  //   try {
  //     const user = verifyToken(token);
  //     socket.user = user;
  //     next();
  //   } catch (err) {
  //     next(new Error('Token 无效'));
  //   }
  // });

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*', // 建议配置具体域名
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[SOCKET] 新客户端连接: ${socket.id}`);

    try {
      await handleUserConnection(socket);
    } catch (error) {
      console.error('[SOCKET] 连接处理失败:', error);
      socket.emit(EVENTS.ERROR, { message: '连接失败，请稍后重试' });
      socket.disconnect();
    }

    // 注册事件监听
    socket.on(EVENTS.AGENT_LOGIN, (data) => {
      handleAgentLogin(socket, data);
    });

    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });

  console.log('✅ WebSocket 服务器已初始化');
}

// 处理用户连接
async function handleUserConnection(socket) {
  const { platformIdentifier, userId } = socket.handshake.auth;

  if (!platformIdentifier) {
    throw new Error('缺少平台标识');
  }

  // 1. 验证平台
  const platform = await platformService.getPlatformByIdentifier(platformIdentifier);
  if (!platform || !platform.status) {
    throw new Error('平台不存在或已禁用');
  }

  // 2. 初始化客户端信息
  socketUtil.initClient(socket, platform);

  // 3. 用户标识
  const userIdentifier = userId || `temp_${uuidv4().slice(0, 8)}`;
  const userIp = socket.handshake.address;

  // 4. 创建会话
  const sessionData = {
    platformId: platform.id,
    userId: userId ? parseInt(userId) : null,
    userIp,
    status: 'pending',
    title: `新会话-${new Date().toLocaleTimeString()}`,
    detailId: uuidv4()
  };

  const newSession = await sessionService.createSession(sessionData); // ✅ 使用 service

  // 5. 绑定会话到 socket
  socket.sessionId = newSession.id;
  socket.userIdentifier = userIdentifier;

  // 6. 查询在线客服并通知
  const onlineAgents = await agentService.getOnlineAgentsByPlatform(platform.id);

  if (onlineAgents.length > 0) {
    onlineAgents.forEach((agent) => {
      const agentSocketId = agentSockets.get(agent.id);
      if (agentSocketId) {
        io.to(agentSocketId).emit(EVENTS.NEW_SESSION, {
          session: newSession,
          userInfo: { identifier: userIdentifier, ip: userIp, platform: platform.name }
        });
      }
    });
  } else {
    socket.emit(EVENTS.SYSTEM_MESSAGE, {
      content: '当前暂无在线客服，我们将尽快回复您',
      type: 'info'
    });
  }

  // 7. 通知管理员刷新
  io.to(EVENTS.ADMIN_ROOM).emit(EVENTS.REFRESH_ACTIVE_SESSIONS, {
    platformId: platform.id,
    timestamp: new Date()
  });

  // 8. 返回连接成功
  socket.emit(EVENTS.CONNECTED, {
    sessionId: newSession.id,
    sessionDetailId: newSession.detailId,
    platform: platform.name,
    message: '连接成功'
  });
}

// 处理客服登录
function handleAgentLogin(socket, { agentId }) {
  if (!agentId) {
    socket.emit(EVENTS.ERROR, { message: '缺少客服ID' });
    return;
  }

  agentSockets.set(agentId, socket.id);
  agentService.updateAgentStatus(agentId, 'online').catch(console.error);

  io.to(EVENTS.ADMIN_ROOM).emit(EVENTS.AGENT_STATUS_CHANGE, {
    agentId,
    status: 'online',
    time: new Date()
  });

  console.log(`[AGENT] 客服 ${agentId} 上线`);
}

// 处理断开连接
async function handleDisconnect(socket) {
  socketUtil.removeClient(socket);

  // 检查是否是客服
  const agentId = Array.from(agentSockets.entries())
    .find(([_, sid]) => sid === socket.id)?.[0];

  if (agentId) {
    agentSockets.delete(agentId);
    await agentService.updateAgentStatus(agentId, 'offline').catch(console.error);
    io.to(EVENTS.ADMIN_ROOM).emit(EVENTS.AGENT_STATUS_CHANGE, {
      agentId,
      status: 'offline',
      time: new Date()
    });
    console.log(`[AGENT] 客服 ${agentId} 下线`);
  }

  // 处理用户断开
  if (socket.sessionId) {
    await sessionService.handleUserDisconnect(socket.sessionId).catch(console.error);
  }

  console.log(`[SOCKET] 客户端断开: ${socket.id}`);
}

module.exports = { initializeSocket, agentSockets };