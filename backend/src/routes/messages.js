const express = require('express');
const router = express.Router({ mergeParams: true });
const { getMessages } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// GET /api/expenses/:id/messages
router.get('/', auth, getMessages);

module.exports = router;
