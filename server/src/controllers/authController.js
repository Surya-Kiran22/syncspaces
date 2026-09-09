import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { JWT_SECRET } from '../middleware/auth.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * @desc    User Login
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @desc    Generate room token / guest room token
 * @route   POST /api/auth/room-token
 */
export const generateRoomToken = async (req, res) => {
  try {
    const { username, roomId } = req.body;

    if (!username || !roomId) {
      return res.status(400).json({ success: false, message: 'Username and roomId are required' });
    }

    const normalizedRoom = roomId.trim().toUpperCase();

    // Generate room token bound to specific room
    const token = jwt.sign(
      { username: username.trim(), allowedRoomId: normalizedRoom },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      success: true,
      token,
      roomId: normalizedRoom,
      username: username.trim(),
    });
  } catch (error) {
    console.error('Room Token Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating room token' });
  }
};
