const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Create Redis client for rate limiting
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

// General API rate limiter
const generalLimiter = rateLimit({
	store: new RedisStore({
		client: redisClient,
		prefix: 'rate_limit:general:',
	}),
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: process.env.NODE_ENV === 'production' ? 100 : 1000000,
	message: {
		error: 'Too many requests from this IP, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: 'Too many requests from this IP, please try again later.',
			retryAfter: Math.ceil(15 * 60 / 1000), // seconds
		});
	},
});

// Authentication rate limiter (more strict)
const authLimiter = rateLimit({
	store: new RedisStore({
		client: redisClient,
		prefix: 'rate_limit:auth:',
	}),
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: process.env.NODE_ENV === 'production' ? 5 : 1000000,
	message: {
		error: 'Too many authentication attempts, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: 'Too many authentication attempts, please try again later.',
			retryAfter: Math.ceil(15 * 60 / 1000), // seconds
		});
	},
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:password_reset:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset attempts, please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000), // seconds
    });
  },
});

// Email verification rate limiter
const emailVerificationLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:email_verification:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 email verification requests per hour
  message: {
    error: 'Too many email verification attempts, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many email verification attempts, please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000), // seconds
    });
  },
});

// File upload rate limiter
const fileUploadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:file_upload:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 file uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many file uploads, please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000), // seconds
    });
  },
});

// Emergency alert rate limiter
const emergencyAlertLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:emergency_alert:',
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each user to 3 emergency alerts per 5 minutes
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  message: {
    error: 'Too many emergency alerts, please wait before sending another.',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many emergency alerts, please wait before sending another.',
      retryAfter: Math.ceil(5 * 60 / 1000), // seconds
    });
  },
});

// Safety check rate limiter
const safetyCheckLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:safety_check:',
  }),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limit each user to 10 safety checks per 10 minutes
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  message: {
    error: 'Too many safety check requests, please wait before sending another.',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many safety check requests, please wait before sending another.',
      retryAfter: Math.ceil(10 * 60 / 1000), // seconds
    });
  },
});

// Message rate limiter
const messageLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:message:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 messages per minute
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  message: {
    error: 'Too many messages, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many messages, please slow down.',
      retryAfter: Math.ceil(60 / 1000), // seconds
    });
  },
});

// Location update rate limiter
const locationUpdateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:location:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each user to 60 location updates per minute
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  message: {
    error: 'Too many location updates, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many location updates, please slow down.',
      retryAfter: Math.ceil(60 / 1000), // seconds
    });
  },
});

// Admin API rate limiter
const adminLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:admin:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each admin to 1000 requests per 15 minutes
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  message: {
    error: 'Too many admin requests, please slow down.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many admin requests, please slow down.',
      retryAfter: Math.ceil(15 * 60 / 1000), // seconds
    });
  },
});

// Webhook rate limiter
const webhookLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:webhook:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 webhook requests per minute
  message: {
    error: 'Too many webhook requests, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many webhook requests, please slow down.',
      retryAfter: Math.ceil(60 / 1000), // seconds
    });
  },
});

// Dynamic rate limiter based on user subscription
const dynamicLimiter = (req, res, next) => {
  // Get user's subscription limits
  const getUserLimits = async (userId) => {
    try {
      const Subscription = require('../models/Subscription');
      const subscription = await Subscription.findOne({
        user: userId,
        status: { $in: ['active', 'trialing'] },
      });

      if (!subscription) {
        return {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
        };
      }

      // Set limits based on subscription plan
      switch (subscription.plan.id) {
        case 'plan_free':
          return {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
          };
        case 'plan_basic':
          return {
            requestsPerMinute: 120,
            requestsPerHour: 5000,
            requestsPerDay: 50000,
          };
        case 'plan_premium':
          return {
            requestsPerMinute: 300,
            requestsPerHour: 15000,
            requestsPerDay: 150000,
          };
        case 'plan_enterprise':
          return {
            requestsPerMinute: 1000,
            requestsPerHour: 50000,
            requestsPerDay: 500000,
          };
        default:
          return {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
          };
      }
    } catch (error) {
      console.error('Error getting user limits:', error);
      return {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      };
    }
  };

  // Apply dynamic rate limiting
  const applyDynamicLimit = async () => {
    if (!req.user) {
      return next();
    }

    const limits = await getUserLimits(req.user.id);
    
    // Check minute limit
    const minuteKey = `dynamic:minute:${req.user.id}`;
    const minuteCount = await redisClient.incr(minuteKey);
    if (minuteCount === 1) {
      await redisClient.expire(minuteKey, 60);
    }
    
    if (minuteCount > limits.requestsPerMinute) {
      return res.status(429).json({
        error: 'Rate limit exceeded for this minute.',
        retryAfter: 60,
      });
    }

    // Check hour limit
    const hourKey = `dynamic:hour:${req.user.id}`;
    const hourCount = await redisClient.incr(hourKey);
    if (hourCount === 1) {
      await redisClient.expire(hourKey, 3600);
    }
    
    if (hourCount > limits.requestsPerHour) {
      return res.status(429).json({
        error: 'Rate limit exceeded for this hour.',
        retryAfter: 3600,
      });
    }

    // Check day limit
    const dayKey = `dynamic:day:${req.user.id}`;
    const dayCount = await redisClient.incr(dayKey);
    if (dayCount === 1) {
      await redisClient.expire(dayKey, 86400);
    }
    
    if (dayCount > limits.requestsPerDay) {
      return res.status(429).json({
        error: 'Rate limit exceeded for this day.',
        retryAfter: 86400,
      });
    }

    next();
  };

  applyDynamicLimit().catch(next);
};

// Rate limiter middleware for specific routes
const applyRateLimiters = (app) => {
  // Apply general limiter to all routes
  app.use(generalLimiter);

  // Apply specific limiters to routes
  app.use('/api/auth', authLimiter);
  app.use('/api/auth/forgot-password', passwordResetLimiter);
  app.use('/api/auth/verify-email', emailVerificationLimiter);
  app.use('/api/upload', fileUploadLimiter);
  app.use('/api/safety/emergency', emergencyAlertLimiter);
  app.use('/api/safety/check', safetyCheckLimiter);
  app.use('/api/chat', messageLimiter);
  app.use('/api/location', locationUpdateLimiter);
  app.use('/api/admin', adminLimiter);
  app.use('/api/webhooks', webhookLimiter);

  // Apply dynamic limiter to authenticated routes
  app.use('/api', dynamicLimiter);
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  fileUploadLimiter,
  emergencyAlertLimiter,
  safetyCheckLimiter,
  messageLimiter,
  locationUpdateLimiter,
  adminLimiter,
  webhookLimiter,
  dynamicLimiter,
  applyRateLimiters,
}; 