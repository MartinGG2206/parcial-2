require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const { sequelize, ensureSchema } = require('./config/database');
const Order = require('./models/order.model');

async function waitForDatabase(retries = 10, delayMs = 4000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.log(`orders-service waiting for database (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  try {
    await waitForDatabase();
    await ensureSchema();
    await Order.sync();

    app.listen(env.port, () => {
      console.log(`orders-service running on port ${env.port}`);
    });
  } catch (error) {
    console.error('orders-service failed to start', error);
    process.exit(1);
  }
}

start();
