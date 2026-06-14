const { ExpenseMessage, User, Expense, GroupMember } = require('../models');

// GET /api/expenses/:id/messages
const getMessages = async (req, res) => {
  try {
    const expenseId = req.params.id;

    const expense = await Expense.findByPk(expenseId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // Verify membership
    const membership = await GroupMember.findOne({
      where: { group_id: expense.group_id, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    const messages = await ExpenseMessage.findAll({
      where: { expense_id: expenseId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'ASC']],
      limit: 500,
    });

    return res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

module.exports = { getMessages };
