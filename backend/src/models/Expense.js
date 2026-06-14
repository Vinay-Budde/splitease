const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  group_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paid_by: { type: DataTypes.INTEGER, allowNull: false },
  split_type: {
    type: DataTypes.ENUM('equal', 'unequal', 'percentage', 'shares'),
    allowNull: false,
  },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Expense;
