const express = require('express');
const router = express.Router();
const { getMe, searchUsers } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, getMe);
router.get('/search', auth, searchUsers);

module.exports = router;
