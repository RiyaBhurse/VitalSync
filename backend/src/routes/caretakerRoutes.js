const express = require('express');
const router = express.Router();
const { getCaretakerStats } = require('../controllers/caretakerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getCaretakerStats);

module.exports = router;
