const orderRepository = require('../repositories/order.repository');

class OrderService {
  listOrders(user) {
    if (user.role === 'ADMIN') {
      return orderRepository.listAll();
    }

    return orderRepository.listByUser(user.sub);
  }

  async createOrder(user, payload) {
    return orderRepository.create({
      ...payload,
      userId: user.sub
    });
  }

  async updateOrder(user, orderId, payload) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Solicitud no encontrada.');
    }

    if (user.role !== 'ADMIN' && (order.userId !== user.sub || order.status !== 'PENDIENTE')) {
      throw new Error('No puedes editar esta solicitud.');
    }

    await orderRepository.update(orderId, payload);
    return orderRepository.findById(orderId);
  }

  async updateStatus(user, orderId, status) {
    if (user.role !== 'ADMIN') {
      throw new Error('Solo un administrador puede cambiar el estado.');
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Solicitud no encontrada.');
    }

    await orderRepository.update(orderId, { status });
    return orderRepository.findById(orderId);
  }

  async deleteOrder(user, orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Solicitud no encontrada.');
    }

    if (user.role !== 'ADMIN' && (order.userId !== user.sub || order.status !== 'PENDIENTE')) {
      throw new Error('No puedes eliminar esta solicitud.');
    }

    await orderRepository.delete(orderId);
  }
}

module.exports = new OrderService();

