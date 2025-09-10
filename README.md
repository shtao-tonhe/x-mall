### x-customer-chat-service
├── .env                          # 环境变量配置文件
├── .gitignore                    # Git忽略文件配置
├── package.json                  # 项目依赖和脚本
├── README.md                     # 项目说明文档
├── app.js 或 server.js           # 应用入口文件
│
├── prisma/                       # prisma
│
├── script/                       # 业务需要的脚本
│
├── socket/                       # socket服务端
│   ├── handlers/
│   │   ├── user.handler.js
│   │   ├── agent.handler.js
│   │   └── admin.handler.js
│   ├── middleware/
│   │   └── auth.socket.middleware.js
│   ├── events.js
│   └── socket.io.js
│
├── config/
│   ├── database.js
│   ├── jwt.js
│   └── index.js
│
├── src/
│   │
│   ├── controllers/
│   │   ├── chat.controller.js
│   │   └── session.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │   └── i18n.middleware.js
│   │
│   ├── models/
│   │   ├── index.js
│   │   └── Message.js
│   │   └── Session.js
│   │
│   ├── services/                 # 业务逻辑层 (核心业务处理) 高内聚、低耦合，每个 service 只做一件事。
│   │   ├── agentService.js
│   │   ├── chat.service.js
│   │   ├── platformService.js
│   │   └── session.service.js
│   │
│   ├── routes/                   # 路由定义
│   │   ├── v1/                   # API版本管理
│   │   │   ├── chat.route.js
│   │   │   └── session.route.js
│   │   └── index.js              # 路由聚合文件
│   │
│   │
│   ├── utils/                    # 工具函数和公共方法
│   │   ├── helpers.js            # 通用辅助函数
│   │   ├── jwt.utils.js          # JWT相关工具
│   │   ├── file.utils.js         # 文件操作工具
│   │   └── ai.utils.js           # AI服务调用封装
│   │   └── i18n/
│   │       ├── index.js          # 主模块：t() 函数
│   │       ├── middleware.js     # 中间件：detectLocale
│   │       └── locales/          # 或直接放 json 文件
│   │           ├── zh-CN.json
│   │           └── en-US.json
│   │


Tsoa + TS 装饰器生成Api文档

Winston是强大、灵活的 Node.js开源日志库之一，
理论上， Winston  是一个可以记录所有信息的记录器。
这是一个高度直观的工具，易于定制。可以通过更改几行代码来调整其背后的逻辑。
它使对数据库或文件等持久存储位置的日志记录变得简单容易。

网友整理Joi验证
https://juejin.cn/post/7510039027933904915

调用来源	谁负责验证
HTTP API (controller)	middleware / validator 在 controller 前
WebSocket (socket.io)	在 socket.on('event') 里先验证
CLI 脚本	在脚本中手动验证参数
Cron 任务	通常无需验证（可信来源）
## service 始终只做一件事：假设输入合法，执行业务逻辑

举个真实例子：用户发起会话
## session.service 调用了其他 service，但它自己仍是“主业务逻辑”。
用户客户端
    ↓ HTTP POST /api/v1/session
routes/session.route.js
    ↓
controllers/session.controller.js
    ↓ 提取 platformId, userId
services/session.service.js
    ↓ 核心逻辑：
      - 创建会话
      - 检查客服在线状态
      - 调用 services/agent.service.js 获取在线客服
      - 调用 services/notification.service.js 发送 WebSocket 消息
    ↓
controller 返回 { sessionId, detailId }
    ↓
res.json(...)


## 现代后端开发中 分层架构（Layered Architecture） 的标准实践
客户端 (前端)
    ↓ 发起请求（如 POST /api/v1/session）
→ routes/         → 控制路由，匹配路径和方法
    ↓
→ controller/     → 接收请求，提取参数，调用 service
    ↓
→ service/        → 执行核心业务逻辑（如数据库操作、状态判断、调用其他服务）
    ↓
→ model / DB      → 数据持久化（如 Prisma 操作数据库）
    ↓
← service/        ← 返回处理结果
    ↓
← controller/     ← 组装响应数据，返回给客户端



消息过滤：防止 XSS、敏感词（可集成 AI 内容审核）
速率限制：防刷消息（使用 rate-limiter-flexible）

AI 自动回复	utils/ai.utils.js 调用大模型 API
消息存储加密	数据库字段加密（如 message.content）
多租户支持	增加 tenantId 字段，隔离数据
Webhook 回调	services/webhookService.js 通知第三方系统
客服排班系统	services/scheduleService.js
会话质检	services/qaService.js + NLP 分析