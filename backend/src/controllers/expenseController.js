const { Expense, ExpenseSplit, GroupMember, User, Group } = require('../models');
const { calculateSplits } = require('../utils/splitCalculator');

// POST /api/groups/:id/expenses
const createExpense = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { description, total_amount, paid_by, split_type, splits } = req.body;

    if (!description || !total_amount || !paid_by || !split_type || !splits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user is member
    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    // Calculate splits
    let calculatedSplits;
    try {
      calculatedSplits = calculateSplits(split_type, total_amount, splits);
    } catch (calcErr) {
      return res.status(400).json({ error: calcErr.message });
    }

    const expense = await Expense.create({
      group_id: groupId,
      description,
      total_amount: parseFloat(total_amount),
      paid_by: parseInt(paid_by),
      split_type,
      created_by: req.user.id,
    });

    const splitRecords = await ExpenseSplit.bulkCreate(
      calculatedSplits.map((s) => ({
        expense_id: expense.id,
        user_id: s.user_id,
        owed_amount: s.owed_amount,
        share_value: s.share_value,
      }))
    );

    const result = await Expense.findByPk(expense.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('createExpense error:', err);
    return res.status(500).json({ error: 'Failed to create expense' });
  }
};

// GET /api/groups/:id/expenses
const getGroupExpenses = async (req, res) => {
  try {
    const groupId = req.params.id;

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    const expenses = await Expense.findAll({
      where: { group_id: groupId },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    return res.json(expenses);
  } catch (err) {
    console.error('getGroupExpenses error:', err);
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
        {
          model: ExpenseSplit,
          as: 'splits',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // Verify membership in expense's group
    const membership = await GroupMember.findOne({
      where: { group_id: expense.group_id, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    return res.json(expense);
  } catch (err) {
    console.error('getExpenseById error:', err);
    return res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // Only creator or group admin can delete
    const membership = await GroupMember.findOne({
      where: { group_id: expense.group_id, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    const isCreator = expense.created_by === req.user.id;
    const isAdmin = membership.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Only the creator or admin can delete this expense' });
    }

    await ExpenseSplit.destroy({ where: { expense_id: expense.id } });
    await expense.destroy();

    return res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('deleteExpense error:', err);
    return res.status(500).json({ error: 'Failed to delete expense' });
  }
};

module.exports = { createExpense, getGroupExpenses, getExpenseById, deleteExpense };
