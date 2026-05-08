const orderService = require('../services/order.service');
const { validateOrder, validateStatus } = require('../dtos/order.dto');

class OrderController {
  async list(req, res) {
    const orders = await orderService.listOrders(req.user);
    return res.json(orders);
  }

  async create(req, res) {
    try {
      const payload = validateOrder(req.body);
      const order = await orderService.createOrder(req.user, payload);
      return res.status(201).json(order);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const payload = validateOrder(req.body);
      const order = await orderService.updateOrder(req.user, Number(req.params.id), payload);
      return res.json(order);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const payload = validateStatus(req.body);
      const order = await orderService.updateStatus(req.user, Number(req.params.id), payload.status);
      return res.json(order);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await orderService.deleteOrder(req.user, Number(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new OrderController();

