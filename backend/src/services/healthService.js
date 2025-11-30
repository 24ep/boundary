const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');

class HealthService {
  constructor() {
    this.healthChecks = {
      DATABASE: 'database',
      REDIS: 'redis',
      EXTERNAL_SERVICES: 'external_services',
      SYSTEM: 'system',
      CUSTOM: 'custom',
    };

    this.statusTypes = {
      HEALTHY: 'healthy',
      UNHEALTHY: 'unhealthy',
      DEGRADED: 'degraded',
      UNKNOWN: 'unknown',
    };

    this.redisClient = null;
    this.initializeRedis();
  }

  // Initialize Redis client
  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
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

      this.redisClient.on('error', (error) => {
        console.error('Redis client error:', error);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis client connected');
      });
    } catch (error) {
      console.error('Initialize Redis error:', error);
    }
  }

  // Perform comprehensive health check
  async performHealthCheck() {
    try {
      const startTime = Date.now();
      
      const checks = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkExternalServices(),
        this.checkSystemResources(),
        this.checkCustomServices(),
      ]);

      const duration = Date.now() - startTime;

      const results = checks.map((result, index) => {
        const checkNames = ['database', 'redis', 'external_services', 'system', 'custom'];
        return {
          name: checkNames[index],
          ...result,
        };
      });

      const overallStatus = this.determineOverallStatus(results);
      const healthyChecks = results.filter(r => r.status === 'fulfilled' && r.value?.status === this.statusTypes.HEALTHY).length;
      const totalChecks = results.length;

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        duration,
        checks: results,
        summary: {
          total: totalChecks,
          healthy: healthyChecks,
          unhealthy: totalChecks - healthyChecks,
          healthPercentage: Math.round((healthyChecks / totalChecks) * 100),
        },
      };
    } catch (error) {
      console.error('Perform health check error:', error);
      return {
        status: this.statusTypes.UNHEALTHY,
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: [],
        summary: {
          total: 0,
          healthy: 0,
          unhealthy: 0,
          healthPercentage: 0,
        },
      };
    }
  }

  // Check database health
  async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // Check connection status
      const connectionStatus = mongoose.connection.readyState;
      const isConnected = connectionStatus === 1;

      if (!isConnected) {
        return {
          status: this.statusTypes.UNHEALTHY,
          message: 'Database not connected',
          details: {
            readyState: connectionStatus,
            readyStateText: this.getReadyStateText(connectionStatus),
          },
          duration: Date.now() - startTime,
        };
      }

      // Test database operations
      const testStart = Date.now();
      await mongoose.connection.db.admin().ping();
      const pingDuration = Date.now() - testStart;

      // Get database stats
      const stats = await mongoose.connection.db.stats();

      return {
        status: this.statusTypes.HEALTHY,
        message: 'Database is healthy',
        details: {
          readyState: connectionStatus,
          readyStateText: this.getReadyStateText(connectionStatus),
          pingDuration,
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize,
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: this.statusTypes.UNHEALTHY,
        message: 'Database health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check Redis health
  async checkRedis() {
    try {
      const startTime = Date.now();

      if (!this.redisClient) {
        return {
          status: this.statusTypes.UNHEALTHY,
          message: 'Redis client not initialized',
          duration: Date.now() - startTime,
        };
      }

      // Test Redis connection
      const ping = promisify(this.redisClient.ping).bind(this.redisClient);
      const testStart = Date.now();
      const pong = await ping();
      const pingDuration = Date.now() - testStart;

      if (pong !== 'PONG') {
        return {
          status: this.statusTypes.UNHEALTHY,
          message: 'Redis ping failed',
          details: { response: pong },
          duration: Date.now() - startTime,
        };
      }

      // Get Redis info
      const info = promisify(this.redisClient.info).bind(this.redisClient);
      const redisInfo = await info();

      return {
        status: this.statusTypes.HEALTHY,
        message: 'Redis is healthy',
        details: {
          pingDuration,
          info: this.parseRedisInfo(redisInfo),
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: this.statusTypes.UNHEALTHY,
        message: 'Redis health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check external services
  async checkExternalServices() {
    try {
      const startTime = Date.now();
      const checks = [];

      // Check Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
          const testStart = Date.now();
          await stripe.paymentMethods.list({ limit: 1 });
          const duration = Date.now() - testStart;
          
          checks.push({
            name: 'stripe',
            status: this.statusTypes.HEALTHY,
            duration,
          });
        } catch (error) {
          checks.push({
            name: 'stripe',
            status: this.statusTypes.UNHEALTHY,
            error: error.message,
          });
        }
      }

      // Check Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const testStart = Date.now();
          await twilio.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
          const duration = Date.now() - testStart;
          
          checks.push({
            name: 'twilio',
            status: this.statusTypes.HEALTHY,
            duration,
          });
        } catch (error) {
          checks.push({
            name: 'twilio',
            status: this.statusTypes.UNHEALTHY,
            error: error.message,
          });
        }
      }

      // Check AWS S3
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        try {
          const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
          const s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
          });
          const testStart = Date.now();
          await s3Client.send(new ListBucketsCommand({}));
          const duration = Date.now() - testStart;
          
          checks.push({
            name: 'aws_s3',
            status: this.statusTypes.HEALTHY,
            duration,
          });
        } catch (error) {
          checks.push({
            name: 'aws_s3',
            status: this.statusTypes.UNHEALTHY,
            error: error.message,
          });
        }
      }

      // Check Firebase
      if (process.env.FIREBASE_PROJECT_ID) {
        try {
          const admin = require('firebase-admin');
          const testStart = Date.now();
          await admin.app().options;
          const duration = Date.now() - testStart;
          
          checks.push({
            name: 'firebase',
            status: this.statusTypes.HEALTHY,
            duration,
          });
        } catch (error) {
          checks.push({
            name: 'firebase',
            status: this.statusTypes.UNHEALTHY,
            error: error.message,
          });
        }
      }

      const healthyChecks = checks.filter(c => c.status === this.statusTypes.HEALTHY).length;
      const overallStatus = healthyChecks === checks.length ? this.statusTypes.HEALTHY : 
                           healthyChecks > 0 ? this.statusTypes.DEGRADED : this.statusTypes.UNHEALTHY;

      return {
        status: overallStatus,
        message: `External services: ${healthyChecks}/${checks.length} healthy`,
        details: { checks },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: this.statusTypes.UNHEALTHY,
        message: 'External services health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check system resources
  async checkSystemResources() {
    try {
      const startTime = Date.now();

      const os = require('os');
      const process = require('process');

      // Get system metrics
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsage = (usedMemory / totalMemory) * 100;

      const cpuUsage = os.loadavg();
      const uptime = os.uptime();
      const processUptime = process.uptime();

      // Determine memory status
      let memoryStatus = this.statusTypes.HEALTHY;
      if (memoryUsage > 90) {
        memoryStatus = this.statusTypes.UNHEALTHY;
      } else if (memoryUsage > 80) {
        memoryStatus = this.statusTypes.DEGRADED;
      }

      // Determine CPU status
      let cpuStatus = this.statusTypes.HEALTHY;
      const cpuLoad = cpuUsage[0]; // 1-minute load average
      const cpuCores = os.cpus().length;
      const cpuUsagePercent = (cpuLoad / cpuCores) * 100;

      if (cpuUsagePercent > 90) {
        cpuStatus = this.statusTypes.UNHEALTHY;
      } else if (cpuUsagePercent > 70) {
        cpuStatus = this.statusTypes.DEGRADED;
      }

      const overallStatus = memoryStatus === this.statusTypes.HEALTHY && cpuStatus === this.statusTypes.HEALTHY ?
                           this.statusTypes.HEALTHY : this.statusTypes.DEGRADED;

      return {
        status: overallStatus,
        message: 'System resources check completed',
        details: {
          memory: {
            status: memoryStatus,
            total: totalMemory,
            used: usedMemory,
            free: freeMemory,
            usagePercent: Math.round(memoryUsage * 100) / 100,
          },
          cpu: {
            status: cpuStatus,
            loadAverage: cpuUsage,
            cores: cpuCores,
            usagePercent: Math.round(cpuUsagePercent * 100) / 100,
          },
          uptime: {
            system: uptime,
            process: processUptime,
          },
          platform: {
            type: os.type(),
            release: os.release(),
            arch: os.arch(),
            nodeVersion: process.version,
          },
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: this.statusTypes.UNHEALTHY,
        message: 'System resources check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Check custom services
  async checkCustomServices() {
    try {
      const startTime = Date.now();
      const checks = [];

      // Check if all required environment variables are set
      const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'NODE_ENV',
      ];

      const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingEnvVars.length > 0) {
        checks.push({
          name: 'environment_variables',
          status: this.statusTypes.UNHEALTHY,
          error: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        });
      } else {
        checks.push({
          name: 'environment_variables',
          status: this.statusTypes.HEALTHY,
        });
      }

      // Check application-specific services
      // Add your custom health checks here

      const healthyChecks = checks.filter(c => c.status === this.statusTypes.HEALTHY).length;
      const overallStatus = healthyChecks === checks.length ? this.statusTypes.HEALTHY : this.statusTypes.UNHEALTHY;

      return {
        status: overallStatus,
        message: `Custom services: ${healthyChecks}/${checks.length} healthy`,
        details: { checks },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: this.statusTypes.UNHEALTHY,
        message: 'Custom services health check failed',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Determine overall status
  determineOverallStatus(results) {
    const healthyCount = results.filter(r => 
      r.status === 'fulfilled' && r.value?.status === this.statusTypes.HEALTHY
    ).length;

    const unhealthyCount = results.filter(r => 
      r.status === 'rejected' || r.value?.status === this.statusTypes.UNHEALTHY
    ).length;

    const degradedCount = results.filter(r => 
      r.status === 'fulfilled' && r.value?.status === this.statusTypes.DEGRADED
    ).length;

    if (unhealthyCount > 0) {
      return this.statusTypes.UNHEALTHY;
    } else if (degradedCount > 0) {
      return this.statusTypes.DEGRADED;
    } else if (healthyCount === results.length) {
      return this.statusTypes.HEALTHY;
    } else {
      return this.statusTypes.UNKNOWN;
    }
  }

  // Get MongoDB ready state text
  getReadyStateText(readyState) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[readyState] || 'unknown';
  }

  // Parse Redis info
  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const parsed = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    }

    return {
      version: parsed.redis_version,
      uptime: parsed.uptime_in_seconds,
      connectedClients: parsed.connected_clients,
      usedMemory: parsed.used_memory_human,
      totalCommands: parsed.total_commands_processed,
    };
  }

  // Get detailed health report
  async getDetailedHealthReport() {
    try {
      const healthCheck = await this.performHealthCheck();
      
      // Add additional metrics
      const additionalMetrics = {
        application: {
          version: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        dependencies: {
          node: process.version,
          mongoose: require('mongoose').version,
          express: require('express').version,
        },
        timestamp: new Date().toISOString(),
      };

      return {
        ...healthCheck,
        additionalMetrics,
      };
    } catch (error) {
      console.error('Get detailed health report error:', error);
      throw error;
    }
  }

  // Register custom health check
  registerCustomHealthCheck(name, checkFunction) {
    if (typeof checkFunction !== 'function') {
      throw new Error('Check function must be a function');
    }

    this.customChecks = this.customChecks || {};
    this.customChecks[name] = checkFunction;

    console.log(`✅ Custom health check "${name}" registered`);
  }

  // Unregister custom health check
  unregisterCustomHealthCheck(name) {
    if (this.customChecks && this.customChecks[name]) {
      delete this.customChecks[name];
      console.log(`✅ Custom health check "${name}" unregistered`);
    }
  }

  // Get health check history
  async getHealthCheckHistory(limit = 10) {
    try {
      // This would typically be stored in a database
      // For now, we'll return a mock history
      return [];
    } catch (error) {
      console.error('Get health check history error:', error);
      return [];
    }
  }

  // Set health check interval
  setHealthCheckInterval(intervalMs = 60000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck();
        console.log(`Health check: ${healthCheck.status} (${healthCheck.summary.healthPercentage}% healthy)`);
        
        // Store health check result
        await this.storeHealthCheckResult(healthCheck);
      } catch (error) {
        console.error('Scheduled health check error:', error);
      }
    }, intervalMs);

    console.log(`✅ Health check interval set to ${intervalMs}ms`);
  }

  // Store health check result
  async storeHealthCheckResult(result) {
    try {
      // This would typically be stored in a database
      // For now, we'll just log it
      console.log('Health check result stored:', result.timestamp);
    } catch (error) {
      console.error('Store health check result error:', error);
    }
  }

  // Stop health check interval
  stopHealthCheckInterval() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('✅ Health check interval stopped');
    }
  }
}

module.exports = new HealthService(); 