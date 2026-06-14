const { Group, GroupMember, User, Expense, ExpenseSplit, Settlement } = require('../models');
const { calculateBalances } = require('../utils/balanceCalculator');

// POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });

    const group = await Group.create({
      name,
      description: description || null,
      created_by: req.user.id,
    });

    // Creator becomes admin member
    await GroupMember.create({
      group_id: group.id,
      user_id: req.user.id,
      role: 'admin',
    });

    return res.status(201).json(group);
  } catch (err) {
    console.error('createGroup error:', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
};

// GET /api/groups
const getGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          ],
        },
      ],
    });

    const groups = memberships.map((m) => ({
      ...m.group.toJSON(),
      role: m.role,
    }));

    return res.json(groups);
  } catch (err) {
    console.error('getGroups error:', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

// GET /api/groups/:id
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: GroupMember,
          as: 'memberships',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Verify user is a member
    const isMember = group.memberships.some((m) => m.user_id === req.user.id);
    if (!isMember) return res.status(403).json({ error: 'Not a member of this group' });

    return res.json(group);
  } catch (err) {
    console.error('getGroupById error:', err);
    return res.status(500).json({ error: 'Failed to fetch group' });
  }
};

// POST /api/groups/:id/members
const addMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Verify requester is admin
    const requesterMembership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!requesterMembership) return res.status(403).json({ error: 'Not a member' });

    // Find user to add
    const userToAdd = await User.findOne({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: 'User not found with that email' });

    // Check if already a member
    const existing = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userToAdd.id },
    });
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const membership = await GroupMember.create({
      group_id: groupId,
      user_id: userToAdd.id,
      role: 'member',
    });

    return res.status(201).json({
      ...membership.toJSON(),
      user: { id: userToAdd.id, name: userToAdd.name, email: userToAdd.email },
    });
  } catch (err) {
    console.error('addMember error:', err);
    return res.status(500).json({ error: 'Failed to add member' });
  }
};

// DELETE /api/groups/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const { id: groupId, userId } = req.params;

    // Verify requester is admin or self-removing
    const requesterMembership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!requesterMembership) return res.status(403).json({ error: 'Not a member' });

    const isAdmin = requesterMembership.role === 'admin';
    const isSelf = parseInt(userId) === req.user.id;
    if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Only admins can remove members' });

    const deleted = await GroupMember.destroy({
      where: { group_id: groupId, user_id: userId },
    });

    if (!deleted) return res.status(404).json({ error: 'Member not found' });
    return res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('removeMember error:', err);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
};

// GET /api/groups/:id/balances
const getBalances = async (req, res) => {
  try {
    const groupId = req.params.id;

    // Verify membership
    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    // Get all members
    const members = await GroupMember.findAll({ where: { group_id: groupId } });

    // Get all expenses with splits
    const expenses = await Expense.findAll({
      where: { group_id: groupId },
      include: [{ model: ExpenseSplit, as: 'splits' }],
    });

    // Get all settlements
    const settlements = await Settlement.findAll({ where: { group_id: groupId } });

    const transactions = calculateBalances(expenses, settlements, members);

    // Enrich with user info
    const userIds = [...new Set([
      ...transactions.map((t) => t.from),
      ...transactions.map((t) => t.to),
    ])];

    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'email'],
    });
    const userMap = {};
    users.forEach((u) => (userMap[u.id] = u));

    const enriched = transactions.map((t) => ({
      from: userMap[t.from],
      to: userMap[t.to],
      amount: t.amount,
    }));

    return res.json(enriched);
  } catch (err) {
    console.error('getBalances error:', err);
    return res.status(500).json({ error: 'Failed to calculate balances' });
  }
};

module.exports = { createGroup, getGroups, getGroupById, addMember, removeMember, getBalances };
