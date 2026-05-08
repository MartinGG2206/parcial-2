const Order = require('../models/order.model');

class OrderRepository {
  listAll() {
    return Order.findAll({ order: [['createdAt', 'DESC']] });
  }

  listByUser(userId) {
    return Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  findById(id) {
    return Order.findByPk(id);
  }

  create(payload) {
    return Order.create(payload);
  }

  update(id, payload) {
    return Order.update(payload, { where: { id } });
  }

  delete(id) {
    return Order.destroy({ where: { id } });
  }
}

module.exports = new OrderRepository();

