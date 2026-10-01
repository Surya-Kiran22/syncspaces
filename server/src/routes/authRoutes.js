import express from 'express';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', (req, res) => {
  res.status(200).json({ message: 'Register route scaffolded' });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', (req, res) => {
  res.status(200).json({ message: 'Login route scaffolded' });
});

export default router;
