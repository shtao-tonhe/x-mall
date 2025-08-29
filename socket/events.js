// socket/events.js
module.exports = {
  // 用户相关
  CONNECTED: 'connected',
  ERROR: 'error',
  SYSTEM_MESSAGE: 'system_message',

  // 客服相关
  AGENT_LOGIN: 'agent_login',
  AGENT_STATUS_CHANGE: 'agent_status_change',
  NEW_SESSION: 'new_session',

  // 管理平台相关
  REFRESH_ACTIVE_SESSIONS: 'refresh_active_sessions',
  ADMIN_ROOM: 'admin_room'
};