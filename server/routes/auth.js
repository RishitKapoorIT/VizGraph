import express from 'express';
import { registerUser, loginUser, googleLogin, forgotPassword, updateProfile } from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST api/auth/google
// @desc    Authenticate user with Google & get token
// @access  Public
router.post('/google', googleLogin);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, updateProfile);

// @route   GET api/auth/user
// @desc    Get current user profile
// @access  Private
router.get('/user', verifyToken, async (req, res) => {
    try {
        // Fetch user from database to get latest data
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.error('Get user profile error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

export default router;
