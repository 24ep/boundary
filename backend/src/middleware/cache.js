const redis = require('redis');
const { promisify } = require('util');

// Create Redis client for caching
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

// Promisify Redis commands
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const existsAsync = promisify(redisClient.exists).bind(redisClient);
const keysAsync = promisify(redisClient.keys).bind(redisClient);

// Cache configuration
const cacheConfig = {
  // User data cache
  user: {
    prefix: 'user:',
    ttl: 300, // 5 minutes
  },
  
  // hourse data cache
  hourse: {
    prefix: 'hourse:',
    ttl: 600, // 10 minutes
  },
  
  // Location data cache
  location: {
    prefix: 'location:',
    ttl: 60, // 1 minute
  },
  
  // Chat data cache
  chat: {
    prefix: 'chat:',
    ttl: 300, // 5 minutes
  },
  
  // Subscription data cache
  subscription: {
    prefix: 'subscription:',
    ttl: 1800, // 30 minutes
  },
  
  // API response cache
  api: {
    prefix: 'api:',
    ttl: 300, // 5 minutes
  },
  
  // Session cache
  session: {
    prefix: 'session:',
    ttl: 3600, // 1 hour
  },
  
  // Rate limiting cache
  rateLimit: {
    prefix: 'rate_limit:',
    ttl: 900, // 15 minutes
  },
};

// Cache utility functions
const cacheUtils = {
  // Generate cache key
  generateKey: (type, identifier, additional = '') => {
    const config = cacheConfig[type];
    if (!config) {
      throw new Error(`Unknown cache type: ${type}`);
    }
    return `${config.prefix}${identifier}${additional ? `:${additional}` : ''}`;
  },

  // Set cache with TTL
  set: async (key, data, ttl = null) => {
    try {
      const serializedData = JSON.stringify(data);
      await setAsync(key, serializedData);
      
      if (ttl) {
        await expireAsync(key, ttl);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache data
  get: async (key) => {
    try {
      const data = await getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  delete: async (key) => {
    try {
      await delAsync(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await existsAsync(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Clear cache by pattern
  clearPattern: async (pattern) => {
    try {
      const keys = await keysAsync(pattern);
      if (keys.length > 0) {
        await delAsync(keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache clear pattern error:', error);
      return 0;
    }
  },

  // Get cache statistics
  getStats: async () => {
    try {
      const stats = {};
      
      for (const [type, config] of Object.entries(cacheConfig)) {
        const pattern = `${config.prefix}*`;
        const keys = await keysAsync(pattern);
        stats[type] = {
          count: keys.length,
          prefix: config.prefix,
          ttl: config.ttl,
        };
      }
      
      return stats;
    } catch (error) {
      console.error('Cache stats error:', error);
      return {};
    }
  },
};

// Cache middleware for API responses
const cacheMiddleware = (type, ttl = null) => {
  return async (req, res, next) => {
    try {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Skip caching for authenticated requests that need fresh data
      if (req.user && req.headers['cache-control'] === 'no-cache') {
        return next();
      }

      const config = cacheConfig[type];
      if (!config) {
        return next();
      }

      // Generate cache key based on request
      const cacheKey = cacheUtils.generateKey(
        type,
        req.user ? req.user.id : req.ip,
        req.originalUrl
      );

      // Try to get cached data
      const cachedData = await cacheUtils.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original send method
      const originalSend = res.json;

      // Override send method to cache response
      res.json = function(data) {
        // Cache the response
        const cacheTTL = ttl || config.ttl;
        cacheUtils.set(cacheKey, data, cacheTTL);

        // Call original send method
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// User data cache middleware
const userCache = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const cacheKey = cacheUtils.generateKey('user', req.user.id);
    const cachedUser = await cacheUtils.get(cacheKey);

    if (cachedUser) {
      req.cachedUser = cachedUser;
    }

    next();
  } catch (error) {
    console.error('User cache error:', error);
    next();
  }
};

// hourse data cache middleware
const familyCache = async (req, res, next) => {
  try {
    const familyId = req.params.familyId || req.body.familyId;
    if (!familyId) {
      return next();
    }

    const cacheKey = cacheUtils.generateKey('hourse', familyId);
    const cachedFamily = await cacheUtils.get(cacheKey);

    if (cachedFamily) {
      req.cachedFamily = cachedFamily;
    }

    next();
  } catch (error) {
    console.error('hourse cache error:', error);
    next();
  }
};

// Location cache middleware
const locationCache = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      return next();
    }

    const cacheKey = cacheUtils.generateKey('location', userId);
    const cachedLocation = await cacheUtils.get(cacheKey);

    if (cachedLocation) {
      req.cachedLocation = cachedLocation;
    }

    next();
  } catch (error) {
    console.error('Location cache error:', error);
    next();
  }
};

// Chat cache middleware
const chatCache = async (req, res, next) => {
  try {
    const chatId = req.params.chatId || req.body.chatId;
    if (!chatId) {
      return next();
    }

    const cacheKey = cacheUtils.generateKey('chat', chatId);
    const cachedChat = await cacheUtils.get(cacheKey);

    if (cachedChat) {
      req.cachedChat = cachedChat;
    }

    next();
  } catch (error) {
    console.error('Chat cache error:', error);
    next();
  }
};

// Subscription cache middleware
const subscriptionCache = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      return next();
    }

    const cacheKey = cacheUtils.generateKey('subscription', userId);
    const cachedSubscription = await cacheUtils.get(cacheKey);

    if (cachedSubscription) {
      req.cachedSubscription = cachedSubscription;
    }

    next();
  } catch (error) {
    console.error('Subscription cache error:', error);
    next();
  }
};

// Cache invalidation functions
const cacheInvalidation = {
  // Invalidate user cache
  invalidateUser: async (userId) => {
    const pattern = cacheUtils.generateKey('user', userId, '*');
    return await cacheUtils.clearPattern(pattern);
  },

  // Invalidate hourse cache
  invalidateFamily: async (familyId) => {
    const pattern = cacheUtils.generateKey('hourse', familyId, '*');
    return await cacheUtils.clearPattern(pattern);
  },

  // Invalidate location cache
  invalidateLocation: async (userId) => {
    const pattern = cacheUtils.generateKey('location', userId, '*');
    return await cacheUtils.clearPattern(pattern);
  },

  // Invalidate chat cache
  invalidateChat: async (chatId) => {
    const pattern = cacheUtils.generateKey('chat', chatId, '*');
    return await cacheUtils.clearPattern(pattern);
  },

  // Invalidate subscription cache
  invalidateSubscription: async (userId) => {
    const pattern = cacheUtils.generateKey('subscription', userId, '*');
    return await cacheUtils.clearPattern(pattern);
  },

  // Invalidate all user-related cache
  invalidateUserAll: async (userId) => {
    const patterns = [
      cacheUtils.generateKey('user', userId, '*'),
      cacheUtils.generateKey('location', userId, '*'),
      cacheUtils.generateKey('subscription', userId, '*'),
    ];

    let totalCleared = 0;
    for (const pattern of patterns) {
      totalCleared += await cacheUtils.clearPattern(pattern);
    }
    return totalCleared;
  },

  // Invalidate all hourse-related cache
  invalidateFamilyAll: async (familyId) => {
    const pattern = cacheUtils.generateKey('hourse', familyId, '*');
    return await cacheUtils.clearPattern(pattern);
  },

  // Clear all cache
  clearAll: async () => {
    try {
      await redisClient.flushall();
      return true;
    } catch (error) {
      console.error('Clear all cache error:', error);
      return false;
    }
  },
};

// Cache health check
const cacheHealthCheck = async () => {
  try {
    const testKey = 'health_check';
    const testData = { timestamp: Date.now() };
    
    // Test set
    await cacheUtils.set(testKey, testData, 60);
    
    // Test get
    const retrieved = await cacheUtils.get(testKey);
    
    // Test delete
    await cacheUtils.delete(testKey);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      test: retrieved && retrieved.timestamp === testData.timestamp,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

// Export cache utilities
module.exports = {
  redisClient,
  cacheConfig,
  cacheUtils,
  cacheMiddleware,
  userCache,
  familyCache,
  locationCache,
  chatCache,
  subscriptionCache,
  cacheInvalidation,
  cacheHealthCheck,
}; 