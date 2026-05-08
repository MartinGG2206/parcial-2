const env = {
  port: Number(process.env.PORT || 4002),
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME || 'carpinteria_catalog',
  dbUser: process.env.DB_USER || 'carpinteria',
  dbPassword: process.env.DB_PASSWORD || 'carpinteria123',
  jwtSecret: process.env.JWT_SECRET || 'dev-carpinteria-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = env;

