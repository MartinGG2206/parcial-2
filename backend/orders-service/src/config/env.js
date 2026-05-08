const env = {
  port: Number(process.env.PORT || 4003),
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || 'carpinteria_suite',
  dbUser: process.env.DB_USER || 'carpinteria',
  dbPassword: process.env.DB_PASSWORD || 'carpinteria123',
  dbSchema: process.env.DB_SCHEMA || 'orders_service',
  dbSsl: process.env.DB_SSL === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-carpinteria-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = env;

