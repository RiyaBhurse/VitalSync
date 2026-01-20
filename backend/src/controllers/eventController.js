const TrackingLog = require('../models/TrackingLog');
const Medicine = require('../models/Medicine');

// Helper to get today's date string YYYY-MM-DD
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// @desc    Get daily timeline (auto-generates PENDING logs)
// @route   GET /api/events/today
// @access  Private
const getDailyEvents = async (req, res) => {
    const today = getTodayDateString();

    // 1. Get all medicines for user
    const medicines = await Medicine.find({ userId: req.user._id });

    // 2. Ensure logs exist for today
    const logsToCreate = [];

    // Fetch existing logs for today
    const existingLogs = await TrackingLog.find({
        userId: req.user._id,
        dateString: today
    });

    // Map existing logs for quick lookup: medicineId + time
    const existingMap = new Set(existingLogs.map(log => `${log.referenceId.toString()}-${log.scheduledTime}`));

    for (const med of medicines) {
        // Check scheduleDates for today first (new feature)
        if (med.scheduleDates && med.scheduleDates.length > 0) {
            // Look for schedules matching today
            const todaysSchedules = med.scheduleDates.filter(s => s.date === today);

            for (const schedule of todaysSchedules) {
                const compositeKey = `${med._id.toString()}-${schedule.time}`;
                if (!existingMap.has(compositeKey)) {
                    logsToCreate.push({
                        userId: req.user._id,
                        type: 'MEDICINE',
                        referenceId: med._id,
                        status: 'PENDING',
                        scheduledTime: schedule.time,
                        dateString: today,
                        timestamp: new Date()
                    });
                }
            }
        }

        // Also check recurring times (backward compatibility / daily repeat)
        // Only if no scheduleDates are set (pure daily mode)
        if (!med.scheduleDates || med.scheduleDates.length === 0) {
            for (const time of med.times || []) {
                const compositeKey = `${med._id.toString()}-${time}`;
                if (!existingMap.has(compositeKey)) {
                    logsToCreate.push({
                        userId: req.user._id,
                        type: 'MEDICINE',
                        referenceId: med._id,
                        status: 'PENDING',
                        scheduledTime: time,
                        dateString: today,
                        timestamp: new Date()
                    });
                }
            }
        }
    }

    if (logsToCreate.length > 0) {
        try {
            await TrackingLog.insertMany(logsToCreate, { ordered: false });
        } catch (e) {
            // Ignore duplicate key errors
        }
    }

    // 3. Fetch all logs for today and populate medicine info
    const allLogs = await TrackingLog.find({
        userId: req.user._id,
        dateString: today
    }).populate('referenceId', 'name dosage instructions')
        .sort({ scheduledTime: 1 });

    res.json(allLogs);
};

// @desc    Log an event (Update status)
// @route   POST /api/events/log
// @access  Private
const logEvent = async (req, res) => {
    const { eventId, status } = req.body;

    const log = await TrackingLog.findById(eventId);

    if (!log) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (log.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    log.status = status;
    log.timestamp = new Date();
    await log.save();

    res.json(log);
};

// @desc    Get history
// @route   GET /api/events/history?date=YYYY-MM-DD
// @access  Private
const getHistory = async (req, res) => {
    const { date } = req.query;
    let query = { userId: req.user._id };

    if (date) {
        query.dateString = date;
    }

    const logs = await TrackingLog.find(query).sort({ dateString: -1, scheduledTime: 1 });
    res.json(logs);
};

module.exports = { getDailyEvents, logEvent, getHistory };
