const TrackingLog = require('../models/TrackingLog');
const User = require('../models/User');

// @desc    Get stats of linked primary user
// @route   GET /api/caretaker/stats
// @access  Private (Caretaker only)
const getCaretakerStats = async (req, res) => {
    if (req.user.role !== 'caretaker') {
        return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.user.linkedPrimaryUserId) {
        return res.status(400).json({ message: 'No linked primary user' });
    }

    // Get today's events for the primary user
    // We can reuse the logic from getDailyEvents basically, or just fetch raw logs. 
    // For MVP stats, let's return today's logs + basic adherence.

    const today = new Date().toISOString().split('T')[0];

    const logs = await TrackingLog.find({
        userId: req.user.linkedPrimaryUserId,
        dateString: today
    }).populate('referenceId', 'name dosage');

    const total = logs.length;
    const taken = logs.filter(l => l.status === 'TAKEN').length;

    // Simple adherence % for today
    const adherence = total === 0 ? 0 : Math.round((taken / total) * 100);

    res.json({
        linkedUser: req.user.linkedPrimaryUserId,
        todayLogs: logs,
        todayAdherence: adherence
    });
};

module.exports = { getCaretakerStats };
