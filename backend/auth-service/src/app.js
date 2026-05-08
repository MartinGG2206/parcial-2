const express = require('express');
const cors = require('cors');
const routes = require('./routes/auth.routes');
const env = require('./config/env');

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin,
    credentials: false
  })
);
app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

module.exports = app;

