require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./config/database');
const Product = require('./models/product.model');
const productService = require('./services/product.service');

async function waitForDatabase(retries = 12, delayMs = 4000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.log(`catalog-service waiting for database (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  try {
    await waitForDatabase();
    await Product.sync();
    await productService.seedProducts();

    app.listen(env.port, () => {
      console.log(`catalog-service running on port ${env.port}`);
    });
  } catch (error) {
    console.error('catalog-service failed to start', error);
    process.exit(1);
  }
}

start();
