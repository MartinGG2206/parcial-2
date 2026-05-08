const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
  host: env.dbSocketPath || env.dbHost,
  port: env.dbPort,
  dialect: 'postgres',
  logging: false,
  dialectOptions: env.dbSsl && !env.dbSocketPath
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {}
});

async function ensureSchema() {
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${env.dbSchema}"`);
}

module.exports = {
  sequelize,
  ensureSchema
};
