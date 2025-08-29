/**
 * 业务枚举常量 - 集中管理项目中所有状态码、类型标识
 * 避免硬编码，确保前后端一致性
 */
module.exports = {
  /**
   * 会话状态
   * - PENDING: 待分配（用户已连接，等待客服接入）
   * - ACTIVE: 进行中（客服已接入，正在聊天）
   * - ENDED: 已结束（会话正常关闭）
   * - ABANDONED: 已放弃（用户未等待客服接入就离开）
   */
  SessionStatus: {
    PENDING: 'pending',
    ACTIVE: 'active',
    ENDED: 'ended',
    ABANDONED: 'abandoned'
  },

  /**
   * 消息类型
   * 用于区分不同类型的消息内容
   */
  MessageType: {
    TEXT: 'text',       // 文本消息
    IMAGE: 'image',     // 图片消息
    VIDEO: 'video',     // 视频消息
    FILE: 'file',       // 文件消息
    EMOJI: 'emoji',     // 表情消息
    SYSTEM: 'system'    // 系统消息（如"客服已接入"）
  },

  /**
   * 客服状态
   * 标识客服当前的工作状态
   */
  AgentStatus: {
    ONLINE: 'online',   // 在线（可接收新会话）
    BUSY: 'busy',       // 忙碌（当前会话数已满）
    OFFLINE: 'offline', // 离线（不接收会话）
    AWAY: 'away'        // 暂离（暂时不接收新会话）
  },

  /**
   * 工单状态
   * 用于管理客户提交的问题工单
   */
  WorkOrderStatus: {
    PENDING: 'pending',     // 待处理
    PROCESSING: 'processing', // 处理中
    CLOSED: 'closed',       // 已关闭
    REOPENED: 'reopened'    // 已重开
  },

  /**
   * 平台状态
   * 控制平台是否可用
   */
  PlatformStatus: {
    ENABLED: true,  // 启用
    DISABLED: false // 禁用
  },

  /**
   * 用户类型
   * 区分不同角色的用户
   */
  UserType: {
    NORMAL: 'normal',   // 普通用户
    VIP: 'vip',         // VIP用户
    ADMIN: 'admin'      // 管理员（内部使用）
  }
};
