const express = require('express');
const router = express.Router({ mergeParams: true });
const { createSettlement, getSettlements } = require('../controllers/settlementController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createSettlement);
router.get('/', auth, getSettlements);

module.exports = router;
