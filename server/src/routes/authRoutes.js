import express from 'express';
import { registerUser, loginUser, generateRoomToken } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/room-token
router.post('/room-token', generateRoomToken);

export default router;
