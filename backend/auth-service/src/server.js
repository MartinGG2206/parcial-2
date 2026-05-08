require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const { sequelize, ensureSchema } = require('./config/database');
const User = require('./models/user.model');
const authService = require('./services/auth.service');

async function waitForDatabase(retries = 10, delayMs = 4000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.log(`auth-service waiting for database (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  try {
    await waitForDatabase();
    await ensureSchema();
    await User.sync();
    await authService.bootstrapAdmin();

    app.listen(env.port, () => {
      console.log(`auth-service running on port ${env.port}`);
    });
  } catch (error) {
    console.error('auth-service failed to start', error);
    process.exit(1);
  }
}

start();
