const express = require('express');
const router = express.Router();
const { generateInviteCode } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/invite-code', protect, generateInviteCode);

module.exports = router;
