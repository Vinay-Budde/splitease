/**
 * balanceCalculator.js
 * Computes net balances for a group and returns a simplified debt list.
 *
 * Algorithm:
 * 1. For each expense: payer gains total_amount, each split user loses owed_amount
 * 2. For each settlement: payer gains amount, payee loses amount
 * 3. Separate into creditors (net > 0) and debtors (net < 0)
 * 4. Greedy match: largest creditor with largest debtor
 * 5. Output: [{ from: userId, to: userId, amount }]
 */
const calculateBalances = (expenses, settlements, members) => {
  // Initialize net balance map for all group members
  const net = {};
  members.forEach((m) => {
    net[m.user_id] = 0;
  });

  // Process expenses
  expenses.forEach((expense) => {
    const paidBy = expense.paid_by;
    const totalAmount = parseFloat(expense.total_amount);

    // Payer gains the total amount
    if (net[paidBy] !== undefined) {
      net[paidBy] += totalAmount;
    }

    // Each split member loses their owed amount
    (expense.splits || []).forEach((split) => {
      const userId = split.user_id;
      const owedAmount = parseFloat(split.owed_amount);
      if (net[userId] !== undefined) {
        net[userId] -= owedAmount;
      }
    });
  });

  // Process settlements
  settlements.forEach((settlement) => {
    const paidBy = settlement.paid_by;
    const paidTo = settlement.paid_to;
    const amount = parseFloat(settlement.amount);

    if (net[paidBy] !== undefined) net[paidBy] += amount;
    if (net[paidTo] !== undefined) net[paidTo] -= amount;
  });

  // Separate into creditors and debtors (ignore near-zero amounts)
  const EPSILON = 0.01;
  const creditors = []; // net > 0 (others owe them)
  const debtors = [];   // net < 0 (they owe others)

  Object.entries(net).forEach(([userId, balance]) => {
    if (balance > EPSILON) {
      creditors.push({ userId: parseInt(userId), amount: balance });
    } else if (balance < -EPSILON) {
      debtors.push({ userId: parseInt(userId), amount: -balance }); // store positive
    }
  });

  // Sort descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy matching
  const transactions = [];
  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      from: debtor.userId,    // debtor pays
      to: creditor.userId,    // creditor receives
      amount: parseFloat(amount.toFixed(2)),
    });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < EPSILON) i++;
    if (debtor.amount < EPSILON) j++;
  }

  return transactions;
};

module.exports = { calculateBalances };
