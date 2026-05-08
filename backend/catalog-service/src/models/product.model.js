const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(140),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    woodType: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    finish: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true
  }
);

module.exports = Product;

