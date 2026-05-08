const User = require('../models/user.model');

class UserRepository {
  findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  findById(id) {
    return User.findByPk(id);
  }

  create(payload) {
    return User.create(payload);
  }

  listAll() {
    return User.findAll({
      attributes: ['id', 'fullName', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
  }

  updateRole(id, role) {
    return User.update({ role }, { where: { id } });
  }
}

module.exports = new UserRepository();

