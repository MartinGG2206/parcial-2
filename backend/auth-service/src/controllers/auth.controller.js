const authService = require('../services/auth.service');
const {
  validateRegistration,
  validateLogin,
  validateRoleUpdate
} = require('../dtos/auth.dto');

class AuthController {
  async register(req, res) {
    try {
      const payload = validateRegistration(req.body);
      const response = await authService.register(payload);
      return res.status(201).json(response);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const payload = validateLogin(req.body);
      const response = await authService.login(payload);
      return res.json(response);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }

  async me(req, res) {
    try {
      const user = await authService.getProfile(req.user.sub);
      return res.json(user);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async listUsers(req, res) {
    const users = await authService.listUsers();
    return res.json(users);
  }

  async updateRole(req, res) {
    try {
      const payload = validateRoleUpdate(req.body);
      const user = await authService.updateRole(Number(req.params.id), payload.role);
      return res.json(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();

