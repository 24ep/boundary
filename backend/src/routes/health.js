const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', async (req, res) => {
  try {
    const healthStatus = await supabaseService.getHealthStatus();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: healthStatus.database,
        redis: healthStatus.redis,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// @route   GET /api/health/detailed
// @desc    Detailed health check
// @access  Private
router.get('/detailed', async (req, res) => {
  try {
    const healthStatus = await supabaseService.getHealthStatus();
    const dbStats = await supabaseService.getDatabaseStats();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: healthStatus.database,
        redis: healthStatus.redis,
      },
      database: {
        stats: dbStats,
        connection: healthStatus.database === 'connected' ? 'ok' : 'error',
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        version: process.env.npm_package_version || '1.0.0',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

module.exports = router;
