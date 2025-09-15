
const { serializeBigInt } = require('../utils/helpers');

class CategoryDTO {
  static toResponse(category) {
    if (!category) return null;

    const data = {
      id: serializeBigInt(category.id),
      name: category.name,
    };

    return data;
  }
}

module.exports = CategoryDTO;