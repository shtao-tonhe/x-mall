/**
 * 存储在线客户端信息
 * 结构: { socketId: { platformId, platformName, socket, userId? } }
 */
const onlineClients = new Map();

/**
 * Socket 工具类 - 处理客户端管理和平台隔离
 */
const socketUtil = {
  /**
   * 初始化客户端连接信息
   * @param {Socket} socket - 客户端socket实例
   * @param {Object} platform - 平台信息
   */
  initClient(socket, platform) {
    // 存储客户端信息
    onlineClients.set(socket.id, {
      platformId: platform.id,
      platformName: platform.name,
      socket,
      userId: socket.handshake.auth.userId || null
    });

    // 加入平台专属房间
    socket.join(`platform_${platform.id}`);
  },

  /**
   * 移除断开连接的客户端
   * @param {Socket} socket - 客户端socket实例
   */
  removeClient(socket) {
    onlineClients.delete(socket.id);
  },

  /**
   * 验证两个socket是否属于同一平台
   * @param {string} socketId1 - 第一个socket ID
   * @param {string} socketId2 - 第二个socket ID
   * @returns {boolean} 是否同一平台
   */
  validateSamePlatform(socketId1, socketId2) {
    const client1 = onlineClients.get(socketId1);
    const client2 = onlineClients.get(socketId2);

    if (!client1 || !client2) {
      return false;
    }

    return client1.platformId === client2.platformId;
  },

  /**
   * 向指定平台的所有客户端广播消息
   * @param {number} platformId - 平台ID
   * @param {string} event - 事件名称
   * @param {any} data - 消息数据
   */
  broadcastToPlatform(platformId, event, data) {
    const room = `platform_${platformId}`;
    const client = onlineClients.values().next().value;

    if (client) {
      client.socket.to(room).emit(event, data);
    }
  },

  /**
   * 获取指定平台的在线客户端列表
   * @param {number} platformId - 平台ID
   * @returns {Array<Object>} 客户端列表
   */
  getOnlineClientsByPlatform(platformId) {
    const clients = [];
    for (const [socketId, client] of onlineClients) {
      if (client.platformId === platformId) {
        clients.push({
          socketId,
          userId: client.userId,
          platformId: client.platformId
        });
      }
    }
    return clients;
  },

  /**
   * 获取客户端所属平台ID
   * @param {string} socketId - 客户端socket ID
   * @returns {number|null} 平台ID或null
   */
  getClientPlatformId(socketId) {
    const client = onlineClients.get(socketId);
    return client ? client.platformId : null;
  }
};

module.exports = { socketUtil };
