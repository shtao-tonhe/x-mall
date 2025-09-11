
const prisma = global.prisma;
const redisClient = require('../utils/redis');
const Result = require('../utils/Result.js');
const emailService = require('./common/email.service');
const { generateVerificationCode } = require('../utils/helpers');
const jwtUtil = require('../utils/jwt')
const { serializeBigInt } = require('../utils/helpers');

class UserService {
  // 检测用户是否存在
  async checkUserExists(userEmail) {
    const user = await prisma.ums_member.findUnique({
      where: { email: userEmail },
      // 👇 只查询你需要的字段，提升性能
      select: {
        id: true,
        nickname: true,
        username: true, // 可选：备用名称
      }
    });

    // return !!user;
    return user;
  }

  // 检测用户是否被禁用/账号冻结  0: 禁用 1: 正常
  async checkUserStatus(userId) {
    const user = await prisma.ums_member.findUnique({
      where: { id: parseInt(userId) },
      select: {
        status: true,
      }
    });
    return user.status === 1;
  }

  // 获取用户详情信息
  async getUserById(userId) {
    return await prisma.ums_member.findUnique({
      where: { id: parseInt(userId) },
    });
  }

  // 发送邮箱登录验证码
  async sendEmailByLogin(userEmail) {
    // Step 1: 生成 6 位随机数字验证码
    const verificationCode = await generateVerificationCode()
    console.log('verificationCode---', verificationCode);

    // Step 2: 将验证码存入 Redis，key 为 email:login:邮箱地址，有效期 5 分钟
    const key = `email:login:${userEmail}`;
    await redisClient.setEx(key, 300, verificationCode); // 300 秒 = 5 分钟

    // 3、发送邮件
    const sendEmail = await emailService.send(userEmail, 'login-verification-code', {
      verificationCode: verificationCode,
      userName: 'Dear Member',
      locale: 'en-US'
    })
    console.log('sendEmail---c----', sendEmail);
    return sendEmail ? Result.success(null, 'service-发送成功') : Result.error('service-发送失败');
  }

  // 邮箱登录
  async loginByEmail(userEmail, inputCode) {
    // const key = `email:login:${userEmail}`;
    // const storedCode = await redisClient.get(key);

    // // 1. 验证码不存在（已过期）
    // if (!storedCode) {
    //   return Result.error('验证码已过期，请重新发送');
    // }

    // // 2. 验证码错误
    // if (storedCode !== inputCode) {
    //   return Result.error('验证码错误，请重新输入');
    // }

    // // 3. 验证成功，删除验证码（防重放）
    // await redisClient.del(key);

    // 4. 查询用户是否存在
    let user = await this.checkUserExists(userEmail);
    console.log("🚀 ~ UserService ~ loginByEmail ~ user:", user)

    // 5. 不存在
    if (!user) {
      // user = await userRepository.create({
      //   email: userEmail,
      //   nickname: `用户_${Date.now() % 10000}`, // 临时昵称
      //   avatar: 'https://example.com/default-avatar.png',
      //   status: 1,
      //   loginType: 'email', // 登录方式标记
      // });
      return Result.error('账号不存在');
    }

    // 6. 检测用户是否被禁用/账号冻结
    const isUserStatus = await this.checkUserStatus(user.id);
    console.log("🚀 ~ UserService ~ loginByEmail ~ isUserStatus:", isUserStatus)
    if (!isUserStatus) {
      return Result.error('账号被禁用，请联系管理员');
    }

    // 7. 生成 JWT token 和 refreshToken
    const accessToken = jwtUtil.generateToken({
      userId: serializeBigInt(user.id),
      email: user.email,
    });

    const refreshToken = jwtUtil.generateRefreshToken({
      userId: serializeBigInt(user.id),
      email: user.email,
    });

    // 8. 可选：将 refreshToken 存入 Redis（用于登出或刷新）
    await redisClient.setEx(
      `refreshToken:${user.id}`,
      2592000, // 30天过期
      refreshToken
    );

    // 9. 返回结果（不要返回敏感信息如密码）
    return Result.success({
      token: accessToken,
      refreshToken,
    }, '登录成功');
  }
}

module.exports = new UserService();