
const { formatDateTime, serializeBigInt } = require('../utils/helpers');

class GooDListDTO {
  /**
   * 接收一个 good 数组，返回格式化后的列表
   * @param {Array} goods - Prisma 查询出来的 good 列表
   */
  constructor(goods) {
    if (!Array.isArray(goods)) {
      this.data = [];
      return;
    }

    this.data = goods.map(good => ({
      id: serializeBigInt(good.id),
      brand_id: serializeBigInt(good.brand_id) || null,
      product_category_id: serializeBigInt(good.product_category_id) || null,
      feight_template_id: serializeBigInt(good.feight_template_id) || null,
      product_attribute_category_id: serializeBigInt(good.product_attribute_category_id) || null,
      name: good.name,
      pic: good.pic,
      product_sn: good.product_sn,
      delete_status: good.delete_status,
      publish_status: good.publish_status,
      new_status: good.new_status,
      recommand_status: good.recommand_status,
      verify_status: good.verify_status,
      sort: good.sort,
      sale: good.sale,
      price: serializeBigInt(good.price) || null,
      promotion_price: serializeBigInt(good.promotion_price) || null,
      gift_growth: good.gift_growth,
      gift_point: good.gift_point,
      use_point_limit: good.use_point_limit,
      sub_title: good.sub_title,
      description: good.description,
      original_price: serializeBigInt(good.original_price) || null,
      stock: good.stock,
      low_stock: good.low_stock,
      unit: good.unit,
      weight: serializeBigInt(good.weight) || null,
      preview_status: good.preview_status,
      service_ids: good.service_ids,
      keywords: good.keywords,
      note: good.note,
      album_pics: good.album_pics,
      detail_title: good.detail_title,
      detail_desc: good.detail_desc,
      detail_html: good.detail_html,
      detail_mobile_html: good.detail_mobile_html,
      promotion_start_time: good.promotion_start_time, // DateTime 可被序列化
      promotion_end_time: good.promotion_end_time,
      promotion_per_limit: good.promotion_per_limit,
      promotion_type: good.promotion_type,
      brand_name: good.brand_name,
      product_category_name: good.product_category_name,
    }));
  }
}

module.exports = GooDListDTO;