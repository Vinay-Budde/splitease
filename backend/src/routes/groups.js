const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  removeMember,
  getBalances,
} = require('../controllers/groupController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createGroup);
router.get('/', auth, getGroups);
router.get('/:id', auth, getGroupById);
router.post('/:id/members', auth, addMember);
router.delete('/:id/members/:userId', auth, removeMember);
router.get('/:id/balances', auth, getBalances);

module.exports = router;
