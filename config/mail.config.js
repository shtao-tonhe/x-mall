
module.exports = {
  host: 'smtp.qq.com',           // SMTP 服务器地址
  port: 587,                     // 端口：587 (TLS) 或 465 (SSL)
  secure: false,                 // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_HOST, // 发件人邮箱
    pass: process.env.MAIL_USER, // 授权码（不是登录密码！QQ邮箱需开启SMTP并获取授权码）
  },

  // 默认发件人
  from: `"X-Mall" <${process.env.MAIL_HOST}>`,

  // 是否启用调试模式
  debug: process.env.NODE_ENV !== 'production',
};

console.log('📧 MAIL_HOST:', process.env.MAIL_HOST);
console.log('🔑 MAIL_USER:', process.env.MAIL_USER ? '已设置' : '未设置');