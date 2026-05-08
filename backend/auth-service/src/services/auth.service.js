const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { signToken } = require('../utils/token');
const env = require('../config/env');

class AuthService {
  async register(payload) {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new Error('El correo ya esta registrado.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await userRepository.create({
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      role: 'USER'
    });

    return this.buildAuthResponse(user);
  }

  async login(payload) {
    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new Error('Credenciales invalidas.');
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Credenciales invalidas.');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    return this.serializeUser(user);
  }

  listUsers() {
    return userRepository.listAll();
  }

  async updateRole(userId, role) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    if (user.email === env.adminEmail && role !== 'ADMIN') {
      throw new Error('No puedes degradar el administrador principal.');
    }

    await userRepository.updateRole(userId, role);
    const updatedUser = await userRepository.findById(userId);
    return this.serializeUser(updatedUser);
  }

  async bootstrapAdmin() {
    const existingAdmin = await userRepository.findByEmail(env.adminEmail);
    if (existingAdmin) {
      return;
    }

    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await userRepository.create({
      fullName: env.adminName,
      email: env.adminEmail,
      passwordHash,
      role: 'ADMIN'
    });
  }

  buildAuthResponse(user) {
    return {
      token: signToken(user),
      user: this.serializeUser(user)
    };
  }

  serializeUser(user) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();

