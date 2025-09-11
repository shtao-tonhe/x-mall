
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const mailConfig = require('../../../config/mail.config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
      tls: {
        rejectUnauthorized: false, // 可根据需要调整
      },
    });

    // 测试连接
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ 邮件服务连接失败:', error);
      } else {
        console.log('✅ 邮件服务已就绪:', success);
      }
    });
  }

  /**
   * 发送邮件（核心方法）
   * @param {string} to 收件人邮箱
   * @param {string} templateName 模板名称（如 'order-confirm'）
   * @param {Object} data 模板数据
   * @param {Object} options 动态添加附件
   */
  async send(to, templateName, data = {}, options = {}) {
    try {
      const htmlContent = await this.renderTemplate(templateName, data);
      const subject = this.getSubject(templateName, data);

      const mailOptions = {
        from: mailConfig.from,
        to,
        subject, // 邮件主题
        text: '这是一封测试邮件的正文内容。', // 纯文本正文
        html: htmlContent, // HTML 正文
        // 动态添加附件等高级功能 --- 需要附件则调用时使用下方代码入参
        // await emailService.send(email, 'order-invoice', data, {
        //   attachments: [{
        //     filename: 'invoice.pdf',
        //     path: '/path/to/invoice.pdf'
        //   }]
        // });
        // ==============================================
        // attachments: [
        //   {
        //     filename: 'example.txt', // 文件名
        //     path: './example.txt',   // 本地文件路径
        //   },
        //   {
        //     filename: 'image.png',
        //     path: './image.png',
        //     cid: 'unique@cid', // 嵌入图片时的唯一 ID
        //   },
        // ],
        ...(options && options.attachments && { attachments: options.attachments }),
        ...(options && options.cc && { cc: options.cc }),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 邮件已发送: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ 发送邮件失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }
  }

  /**
   * 渲染 EJS 模板
   */
  async renderTemplate(templateName, data) {
    console.log("🚀 ~ 生成邮箱页面:", data)
    const lang = data.locale || 'zh-CN';
    const dirMap = {
      'en-US': 'en',
      'zh-CN': 'zh'
    };
    const langDir = dirMap[lang] || 'zh';

    const templatePath = path.resolve(__dirname, '../../../templates/emails', langDir, `${templateName}.ejs`);

    // 回退到默认中文
    if (!fs.existsSync(templatePath)) {
      const fallbackPath = path.resolve(__dirname, '../../../templates/emails/zh', `${templateName}.ejs`);
      return fs.readFileSync(fallbackPath, 'utf-8');
    }

    const source = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(source, data);
  }

  /**
   * 根据模板名和数据生成邮件主题（可扩展）
   */
  getSubject(templateName, data) {
    const subjects = {
      'order-confirmed': `订单确认 - 订单号: ${data.orderId}`,
      'password-reset': '重置您的密码',
      'register-verification-code': '欢迎加入X-Mall！',
      'login-verification-code': `您正在通过邮箱登录X-Mall,登录验证码：${data.verificationCode}`,
    };
    return subjects[templateName];
  }
}

// 导出单例
module.exports = new EmailService();