const { User } = require('../models');
const { Op } = require('sequelize');

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'avatar_url', 'created_at'],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email query param required' });

    const users = await User.findAll({
      where: { email: { [Op.like]: `%${email}%` } },
      attributes: ['id', 'name', 'email'],
      limit: 10,
    });
    return res.json(users);
  } catch (err) {
    console.error('searchUsers error:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = { getMe, searchUsers };
