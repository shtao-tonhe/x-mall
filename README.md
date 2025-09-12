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

// ============支持web3钱包转账收取USDT==============
1. 用户下单，选择 "Pay with USDT"
2. 后端生成订单，返回：
   - 平台收款地址
   - 应付金额（如 50 USDT）
   - 订单 ID
3. 前端调起钱包，执行 USDT transfer()
4. 用户确认，交易上链
5. 前端拿到 txHash，立即提交给后端
6. 后端调用 Alchemy 查询交易，验证：
   - 是否成功
   - 是否转给了你
   - 金额是否正确
7. 验证通过 → 订单状态改为 paid → 进入发货流程
//      你的业务规模	                推荐方案
// 小型项目（NFT 销售、会员订阅）	 ✅ 方案2：单一地址 + data 字段写订单ID（增加data长度进而gas消耗）
// 中大型项目，追求自动化	        ✅ 方案3：智能合约 + 事件监听
// 快速 MVP 验证 	           ✅ 方案1：单一地址 + 精确金额区分订单
// 高频交易、交易所级	          ❌ 才考虑“每订单一地址”

// 方案 1：单一收款地址 + 金额 + 用户地址 区分订单（最常用）
// 流程：
// 所有收入都打到一个平台钱包：0xPlatform...
// 前端下单时，后端返回：
// 收款地址：0xPlatform...
// 精确金额：0.050001 ETH（末位加订单 ID 的哈希）
// 用户转账时必须转精确金额
// 后端监听 0xPlatform... 的入账，通过金额的微小差异识别是哪个订单
// 优点：
// 只需管理一个私钥
// 实现简单
// 被很多项目采用（如 OpenSea 早期）
// 缺点：
// 依赖用户转精确金额，体验略差
// 不能用于 ERC-20 代币（gas 费不同，金额难控制）

// 方案 2：单一地址 + 交易 data 字段写入订单 ID（推荐 ⭐）
// 这是更优雅的方式！
// 原理：
// 当用户支付时，前端调用钱包发送一笔带 data 的交易
// data 字段可以写入你的订单 ID（如 0x1234567890abcdef）
// 后端监听入账时，解析 data 字段，找到对应订单
// 注意：
// data 字段会消耗更多 gas
// 用户必须通过你的前端完成支付（不能手动转账）


//方案 3：使用智能合约接收付款（高级）
// 部署一个简单的支付合约：
// 缺点：
// 需要部署和维护合约
// 用户 gas 费更高

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