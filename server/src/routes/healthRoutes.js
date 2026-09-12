import express from 'express';

const router = express.Router();

// @route   GET /api/health
// @desc    Basic health check endpoint
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SyncSpace Server is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
