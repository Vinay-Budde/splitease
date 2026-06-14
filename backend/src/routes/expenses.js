const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  deleteExpense,
} = require('../controllers/expenseController');
const auth = require('../middleware/authMiddleware');

// Group-scoped routes (mounted at /api/groups/:id/expenses)
router.post('/', auth, createExpense);
router.get('/', auth, getGroupExpenses);

// Expense-specific routes (mounted at /api/expenses)
router.get('/:id', auth, getExpenseById);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
