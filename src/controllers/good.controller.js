

const prisma = global.prisma;
const GooDListDTO = require('../dtos/good-list.dto.js');
// const { GoodStatus } = require('../models/enums.js');
// const goodValidator = require('../validators/good.validator.js');
const Result = require('../utils/Result.js');
const { t, detectLocale } = require('../utils/i18n/index.js');

/**
 * 商品控制器
 */
class goodController {
  // 获取详情  /goods/:id
  async getgoodById(req, res, next) {
    const locale = req.locale || 'zh-CN';
    const { id: goodId } = req.params;

    if (!goodId || isNaN(parseInt(goodId))) {
      return res.json(Result.fail(
        t('INVALID_good_ID', locale),
        'INVALID_good_ID',
        null,
        [{ field: 'id', msg: t('good_ID_MUST_BE_NUMBER', locale) }],
        locale
      ));
    }

    try {
      const good = await prisma.pms_product.findUnique({
        where: { id: parseInt(goodId) },
        include: {
          user: {
            select: { id: true, avatar: true, level: { select: { name: true } } }
          },
          agent: {
            select: { id: true, name: true }
          }
        }
      });

      if (!good) {
        return res.json(Result.fail(
          t('good_NOT_FOUND', locale),
          'good_NOT_FOUND',
          null,
          [],
          locale
        ));
      }

      const goodDto = new goodDetailDTO(good);

      return res.json(Result.success(goodDto, t('good_FOUND', locale), null, locale));
    } catch (error) {
      next(error);
    }
  }

  // 获取商品列表
  async getGoodsByHome(req, res, next) {
    const locale = req.locale || 'zh-CN';

    // 解析分页参数（默认第1页，每页10条）
    const page = parseInt(req.body.pageNum) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const skip = (page - 1) * pageSize; // 计算偏移量

    console.log('body---:', req.body);

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
      const [goods, total] = await Promise.all([
        prisma.pms_product.findMany({
          orderBy: { id: 'desc' },
          skip,       // 跳过前N条
          take: pageSize // 获取当前页数量
        }),
        // 计算符合条件的总条数
        prisma.pms_product.count()
      ]);

      const goodsDto = new GooDListDTO(goods);

      // 构造分页信息
      const pagination = {
        page,           // 当前页码
        pageSize,       // 每页条数
        total,          // 总条数
        totalPages: Math.ceil(total / pageSize) // 总页数
      };

      // 使用分页响应格式返回
      return res.json(Result.page(
        goodsDto,
        pagination,
        null,
        'ACTIVE_goodS_FOUND',
        locale
      ));
    } catch (error) {
      next(error);
    }
  }
}

// 导出实例
module.exports = new goodController();