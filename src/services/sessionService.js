// services/session.service.js
class ServiceError extends Error {
  constructor(name, message, userMessage, code) {
    super(message);
    this.name = name;
    this.userMessage = userMessage; // 可用于前端展示
    this.code = code; // 错误码
  }
}

exports.createSession = async ({ platformIdentifier }) => {
  const platform = await platformService.getPlatformByIdentifier(platformIdentifier);
  if (!platform) {
    throw new ServiceError(
      'PlatformNotFound',
      `Platform ${platformIdentifier} not found`,
      '平台不存在',
      'MISSING_PLATFORM_ID'
    );
  }

  if (!platform.status) {
    throw new ServiceError(
      'PlatformDisabled',
      `Platform ${platformIdentifier} is disabled`,
      '平台已禁用',
      'PLATFORM_DISABLED'
    );
  }

  // ... 创建会话
};