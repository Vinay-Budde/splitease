const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Settlement = sequelize.define('Settlement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  group_id: { type: DataTypes.INTEGER, allowNull: false },
  paid_by: { type: DataTypes.INTEGER, allowNull: false },
  paid_to: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  note: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'settlements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Settlement;
