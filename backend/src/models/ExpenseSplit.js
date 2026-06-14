const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExpenseSplit = sequelize.define('ExpenseSplit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  expense_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  owed_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  share_value: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
}, {
  tableName: 'expense_splits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = ExpenseSplit;
