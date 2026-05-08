const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const env = require('../config/env');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'USER'),
      allowNull: false,
      defaultValue: 'USER'
    }
  },
  {
    tableName: 'users',
    schema: env.dbSchema,
    timestamps: true,
    underscored: true
  }
);

module.exports = User;

