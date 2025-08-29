// controllers/session.controller.js
const prisma = global.prisma;
const SessionDetailDTO = require('../dtos/SessionDetailDTO.js');
const SessionListDTO = require('../dtos/SessionListDTO.js');
const { SessionStatus } = require('../models/enums.js');
const SessionValidator = require('../validators/session.validator');
const Result = require('../utils/Result');
const { t, detectLocale } = require('../utils/i18n');

/**
 * 会话控制器 - 处理会话相关的 HTTP 请求
 */
class SessionController {
  /**
   * 创建新会话
   * POST /api/v1/sessions
   */
  async createSession(req, res, next) {
    const locale = req.locale || 'zh-CN';

    try {
      const { platformId, userId, ip, language, detailId } = req.body;

      // 1. 参数验证
      const errors = SessionValidator.validateCreateInput({ platformId, userId, userIp: ip });
      if (errors.length > 0) {
        return res.json(Result.validation(errors, locale));
      }

      // 2. 创建会话
      const session = await prisma.session.create({
        data: {
          platformId,
          userId: userId || null,
          status: SessionStatus.PENDING,
          ip,
          language: language || 'zh-CN',
          detailId,
          startTime: new Date()
        }
      });

      // 3. 返回成功响应
      return res.json(Result.success(
        session,
        null, // 使用默认消息（SESSION_CREATED）
        'SESSION_CREATED',
        locale
      ));
    } catch (error) {
      // 如果是已知业务异常，可以在这里映射
      // 否则交给全局 error handler
      next(error);
    }
  }

  /**
   * 获取会话详情
   * GET /api/v1/sessions/:id
   */
  async getSessionById(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { id: sessionId } = req.params;

    if (!sessionId || isNaN(parseInt(sessionId))) {
      return res.json(Result.fail(
        t('INVALID_SESSION_ID', locale),
        'INVALID_SESSION_ID',
        null,
        [{ field: 'id', msg: t('SESSION_ID_MUST_BE_NUMBER', locale) }],
        locale
      ));
    }

    try {
      const session = await prisma.session.findUnique({
        where: { id: parseInt(sessionId) },
        include: {
          user: {
            select: { id: true, avatar: true, level: { select: { name: true } } }
          },
          agent: {
            select: { id: true, name: true }
          }
        }
      });

      if (!session) {
        return res.json(Result.fail(
          t('SESSION_NOT_FOUND', locale),
          'SESSION_NOT_FOUND',
          null,
          [],
          locale
        ));
      }

      const sessionDto = new SessionDetailDTO(session);

      return res.json(Result.success(sessionDto, t('SESSION_FOUND', locale), null, locale));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新会话状态
   * PATCH /api/v1/sessions/:id
   */
  async updateSession(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { id: sessionId } = req.params;
    const updateData = req.body;

    if (!sessionId || isNaN(parseInt(sessionId))) {
      return res.json(Result.fail(
        t('INVALID_SESSION_ID', locale),
        'INVALID_SESSION_ID',
        null,
        [{ field: 'id', msg: t('SESSION_ID_MUST_BE_NUMBER', locale) }],
        locale
      ));
    }

    try {
      // 如果是结束会话，自动计算 duration
      if (updateData.status === SessionStatus.ENDED && updateData.duration === undefined) {
        const session = await prisma.session.findUnique({
          where: { id: parseInt(sessionId) },
          select: { startTime: true }
        });

        if (session?.startTime) {
          const duration = Math.floor((new Date() - new Date(session.startTime)) / 1000);
          updateData.duration = duration;
          updateData.endTime = new Date();
        }
      }

      const updatedSession = await prisma.session.update({
        where: { id: parseInt(sessionId) },
        data: updateData
      });

      return res.json(Result.success(
        updatedSession,
        null,
        'SESSION_UPDATED',
        locale
      ));
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma 记录未找到
        return res.json(Result.fail(
          t('SESSION_NOT_FOUND', locale),
          'SESSION_NOT_FOUND',
          null,
          [],
          locale
        ));
      }
      next(error);
    }
  }

  /**
   * 获取平台的活跃会话列表（支持分页）
   * POST /api/v1/sessions/active
   */
  async getActiveSessionsByPlatform(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { platformId } = req.body;

    // 解析分页参数（默认第1页，每页10条）
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const skip = (page - 1) * pageSize; // 计算偏移量

    // 验证平台ID和分页参数
    if (!platformId || isNaN(parseInt(platformId))) {
      return res.json(Result.fail(
        t('INVALID_PLATFORM_ID', locale),
        'INVALID_PLATFORM_ID',
        null,
        [{ field: 'platformId', msg: t('PLATFORM_ID_MUST_BE_NUMBER', locale) }],
        locale
      ));
    }

    // 验证分页参数合理性
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return res.json(Result.fail(
        t('INVALID_PAGINATION_PARAMS', locale),
        'INVALID_PAGINATION',
        null,
        [
          { field: 'page', msg: t('PAGE_MUST_BE_POSITIVE', locale) },
          { field: 'pageSize', msg: t('PAGE_SIZE_RANGE', locale, { min: 1, max: 100 }) }
        ],
        locale
      ));
    }

    try {
      // 并行执行：查询列表 + 计算总数（提高性能）
      const [sessions, total] = await Promise.all([
        // 查询当前页数据
        prisma.session.findMany({
          where: {
            platformId: parseInt(platformId),
            status: { in: [SessionStatus.PENDING, SessionStatus.ACTIVE] }
          },
          include: {
            user: {
              select: { id: true, avatar: true, level: { select: { name: true } } }
            },
            agent: {
              select: { id: true, name: true }
            }
          },
          orderBy: { startTime: 'desc' },
          skip,       // 跳过前N条
          take: pageSize // 获取当前页数量
        }),
        // 计算符合条件的总条数
        prisma.session.count({
          where: {
            platformId: parseInt(platformId),
            status: { in: [SessionStatus.PENDING, SessionStatus.ACTIVE] }
          }
        })
      ]);

      const sessionsDto = new SessionListDTO(sessions);

      // 构造分页信息
      const pagination = {
        page,           // 当前页码
        pageSize,       // 每页条数
        total,          // 总条数
        totalPages: Math.ceil(total / pageSize) // 总页数
      };

      // 使用分页响应格式返回
      return res.json(Result.page(
        sessionsDto,
        pagination,
        null,
        'ACTIVE_SESSIONS_FOUND',
        locale
      ));
    } catch (error) {
      next(error);
    }
  }
}

// 导出实例
module.exports = new SessionController();