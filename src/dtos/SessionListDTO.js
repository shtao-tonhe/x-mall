// src/dtos/SessionListDTO.js
const { formatDateTime } = require('../utils/helpers');

class SessionListDTO {
  /**
   * 接收一个 session 数组，返回格式化后的列表
   * @param {Array} sessions - Prisma 查询出来的 session 列表
   */
  constructor(sessions) {
    // 如果是 null 或 undefined，返回空数组
    if (!Array.isArray(sessions)) {
      this.data = [];
      return;
    }

    // 对每个 session 进行格式化
    this.data = sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      agentId: session.agentId,
      startTime: formatDateTime(session.startTime),
      endTime: formatDateTime(session.endTime),
      status: session.status,
      platform_id: session.platform_id,
      user: session.user ? {
        id: session.user.id,
        avatar: session.user.avatar,
        levelName: session.user.level?.name || null
      } : null,
      agent: session.agent ? {
        id: session.agent.id,
        name: session.agent.name
      } : null
    }));
  }
}

module.exports = SessionListDTO;


// class PaginatedSessionListDTO {
//   constructor(sessions, total, page, pageSize) {
//     this.data = sessions.map(session => ({
//       id: session.id,
//       userId: session.userId,
//       status: session.status,
//       createdAt: formatDateTime(session.createdAt),
//       user: session.user ? { id: session.user.id, avatar: session.user.avatar } : null,
//       agent: session.agent ? { id: session.agent.id, name: session.agent.name } : null
//     }));
//     this.total = total;
//     this.page = page;
//     this.pageSize = pageSize;
//     this.hasNext = page * pageSize < total;
//   }
// }