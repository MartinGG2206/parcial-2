const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
  host: env.dbSocketPath ? 'localhost' : env.dbHost,
  port: env.dbPort,
  dialect: 'mysql',
  logging: false,
  dialectOptions: env.dbSocketPath
    ? {
        socketPath: env.dbSocketPath
      }
    : {}
});

module.exports = {
  sequelize
};
