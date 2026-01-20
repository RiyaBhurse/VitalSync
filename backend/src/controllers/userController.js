const User = require('../models/User');
const crypto = require('crypto');

// @desc    Generate invite code
// @route   POST /api/users/invite-code
// @access  Private (Primary only)
const generateInviteCode = async (req, res) => {
    if (req.user.role !== 'primary') {
        return res.status(403).json({ message: 'Only primary users can generate invite codes' });
    }

    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    req.user.inviteCode = inviteCode;
    await req.user.save();

    res.json({ inviteCode });
};

module.exports = { generateInviteCode };
