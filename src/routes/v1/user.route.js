
const express = require('express')
const { detectLocale } = require('../../utils/i18n');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.use(detectLocale);

// 邮箱-获取登录方式
router.post('/loginSources', userController.getLoginSources);

// 邮箱- 发送验证码
router.post('/sendEmail', userController.sendEmail);

// 邮箱- 重置密码
router.post('/resetPassword', userController.resetPassword);

// 邮箱-登录
router.post('/loginByEmail', userController.loginByEmail);

// // 手机号-登录
// router.post('/loginByPhone', userController.loginByPhone);

// // 区块链钱包-登录
// router.post('/loginByWallet', userController.loginByWallet);

// // Auth授权-登录
// router.post('/loginByAuth', userController.loginByAuth);

// // 用户详情
// router.post('/userinfo', userController.getProductsByHome);

// // 登出
// router.post('/logout', userController.getProductsByHome);

// // 注销（移除账户）
// router.post('/delete', userController.getProductsByHome);


module.exports = router;