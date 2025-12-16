const { pool } = require('../config/database');
const winston = require('winston');

// Configure logger (same as before)
// ...

/**
 * Database health check middleware
 */
const databaseHealthCheck = async (req, res, next) => {
  try {
    // const healthStatus = await supabaseService.getHealthStatus();
    // Replaced with simple pool query
    await pool.query('SELECT 1');
    const healthStatus = { healthy: true };

    if (!healthStatus.healthy) {
      logger.error('Database health check failed', healthStatus);
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }

    // Add database status to request for logging
    req.databaseHealth = healthStatus;
    next();
  } catch (error) {
    logger.error('Database health check error:', error);
    return res.status(503).json({
      error: 'Database health check failed',
      message: 'Unable to verify database status',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Database performance monitoring middleware
 */
const databasePerformanceMonitor = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;

    // Log slow queries (> 1 second)
    if (responseTime > 1000) {
      logger.warn('Slow database operation detected', {
        method: req.method,
        url: req.url,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }

    // Add performance headers
    res.set('X-Response-Time', `${responseTime}ms`);
    res.set('X-Database-Status', req.databaseHealth?.healthy ? 'healthy' : 'unhealthy');

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Database error handling middleware
 */
const databaseErrorHandler = (error, req, res, next) => {
  // Check if it's a database-related error
  if (error.code && error.code.startsWith('PGRST')) {
    logger.error('Database error:', {
      code: error.code,
      message: error.message,
      method: req.method,
      url: req.url,
      userId: req.user?.id
    });

    // Map database errors to appropriate HTTP status codes
    let statusCode = 500;
    let userMessage = 'Database error occurred';

    switch (error.code) {
      case 'PGRST116': // No rows returned
        statusCode = 404;
        userMessage = 'Resource not found';
        break;
      case 'PGRST301': // Duplicate key
        statusCode = 409;
        userMessage = 'Resource already exists';
        break;
      case 'PGRST204': // Row Level Security violation
        statusCode = 403;
        userMessage = 'Access denied';
        break;
      default:
        statusCode = 500;
        userMessage = 'Database error occurred';
    }

    return res.status(statusCode).json({
      error: 'Database Error',
      message: userMessage,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }

  // Pass non-database errors to the next error handler
  next(error);
};

/**
 * Database connection retry middleware
 */
const databaseRetryMiddleware = async (req, res, next) => {
  const maxRetries = 3;
  let retryCount = 0;

  const attemptOperation = async () => {
    try {
      // Test database connection
      // await supabaseService.testConnection();
      await pool.query('SELECT 1');
      next();
    } catch (error) {
      retryCount++;

      if (retryCount < maxRetries) {
        logger.warn(`Database connection retry ${retryCount}/${maxRetries}`, {
          error: error.message,
          method: req.method,
          url: req.url
        });

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return attemptOperation();
      } else {
        logger.error('Database connection failed after all retries', {
          error: error.message,
          retries: retryCount,
          method: req.method,
          url: req.url
        });

        return res.status(503).json({
          error: 'Database Unavailable',
          message: 'Unable to connect to database after multiple attempts',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  await attemptOperation();
};

/**
 * Database metrics collection middleware
 */
const databaseMetricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to collect metrics
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;

    // Collect metrics (you can send these to your monitoring system)
    const metrics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      databaseHealthy: req.databaseHealth?.healthy || false,
      databaseResponseTime: req.databaseHealth?.responseTime || 0
    };

    // Log metrics for monitoring systems to collect
    logger.info('Database metrics', metrics);

    originalEnd.apply(this, args);
  };

  next();
};

module.exports = {
  databaseHealthCheck,
  databasePerformanceMonitor,
  databaseErrorHandler,
  databaseRetryMiddleware,
  databaseMetricsMiddleware
};
