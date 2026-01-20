const mongoose = require('mongoose');

const trackingLogSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['MEDICINE'],
        required: true,
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Medicine', // Dynamic ref could be better but for MVP Medicine is fine
    },
    status: {
        type: String,
        enum: ['PENDING', 'TAKEN', 'SKIPPED'],
        default: 'PENDING',
    },
    scheduledTime: {
        type: String, // "HH:mm"
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    dateString: {
        type: String, // "YYYY-MM-DD" helpful for easy querying by day
        required: true,
    }
}, {
    timestamps: true,
});

// Compound index to quickly find logs for a specific user, ref, time, and date
trackingLogSchema.index({ userId: 1, referenceId: 1, dateString: 1, scheduledTime: 1 }, { unique: true });

const TrackingLog = mongoose.model('TrackingLog', trackingLogSchema);

module.exports = TrackingLog;
