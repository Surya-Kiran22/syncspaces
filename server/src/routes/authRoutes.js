import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

export default router;
