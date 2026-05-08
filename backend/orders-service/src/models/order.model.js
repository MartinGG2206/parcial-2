const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const env = require('../config/env');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customerName: {
      type: DataTypes.STRING(140),
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING(140),
      allowNull: false
    },
    projectType: {
      type: DataTypes.STRING(90),
      allowNull: false
    },
    material: {
      type: DataTypes.STRING(90),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDIENTE', 'EN_PRODUCCION', 'ENTREGADO', 'CANCELADO'),
      allowNull: false,
      defaultValue: 'PENDIENTE'
    },
    estimatedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'orders',
    schema: env.dbSchema,
    timestamps: true,
    underscored: true
  }
);

module.exports = Order;

