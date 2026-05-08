const { Router } = require('express');
const controller = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'orders-service', status: 'ok' });
});

router.get('/api/orders', authenticate, (req, res) => controller.list(req, res));
router.post('/api/orders', authenticate, (req, res) => controller.create(req, res));
router.put('/api/orders/:id', authenticate, (req, res) => controller.update(req, res));
router.patch('/api/orders/:id/status', authenticate, (req, res) =>
  controller.updateStatus(req, res)
);
router.delete('/api/orders/:id', authenticate, (req, res) => controller.delete(req, res));

module.exports = router;

