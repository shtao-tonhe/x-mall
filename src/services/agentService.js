const { prisma } = require('../../prisma/generated/prisma');
const { socketUtil } = require('../utils/socketUtil');

/**
 * 客服服务 - 处理客服在线状态、分配等业务
 */
const agentService = {
  /**
   * 获取指定平台的在线客服
   * @param {number} platformId - 平台ID
   * @returns {Promise<Array>} 在线客服列表
   */
  async getOnlineAgentsByPlatform(platformId) {
    // 1. 查询平台关联的客服（实际业务可能需要关联表）
    // 这里简化处理，查询所有在线客服
    const onlineAgents = await prisma.agent.findMany({
      where: {
        status: 'online',
        // 实际业务中需要关联平台和客服的关系表
        // platformRelations: { some: { platformId } }
      },
      select: {
        id: true,
        name: true,
        username: true,
        activeDuration: true,
        dispatchConfig: true
      },
      // 按当前会话数排序（最少会话的优先）
      orderBy: { sessions: { _count: 'asc' } }
    });

    return onlineAgents;
  },

  /**
   * 更新客服状态
   * @param {number} agentId - 客服ID
   * @param {string} status - 状态（online/offline/busy）
   * @returns {Promise<Object>} 更新后的客服信息
   */
  async updateAgentStatus(agentId, status) {
    // 记录状态变更时间
    const updateData = { status };
    if (status === 'online') {
      updateData.lastOnlineTime = new Date();
    }

    return prisma.agent.update({
      where: { id: agentId },
      data: updateData
    });
  },

  /**
   * 分配会话给客服
   * @param {number} sessionId - 会话ID
   * @param {number} agentId - 客服ID
   * @returns {Promise<Object>} 更新后的会话
   */
  async assignSessionToAgent(sessionId, agentId) {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        agentId,
        status: 'active',
        // 记录分配时间
        assignedAt: new Date()
      }
    });

    // 通知相关用户会话已分配
    const platformId = session.platformId;
    socketUtil.broadcastToPlatform(platformId, 'session_assigned', {
      sessionId: session.id,
      agentId,
      status: 'active'
    });

    return session;
  }
};

module.exports = agentService;
