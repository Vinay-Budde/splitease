const sequelize = require('../config/db');

const User = require('./User');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Expense = require('./Expense');
const ExpenseSplit = require('./ExpenseSplit');
const Settlement = require('./Settlement');
const ExpenseMessage = require('./ExpenseMessage');

// ─── User ↔ Group (creator) ───────────────────────────────────────────────
User.hasMany(Group, { foreignKey: 'created_by', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ─── Group ↔ GroupMember ↔ User ──────────────────────────────────────────
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'memberships' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

User.hasMany(GroupMember, { foreignKey: 'user_id', as: 'memberships' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Group.belongsToMany(User, { through: GroupMember, foreignKey: 'group_id', otherKey: 'user_id', as: 'members' });
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'user_id', otherKey: 'group_id', as: 'groups' });

// ─── Group ↔ Expense ─────────────────────────────────────────────────────
Group.hasMany(Expense, { foreignKey: 'group_id', as: 'expenses' });
Expense.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

User.hasMany(Expense, { foreignKey: 'paid_by', as: 'paidExpenses' });
Expense.belongsTo(User, { foreignKey: 'paid_by', as: 'payer' });

User.hasMany(Expense, { foreignKey: 'created_by', as: 'createdExpenses' });
Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ─── Expense ↔ ExpenseSplit ↔ User ───────────────────────────────────────
Expense.hasMany(ExpenseSplit, { foreignKey: 'expense_id', as: 'splits' });
ExpenseSplit.belongsTo(Expense, { foreignKey: 'expense_id', as: 'expense' });

User.hasMany(ExpenseSplit, { foreignKey: 'user_id', as: 'splits' });
ExpenseSplit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Group ↔ Settlement ──────────────────────────────────────────────────
Group.hasMany(Settlement, { foreignKey: 'group_id', as: 'settlements' });
Settlement.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

User.hasMany(Settlement, { foreignKey: 'paid_by', as: 'payments' });
Settlement.belongsTo(User, { foreignKey: 'paid_by', as: 'payer' });

User.hasMany(Settlement, { foreignKey: 'paid_to', as: 'receipts' });
Settlement.belongsTo(User, { foreignKey: 'paid_to', as: 'payee' });

// ─── Expense ↔ ExpenseMessage ↔ User ─────────────────────────────────────
Expense.hasMany(ExpenseMessage, { foreignKey: 'expense_id', as: 'messages' });
ExpenseMessage.belongsTo(Expense, { foreignKey: 'expense_id', as: 'expense' });

User.hasMany(ExpenseMessage, { foreignKey: 'user_id', as: 'messages' });
ExpenseMessage.belongsTo(User, { foreignKey: 'user_id', as: 'sender' });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseSplit,
  Settlement,
  ExpenseMessage,
};
