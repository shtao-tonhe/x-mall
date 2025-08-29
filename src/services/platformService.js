const { prisma } = require('../../prisma/generated/prisma');

/**
 * 平台服务 - 处理平台相关的数据库操作
 */
const platformService = {
  /**
   * 通过平台标识获取平台信息
   * @param {string} identifier - 平台唯一标识
   * @returns {Promise<Object|null>} 平台信息或null
   */
  async getPlatformByIdentifier(identifier) {
    try {
      return await prisma.platform.findUnique({
        where: { identifier },
        select: {
          id: true,
          name: true,
          status: true,
          source: true
        }
      });
    } catch (error) {
      console.error('获取平台信息失败:', error);
      return null;
    }
  },

  /**
   * 验证平台是否有权限使用特定功能
   * @param {number} platformId - 平台ID
   * @param {string} feature - 功能名称 (如 'chat', 'ticket')
   * @returns {Promise<boolean>} 是否有权限
   */
  async hasFeaturePermission(platformId, feature) {
    try {
      const platform = await prisma.platform.findUnique({
        where: { id: platformId },
      });

      if (!platform || !platform.status) {
        return false;
      }

      // 实际业务中可从数据库获取该平台的权限列表
      const baseFeatures = ['chat', 'ticket'];
      return baseFeatures.includes(feature);
    } catch (error) {
      console.error('验证平台权限失败:', error);
      return false;
    }
  }
};

module.exports = { platformService };
