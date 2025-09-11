

const prisma = global.prisma;
const userService = require('../services/user.service.js');

// const UserListDTO = require('../dtos/user-list.dto.js');
// const UserDetailDTO = require('../dtos/user-detail.dto.js');
const Result = require('../utils/Result.js');
const { t, detectLocale } = require('../utils/i18n/index.js');

/**
 * 用户控制器
 */
class userController {
  // 获取用户详情  /users/:id
  async getUserById(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { id: userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.json(Result.fail(
        t('INVALID_GOOD_ID', locale),
        'INVALID_GOOD_ID',
        null,
        [{ field: 'id', msg: t('GOOD_ID_MUST_BE_NUMBER', locale) }],
        locale
      ));
    }

    try {
      const user = await prisma.pms_user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return res.json(Result.fail(
          t('GOOD_NOT_FOUND', locale),
          'GOOD_NOT_FOUND',
          null,
          [],
          locale
        ));
      }

      const userDto = new UserDetailDTO(user);

      return res.json(Result.success(userDto.data, t('GOOD_FOUND', locale), null, locale));
    } catch (error) {
      next(error);
    }
  }

  // 获取登录方式列表
  async getLoginSources(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const sources = [
      { desc: '邮箱验证码', value: 'email' },
      { desc: '手机号验证码', value: 'phone' },
      { desc: 'web3钱包', value: 'wallet' },
      { desc: '第三方授权', value: 'auth' },
    ]

    return res.json(Result.success(sources, '获取登录方式成功', locale), null, locale)
  } catch(error) {
    next(error);
  }

  // 邮箱登录
  async loginByEmail(req, res, next) {
    const locale = req.locale || 'zh-CN';
    return res.json(await userService.loginByEmail(req.body.email, req.body.code));
  }

  // 发送邮件验证码
  async sendEmail(req, res, next) {
    const locale = req.locale || 'zh-CN';

    const { source } = req.body;
    if (!source) {
      return res.json(Result.fail(
        t('INVALID_PARAMS', locale),
        'INVALID_PARAMS',
        null,
        [{ field: 'source', msg: t('PARAM_REQUIRED', locale) }],
        locale
      ));
    }

    // 校验邮箱是否有效

    // 吊用发用邮件服务
    let sendRes
    if (source == 'login-verification-code') {
      sendRes = await userService.sendEmailByLogin(req.body.email);
      console.log("🚀 ~ 用户登录验证码返回值:", sendRes)
      return res.json(sendRes);
    }
  }

  async resetPassword(req, res, next) {
    const locale = req.locale || 'zh-CN';

    // 发送重置链接至邮箱
    await EmailService.send('RESET_PASSWORD', { order: orderData }, orderData.userEmail);

    return res.json(Result.success(null, t('RESET_PASSWORD_SUCCESS', locale), locale));
  }
}

// 导出实例
module.exports = new userController();