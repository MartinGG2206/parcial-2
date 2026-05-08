const Product = require('../models/product.model');

class ProductRepository {
  listAll() {
    return Product.findAll({ order: [['createdAt', 'DESC']] });
  }

  findById(id) {
    return Product.findByPk(id);
  }

  create(payload) {
    return Product.create(payload);
  }

  update(id, payload) {
    return Product.update(payload, { where: { id } });
  }

  delete(id) {
    return Product.destroy({ where: { id } });
  }

  count() {
    return Product.count();
  }

  bulkCreate(items) {
    return Product.bulkCreate(items);
  }
}

module.exports = new ProductRepository();

