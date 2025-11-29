const cron = require('node-cron');
const User = require('../models/User');
const hourse = require('../models/hourse');
const Subscription = require('../models/Subscription');
const EmergencyAlert = require('../models/EmergencyAlert');
const SafetyCheck = require('../models/SafetyCheck');
const Message = require('../models/Message');
const notificationService = require('./notificationService');
const backupService = require('./backupService');
const databaseService = require('./databaseService');
const healthService = require('./healthService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.scheduledTasks = new Map();
    this.isInitialized = false;
  }

  // Initialize scheduler
  async initialize() {
    try {
      console.log('🔄 Initializing scheduler service...');

      // Register default jobs
      await this.registerDefaultJobs();

      // Start all jobs
      await this.startAllJobs();

      this.isInitialized = true;
      console.log('✅ Scheduler service initialized successfully');
    } catch (error) {
      console.error('❌ Scheduler initialization failed:', error);
      throw error;
    }
  }

  // Register default jobs
  async registerDefaultJobs() {
    try {
      // Daily cleanup job
      this.registerJob('daily-cleanup', '0 2 * * *', async () => {
        await this.performDailyCleanup();
      });

      // Weekly backup job
      this.registerJob('weekly-backup', '0 3 * * 0', async () => {
        await this.performWeeklyBackup();
      });

      // Health check job
      this.registerJob('health-check', '*/5 * * * *', async () => {
        await this.performHealthCheck();
      });

      // Subscription check job
      this.registerJob('subscription-check', '0 6 * * *', async () => {
        await this.checkSubscriptions();
      });

      // Safety check reminder job
      this.registerJob('safety-reminder', '0 9 * * *', async () => {
        await this.sendSafetyReminders();
      });

      // Database maintenance job
      this.registerJob('db-maintenance', '0 4 * * 0', async () => {
        await this.performDatabaseMaintenance();
      });

      // Analytics job
      this.registerJob('analytics', '0 1 * * *', async () => {
        await this.generateDailyAnalytics();
      });

      // Cache cleanup job
      this.registerJob('cache-cleanup', '0 */6 * * *', async () => {
        await this.cleanupCache();
      });

      // Email digest job
      this.registerJob('email-digest', '0 8 * * *', async () => {
        await this.sendEmailDigest();
      });

      // System monitoring job
      this.registerJob('system-monitoring', '*/2 * * * *', async () => {
        await this.monitorSystem();
      });

      console.log('✅ Default jobs registered');
    } catch (error) {
      console.error('❌ Register default jobs error:', error);
      throw error;
    }
  }

  // Register a new job
  registerJob(name, schedule, task, options = {}) {
    try {
      if (this.jobs.has(name)) {
        console.warn(`⚠️ Job "${name}" already exists, stopping previous instance`);
        this.stopJob(name);
      }

      const job = {
        name,
        schedule,
        task,
        options,
        cronJob: null,
        isRunning: false,
        lastRun: null,
        nextRun: null,
        runCount: 0,
        errorCount: 0,
        createdAt: new Date(),
      };

      this.jobs.set(name, job);
      console.log(`✅ Job "${name}" registered with schedule: ${schedule}`);

      return job;
    } catch (error) {
      console.error(`❌ Register job "${name}" error:`, error);
      throw error;
    }
  }

  // Start a specific job
  startJob(name) {
    try {
      const job = this.jobs.get(name);
      if (!job) {
        throw new Error(`Job "${name}" not found`);
      }

      if (job.cronJob) {
        console.warn(`⚠️ Job "${name}" is already running`);
        return job;
      }

      job.cronJob = cron.schedule(job.schedule, async () => {
        await this.executeJob(job);
      }, {
        scheduled: false,
        timezone: process.env.TZ || 'UTC',
        ...job.options,
      });

      job.cronJob.start();
      job.isRunning = true;
      job.nextRun = job.cronJob.nextDate().toDate();

      console.log(`✅ Job "${name}" started`);
      return job;
    } catch (error) {
      console.error(`❌ Start job "${name}" error:`, error);
      throw error;
    }
  }

  // Stop a specific job
  stopJob(name) {
    try {
      const job = this.jobs.get(name);
      if (!job) {
        throw new Error(`Job "${name}" not found`);
      }

      if (job.cronJob) {
        job.cronJob.stop();
        job.cronJob = null;
        job.isRunning = false;
        job.nextRun = null;
      }

      console.log(`✅ Job "${name}" stopped`);
      return job;
    } catch (error) {
      console.error(`❌ Stop job "${name}" error:`, error);
      throw error;
    }
  }

  // Start all jobs
  async startAllJobs() {
    try {
      console.log('🔄 Starting all scheduled jobs...');

      for (const [name, job] of this.jobs) {
        try {
          await this.startJob(name);
        } catch (error) {
          console.error(`❌ Failed to start job "${name}":`, error);
        }
      }

      console.log(`✅ Started ${this.jobs.size} jobs`);
    } catch (error) {
      console.error('❌ Start all jobs error:', error);
      throw error;
    }
  }

  // Stop all jobs
  async stopAllJobs() {
    try {
      console.log('🔄 Stopping all scheduled jobs...');

      for (const [name, job] of this.jobs) {
        try {
          this.stopJob(name);
        } catch (error) {
          console.error(`❌ Failed to stop job "${name}":`, error);
        }
      }

      console.log(`✅ Stopped ${this.jobs.size} jobs`);
    } catch (error) {
      console.error('❌ Stop all jobs error:', error);
      throw error;
    }
  }

  // Execute a job
  async executeJob(job) {
    try {
      job.isRunning = true;
      job.lastRun = new Date();
      job.runCount++;

      console.log(`🔄 Executing job: ${job.name}`);

      await job.task();

      console.log(`✅ Job "${job.name}" completed successfully`);
    } catch (error) {
      job.errorCount++;
      console.error(`❌ Job "${job.name}" failed:`, error);

      // Send error notification if configured
      if (job.options.notifyOnError !== false) {
        await this.notifyJobError(job, error);
      }
    } finally {
      job.isRunning = false;
      job.nextRun = job.cronJob ? job.cronJob.nextDate().toDate() : null;
    }
  }

  // Get job status
  getJobStatus(name) {
    const job = this.jobs.get(name);
    if (!job) {
      return null;
    }

    return {
      name: job.name,
      schedule: job.schedule,
      isRunning: job.isRunning,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      runCount: job.runCount,
      errorCount: job.errorCount,
      createdAt: job.createdAt,
    };
  }

  // Get all jobs status
  getAllJobsStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = this.getJobStatus(name);
    }
    return status;
  }

  // Perform daily cleanup
  async performDailyCleanup() {
    try {
      console.log('🧹 Performing daily cleanup...');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Clean up old emergency alerts
      const deletedAlerts = await EmergencyAlert.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
        status: { $in: ['resolved', 'cancelled'] },
      });

      // Clean up old safety checks
      const deletedSafetyChecks = await SafetyCheck.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
        status: { $in: ['expired', 'ignored'] },
      });

      // Clean up old location data
      const deletedLocations = await Location.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
      });

      // Clean up old messages
      const deletedMessages = await Message.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
        type: { $in: ['text', 'image'] },
      });

      console.log('✅ Daily cleanup completed:', {
        deletedAlerts: deletedAlerts.deletedCount,
        deletedSafetyChecks: deletedSafetyChecks.deletedCount,
        deletedLocations: deletedLocations.deletedCount,
        deletedMessages: deletedMessages.deletedCount,
      });
    } catch (error) {
      console.error('❌ Daily cleanup error:', error);
      throw error;
    }
  }

  // Perform weekly backup
  async performWeeklyBackup() {
    try {
      console.log('💾 Performing weekly backup...');

      const backup = await backupService.createFullBackup({
        includeFiles: true,
        includeMedia: true,
        compression: true,
      });

      console.log('✅ Weekly backup completed:', backup);
    } catch (error) {
      console.error('❌ Weekly backup error:', error);
      throw error;
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      console.log('🏥 Performing health check...');

      const health = await healthService.performHealthCheck();

      if (health.status === 'unhealthy') {
        console.warn('⚠️ System health check failed:', health);
        // Send alert to administrators
        await this.sendHealthAlert(health);
      }

      console.log('✅ Health check completed:', health.status);
    } catch (error) {
      console.error('❌ Health check error:', error);
      throw error;
    }
  }

  // Check subscriptions
  async checkSubscriptions() {
    try {
      console.log('💳 Checking subscriptions...');

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Find subscriptions expiring soon
      const expiringSubscriptions = await Subscription.find({
        status: { $in: ['active', 'trialing'] },
        currentPeriodEnd: { $lte: sevenDaysFromNow },
      }).populate('user');

      // Send expiration reminders
      for (const subscription of expiringSubscriptions) {
        await this.sendSubscriptionReminder(subscription);
      }

      // Find expired subscriptions
      const expiredSubscriptions = await Subscription.find({
        status: { $in: ['active', 'trialing'] },
        currentPeriodEnd: { $lt: now },
      }).populate('user');

      // Handle expired subscriptions
      for (const subscription of expiredSubscriptions) {
        await this.handleExpiredSubscription(subscription);
      }

      console.log('✅ Subscription check completed:', {
        expiring: expiringSubscriptions.length,
        expired: expiredSubscriptions.length,
      });
    } catch (error) {
      console.error('❌ Subscription check error:', error);
      throw error;
    }
  }

  // Send safety reminders
  async sendSafetyReminders() {
    try {
      console.log('👋 Sending safety reminders...');

      // Find users who haven't been active recently
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const inactiveUsers = await User.find({
        lastActiveAt: { $lt: threeDaysAgo },
        status: 'active',
      });

      // Send safety check reminders
      for (const user of inactiveUsers) {
        await this.sendSafetyReminder(user);
      }

      console.log('✅ Safety reminders sent:', inactiveUsers.length);
    } catch (error) {
      console.error('❌ Safety reminders error:', error);
      throw error;
    }
  }

  // Perform database maintenance
  async performDatabaseMaintenance() {
    try {
      console.log('🔧 Performing database maintenance...');

      // Optimize database
      await databaseService.optimize();

      // Clean up expired data
      await databaseService.cleanup();

      console.log('✅ Database maintenance completed');
    } catch (error) {
      console.error('❌ Database maintenance error:', error);
      throw error;
    }
  }

  // Generate daily analytics
  async generateDailyAnalytics() {
    try {
      console.log('📊 Generating daily analytics...');

      const analyticsService = require('./analyticsService');
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Generate various analytics reports
      const userAnalytics = await analyticsService.getUserAnalytics(yesterday, new Date());
      const familyAnalytics = await analyticsService.getFamilyAnalytics(yesterday, new Date());
      const subscriptionAnalytics = await analyticsService.getSubscriptionAnalytics(yesterday, new Date());
      const safetyAnalytics = await analyticsService.getSafetyAnalytics(yesterday, new Date());

      // Store analytics data
      await this.storeAnalyticsData({
        date: yesterday,
        userAnalytics,
        familyAnalytics,
        subscriptionAnalytics,
        safetyAnalytics,
      });

      console.log('✅ Daily analytics generated');
    } catch (error) {
      console.error('❌ Generate daily analytics error:', error);
      throw error;
    }
  }

  // Cleanup cache
  async cleanupCache() {
    try {
      console.log('🗑️ Cleaning up cache...');

      // This would typically involve cleaning up Redis cache
      // For now, we'll just log the action
      console.log('✅ Cache cleanup completed');
    } catch (error) {
      console.error('❌ Cache cleanup error:', error);
      throw error;
    }
  }

  // Send email digest
  async sendEmailDigest() {
    try {
      console.log('📧 Sending email digest...');

      // Find users who want daily digest
      const users = await User.find({
        'preferences.emailDigest': true,
        status: 'active',
      });

      // Generate and send digest for each user
      for (const user of users) {
        await this.generateAndSendDigest(user);
      }

      console.log('✅ Email digest sent:', users.length);
    } catch (error) {
      console.error('❌ Email digest error:', error);
      throw error;
    }
  }

  // Monitor system
  async monitorSystem() {
    try {
      console.log('📈 Monitoring system...');

      // Check system resources
      const systemHealth = await healthService.checkSystemResources();

      // Check database performance
      const dbPerformance = await databaseService.getPerformanceMetrics();

      // Log system metrics
      console.log('System metrics:', {
        memory: systemHealth.details.memory.usagePercent,
        cpu: systemHealth.details.cpu.usagePercent,
        uptime: systemHealth.details.uptime,
      });

      // Alert if system is under stress
      if (systemHealth.status === 'unhealthy') {
        await this.sendSystemAlert(systemHealth);
      }
    } catch (error) {
      console.error('❌ System monitoring error:', error);
      throw error;
    }
  }

  // Helper methods
  async notifyJobError(job, error) {
    try {
      // Send notification to administrators
      const adminUsers = await User.find({ role: 'admin' });
      
      for (const admin of adminUsers) {
        await notificationService.sendEmailNotifications([admin], 'job-error', {
          jobName: job.name,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (notifyError) {
      console.error('❌ Job error notification failed:', notifyError);
    }
  }

  async sendHealthAlert(health) {
    try {
      const adminUsers = await User.find({ role: 'admin' });
      
      for (const admin of adminUsers) {
        await notificationService.sendEmailNotifications([admin], 'health-alert', {
          health,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('❌ Health alert error:', error);
    }
  }

  async sendSubscriptionReminder(subscription) {
    try {
      await notificationService.sendSubscriptionNotification(
        subscription.user,
        subscription,
        'expiring'
      );
    } catch (error) {
      console.error('❌ Subscription reminder error:', error);
    }
  }

  async handleExpiredSubscription(subscription) {
    try {
      // Update subscription status
      subscription.status = 'past_due';
      await subscription.save();

      // Send notification
      await notificationService.sendSubscriptionNotification(
        subscription.user,
        subscription,
        'expired'
      );
    } catch (error) {
      console.error('❌ Handle expired subscription error:', error);
    }
  }

  async sendSafetyReminder(user) {
    try {
      await notificationService.sendEmailNotifications([user], 'safety-reminder', {
        user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Safety reminder error:', error);
    }
  }

  async storeAnalyticsData(data) {
    try {
      // This would typically store analytics data in a database
      console.log('Analytics data stored for:', data.date);
    } catch (error) {
      console.error('❌ Store analytics data error:', error);
    }
  }

  async generateAndSendDigest(user) {
    try {
      // Generate digest content
      const digest = await this.generateDigestContent(user);

      // Send digest email
      await notificationService.sendEmailNotifications([user], 'daily-digest', {
        user,
        digest,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Generate and send digest error:', error);
    }
  }

  async generateDigestContent(user) {
    try {
      // Generate digest content based on user activity
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const digest = {
        newMessages: 0,
        newAlerts: 0,
        familyUpdates: 0,
        locationUpdates: 0,
      };

      // Count new messages
      const newMessages = await Message.countDocuments({
        chat: { $in: await this.getUserChats(user._id) },
        createdAt: { $gte: yesterday },
        sender: { $ne: user._id },
      });
      digest.newMessages = newMessages;

      // Count new alerts
      const newAlerts = await EmergencyAlert.countDocuments({
        hourse: user.hourse,
        createdAt: { $gte: yesterday },
        user: { $ne: user._id },
      });
      digest.newAlerts = newAlerts;

      return digest;
    } catch (error) {
      console.error('❌ Generate digest content error:', error);
      return {};
    }
  }

  async getUserChats(userId) {
    try {
      const chats = await Chat.find({
        participants: userId,
      }).select('_id');
      return chats.map(chat => chat._id);
    } catch (error) {
      console.error('❌ Get user chats error:', error);
      return [];
    }
  }

  async sendSystemAlert(systemHealth) {
    try {
      const adminUsers = await User.find({ role: 'admin' });
      
      for (const admin of adminUsers) {
        await notificationService.sendEmailNotifications([admin], 'system-alert', {
          systemHealth,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('❌ System alert error:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      totalJobs: this.jobs.size,
      runningJobs: Array.from(this.jobs.values()).filter(job => job.isRunning).length,
      jobs: this.getAllJobsStatus(),
    };
  }

  // Shutdown scheduler
  async shutdown() {
    try {
      console.log('🔄 Shutting down scheduler...');
      await this.stopAllJobs();
      console.log('✅ Scheduler shutdown completed');
    } catch (error) {
      console.error('❌ Scheduler shutdown error:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService(); 