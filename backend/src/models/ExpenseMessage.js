const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExpenseMessage = sequelize.define('ExpenseMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  expense_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'expense_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = ExpenseMessage;
