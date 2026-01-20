const express = require('express');
const router = express.Router();
const { getDailyEvents, logEvent, getHistory } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/today', protect, getDailyEvents);
router.post('/log', protect, logEvent);
router.get('/history', protect, getHistory);

module.exports = router;
