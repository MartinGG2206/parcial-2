const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'ok' });
});

router.post('/api/auth/register', (req, res) => controller.register(req, res));
router.post('/api/auth/login', (req, res) => controller.login(req, res));
router.get('/api/auth/me', authenticate, (req, res) => controller.me(req, res));
router.get('/api/auth/users', authenticate, requireRole('ADMIN'), (req, res) =>
  controller.listUsers(req, res)
);
router.patch('/api/auth/users/:id/role', authenticate, requireRole('ADMIN'), (req, res) =>
  controller.updateRole(req, res)
);

module.exports = router;

