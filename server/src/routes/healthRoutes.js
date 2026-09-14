import express from 'express';

const router = express.Router();

// @route   GET /api/health
// @desc    Basic health check endpoint
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SyncSpace Express API',
    message: 'SyncSpace Server is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// @route   GET /api/health/details
// @desc    Detailed server diagnostics & system metrics endpoint
// @access  Public
router.get('/details', (req, res) => {
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    service: 'SyncSpace Express API',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
