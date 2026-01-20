const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        required: true,
    },
    times: [{
        type: String, // Format "HH:mm" - kept for backward compatibility
        required: true,
    }],
    // New: Specific date+time schedules
    scheduleDates: [{
        date: String, // Format "YYYY-MM-DD"
        time: String, // Format "HH:mm"
    }],
    frequency: {
        type: String,
        default: 'Daily', // or 'Scheduled' for specific dates
    },
    instructions: {
        type: String,
    },
}, {
    timestamps: true,
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
