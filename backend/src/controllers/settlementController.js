const { Settlement, GroupMember, User } = require('../models');

// POST /api/groups/:id/settlements
const createSettlement = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { paid_to, amount, note } = req.body;

    if (!paid_to || !amount) {
      return res.status(400).json({ error: 'paid_to and amount are required' });
    }

    // Verify requester is a member
    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    // Verify payee is a member
    const payeeMembership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: paid_to },
    });
    if (!payeeMembership) return res.status(400).json({ error: 'Payee is not a member of this group' });

    const settlement = await Settlement.create({
      group_id: groupId,
      paid_by: req.user.id,
      paid_to: parseInt(paid_to),
      amount: parseFloat(amount),
      note: note || null,
    });

    const result = await Settlement.findByPk(settlement.id, {
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('createSettlement error:', err);
    return res.status(500).json({ error: 'Failed to create settlement' });
  }
};

// GET /api/groups/:id/settlements
const getSettlements = async (req, res) => {
  try {
    const groupId = req.params.id;

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    const settlements = await Settlement.findAll({
      where: { group_id: groupId },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(settlements);
  } catch (err) {
    console.error('getSettlements error:', err);
    return res.status(500).json({ error: 'Failed to fetch settlements' });
  }
};

module.exports = { createSettlement, getSettlements };
