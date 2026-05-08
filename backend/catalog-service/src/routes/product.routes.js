const { Router } = require('express');
const controller = require('../controllers/product.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'catalog-service', status: 'ok' });
});

router.get('/api/products', (req, res) => controller.list(req, res));
router.get('/api/products/:id', (req, res) => controller.getOne(req, res));
router.post('/api/products', authenticate, requireRole('ADMIN'), (req, res) =>
  controller.create(req, res)
);
router.put('/api/products/:id', authenticate, requireRole('ADMIN'), (req, res) =>
  controller.update(req, res)
);
router.delete('/api/products/:id', authenticate, requireRole('ADMIN'), (req, res) =>
  controller.delete(req, res)
);

module.exports = router;

