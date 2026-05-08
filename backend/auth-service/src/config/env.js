const env = {
  port: Number(process.env.PORT || 4001),
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || 'carpinteria_suite',
  dbUser: process.env.DB_USER || 'carpinteria',
  dbPassword: process.env.DB_PASSWORD || 'carpinteria123',
  dbSchema: process.env.DB_SCHEMA || 'auth_service',
  instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME || '',
  dbSocketPath:
    process.env.DB_SOCKET_PATH ||
    (process.env.INSTANCE_CONNECTION_NAME
      ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
      : ''),
  dbSsl: process.env.DB_SSL === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-carpinteria-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminName: process.env.ADMIN_NAME || 'Administrador Carpinteria',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@carpinteria.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123*'
};

module.exports = env;
