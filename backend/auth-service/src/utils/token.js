const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    env.jwtSecret,
    { expiresIn: '12h' }
  );
}

module.exports = {
  signToken
};

