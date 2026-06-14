/**
 * splitCalculator.js
 * Calculates owed_amount for each member based on split type.
 *
 * @param {string} splitType - 'equal' | 'unequal' | 'percentage' | 'shares'
 * @param {number} totalAmount - total expense amount
 * @param {Array} members - array of { user_id, value } where value meaning depends on splitType:
 *   equal      → value not used (calculated automatically)
 *   unequal    → value = exact amount owed
 *   percentage → value = percentage (0-100)
 *   shares     → value = share units (positive integer)
 * @returns {Array} - [{ user_id, owed_amount, share_value }]
 */
const calculateSplits = (splitType, totalAmount, members) => {
  const total = parseFloat(totalAmount);

  if (splitType === 'equal') {
    const base = parseFloat((total / members.length).toFixed(2));
    let distributed = 0;
    return members.map((m, idx) => {
      let owed;
      if (idx === members.length - 1) {
        // Last member absorbs rounding difference
        owed = parseFloat((total - distributed).toFixed(2));
      } else {
        owed = base;
        distributed += base;
      }
      return { user_id: m.user_id, owed_amount: owed, share_value: null };
    });
  }

  if (splitType === 'unequal') {
    const sum = members.reduce((acc, m) => acc + parseFloat(m.value), 0);
    if (Math.abs(sum - total) > 0.01) {
      throw new Error(`Unequal split amounts (${sum}) must sum to total (${total})`);
    }
    return members.map((m) => ({
      user_id: m.user_id,
      owed_amount: parseFloat(parseFloat(m.value).toFixed(2)),
      share_value: null,
    }));
  }

  if (splitType === 'percentage') {
    const sumPct = members.reduce((acc, m) => acc + parseFloat(m.value), 0);
    if (Math.abs(sumPct - 100) > 0.01) {
      throw new Error(`Percentage split must sum to 100 (got ${sumPct})`);
    }
    let distributed = 0;
    return members.map((m, idx) => {
      let owed;
      if (idx === members.length - 1) {
        owed = parseFloat((total - distributed).toFixed(2));
      } else {
        owed = parseFloat(((parseFloat(m.value) / 100) * total).toFixed(2));
        distributed += owed;
      }
      return { user_id: m.user_id, owed_amount: owed, share_value: parseFloat(m.value) };
    });
  }

  if (splitType === 'shares') {
    const totalShares = members.reduce((acc, m) => acc + parseFloat(m.value), 0);
    if (totalShares <= 0) throw new Error('Total shares must be greater than 0');
    let distributed = 0;
    return members.map((m, idx) => {
      let owed;
      if (idx === members.length - 1) {
        owed = parseFloat((total - distributed).toFixed(2));
      } else {
        owed = parseFloat(((parseFloat(m.value) / totalShares) * total).toFixed(2));
        distributed += owed;
      }
      return { user_id: m.user_id, owed_amount: owed, share_value: parseFloat(m.value) };
    });
  }

  throw new Error(`Unknown split type: ${splitType}`);
};

module.exports = { calculateSplits };
