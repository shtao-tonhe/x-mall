/**
 * 业务枚举常量 - 集中管理项目中所有状态码、类型标识
 */
module.exports = {
  // 发布状态
  GoodsPublishStatus: {
    "PUBLISH": 0,
    "NO_PUBLISH": 1,
  },

  // 删除状态
  GoodsDeleteStatus: {
    "NO_DELETE": 0,
    "DELETE": 1,
  },

  // 是否新品
  GoodsDeleteStatus: {
    "NO_NEW": 0,
    "NEW": 1,
  },

  // 是否推荐
  GoodsRecommandStatus: {
    "NO_RECOMMAND": 0,
    "RECOMMAND": 1,
  },

  // 是否审核
  GoodsVerifyStatus: {
    "NO_VERIFY": 0,
    "VERIFY": 1,
  },
};
