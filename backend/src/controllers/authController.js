const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, inviteCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    let linkedPrimaryUserId = null;

    if (role === 'caretaker') {
        if (!inviteCode) {
            return res.status(400).json({ message: 'Invite code required for caretaker registration' });
        }
        const primaryUser = await User.findOne({ inviteCode });
        if (!primaryUser) {
            return res.status(400).json({ message: 'Invalid invite code' });
        }
        linkedPrimaryUserId = primaryUser._id;
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'primary',
        linkedPrimaryUserId,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            linkedPrimaryUserId: user.linkedPrimaryUserId // Send back so frontend knows
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            linkedPrimaryUserId: user.linkedPrimaryUserId,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

module.exports = { registerUser, loginUser };
