// src/dtos/sessionDetail.dto.js
const { formatDateTime } = require('../utils/helpers');

class SessionDetailDTO {
  constructor(session) {
    this.id = session.id;

    this.startTime = formatDateTime(session.startTime);
    this.endTime = formatDateTime(session.endTime);

    // 👇 状态字段保持原样（假设是字符串）
    this.status = session.status;
    this.platform_id = session.platform_id;

    // 👇 关联数据：用户和客服
    this.user = session.user ? {
      id: session.user.id,
      avatar: session.user.avatar,
      levelName: session.user.level?.name || null
    } : null;

    this.agent = session.agent ? {
      id: session.agent.id,
      name: session.agent.name
    } : null;
  }
}

module.exports = SessionDetailDTO;
