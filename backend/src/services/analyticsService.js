const User = require('../models/User');
const hourse = require('../models/hourse');
const Subscription = require('../models/Subscription');
const EmergencyAlert = require('../models/EmergencyAlert');
const SafetyCheck = require('../models/SafetyCheck');
const Message = require('../models/Message');
const Location = require('../models/Location');

class AnalyticsService {
  constructor() {
    this.metrics = {
      USER: 'user',
      hourse: 'hourse',
      SUBSCRIPTION: 'subscription',
      SAFETY: 'safety',
      COMMUNICATION: 'communication',
      LOCATION: 'location',
      PERFORMANCE: 'performance',
      BUSINESS: 'business',
    };
  }

  // User analytics
  async getUserAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        totalUsers,
        activeUsers,
        newUsers,
        userGrowth,
        userRetention,
        userEngagement,
        userDemographics,
        userActivity,
      ] = await Promise.all([
        this.getTotalUsers(query),
        this.getActiveUsers(query),
        this.getNewUsers(query),
        this.getUserGrowth(query),
        this.getUserRetention(query),
        this.getUserEngagement(query),
        this.getUserDemographics(query),
        this.getUserActivity(query),
      ]);

      return {
        totalUsers,
        activeUsers,
        newUsers,
        userGrowth,
        userRetention,
        userEngagement,
        userDemographics,
        userActivity,
      };
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  }

  // hourse analytics
  async getFamilyAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        totalFamilies,
        activeFamilies,
        newFamilies,
        familySize,
        familyEngagement,
        familyActivity,
      ] = await Promise.all([
        this.getTotalFamilies(query),
        this.getActiveFamilies(query),
        this.getNewFamilies(query),
        this.getFamilySize(query),
        this.getFamilyEngagement(query),
        this.getFamilyActivity(query),
      ]);

      return {
        totalFamilies,
        activeFamilies,
        newFamilies,
        familySize,
        familyEngagement,
        familyActivity,
      };
    } catch (error) {
      console.error('Get hourse analytics error:', error);
      throw error;
    }
  }

  // Subscription analytics
  async getSubscriptionAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        totalSubscriptions,
        activeSubscriptions,
        revenue,
        subscriptionGrowth,
        churnRate,
        planDistribution,
        paymentMetrics,
      ] = await Promise.all([
        this.getTotalSubscriptions(query),
        this.getActiveSubscriptions(query),
        this.getRevenue(query),
        this.getSubscriptionGrowth(query),
        this.getChurnRate(query),
        this.getPlanDistribution(query),
        this.getPaymentMetrics(query),
      ]);

      return {
        totalSubscriptions,
        activeSubscriptions,
        revenue,
        subscriptionGrowth,
        churnRate,
        planDistribution,
        paymentMetrics,
      };
    } catch (error) {
      console.error('Get subscription analytics error:', error);
      throw error;
    }
  }

  // Safety analytics
  async getSafetyAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        emergencyAlerts,
        safetyChecks,
        responseTimes,
        alertTypes,
        safetyMetrics,
      ] = await Promise.all([
        this.getEmergencyAlerts(query),
        this.getSafetyChecks(query),
        this.getResponseTimes(query),
        this.getAlertTypes(query),
        this.getSafetyMetrics(query),
      ]);

      return {
        emergencyAlerts,
        safetyChecks,
        responseTimes,
        alertTypes,
        safetyMetrics,
      };
    } catch (error) {
      console.error('Get safety analytics error:', error);
      throw error;
    }
  }

  // Communication analytics
  async getCommunicationAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        totalMessages,
        messageTypes,
        chatActivity,
        communicationMetrics,
      ] = await Promise.all([
        this.getTotalMessages(query),
        this.getMessageTypes(query),
        this.getChatActivity(query),
        this.getCommunicationMetrics(query),
      ]);

      return {
        totalMessages,
        messageTypes,
        chatActivity,
        communicationMetrics,
      };
    } catch (error) {
      console.error('Get communication analytics error:', error);
      throw error;
    }
  }

  // Location analytics
  async getLocationAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        locationUpdates,
        geofenceBreaches,
        locationAccuracy,
        locationMetrics,
      ] = await Promise.all([
        this.getLocationUpdates(query),
        this.getGeofenceBreaches(query),
        this.getLocationAccuracy(query),
        this.getLocationMetrics(query),
      ]);

      return {
        locationUpdates,
        geofenceBreaches,
        locationAccuracy,
        locationMetrics,
      };
    } catch (error) {
      console.error('Get location analytics error:', error);
      throw error;
    }
  }

  // Performance analytics
  async getPerformanceAnalytics(startDate = null, endDate = null) {
    try {
      const [
        apiPerformance,
        databasePerformance,
        cachePerformance,
        errorRates,
      ] = await Promise.all([
        this.getApiPerformance(),
        this.getDatabasePerformance(),
        this.getCachePerformance(),
        this.getErrorRates(),
      ]);

      return {
        apiPerformance,
        databasePerformance,
        cachePerformance,
        errorRates,
      };
    } catch (error) {
      console.error('Get performance analytics error:', error);
      throw error;
    }
  }

  // Business analytics
  async getBusinessAnalytics(startDate = null, endDate = null) {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [
        revenue,
        userAcquisition,
        userRetention,
        conversionRates,
        businessMetrics,
      ] = await Promise.all([
        this.getRevenue(query),
        this.getUserAcquisition(query),
        this.getUserRetention(query),
        this.getConversionRates(query),
        this.getBusinessMetrics(query),
      ]);

      return {
        revenue,
        userAcquisition,
        userRetention,
        conversionRates,
        businessMetrics,
      };
    } catch (error) {
      console.error('Get business analytics error:', error);
      throw error;
    }
  }

  // Helper methods for user analytics
  async getTotalUsers(query = {}) {
    return await User.countDocuments(query);
  }

  async getActiveUsers(query = {}) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await User.countDocuments({
      ...query,
      lastActiveAt: { $gte: thirtyDaysAgo },
    });
  }

  async getNewUsers(query = {}) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await User.countDocuments({
      ...query,
      createdAt: { $gte: sevenDaysAgo },
    });
  }

  async getUserGrowth(query = {}) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [currentMonth, previousMonth] = await Promise.all([
      User.countDocuments({
        ...query,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      User.countDocuments({
        ...query,
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
    ]);

    return {
      currentMonth,
      previousMonth,
      growthRate: previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0,
    };
  }

  async getUserRetention(query = {}) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [activeThisWeek, activeLastWeek] = await Promise.all([
      User.countDocuments({
        ...query,
        lastActiveAt: { $gte: sevenDaysAgo },
      }),
      User.countDocuments({
        ...query,
        lastActiveAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
    ]);

    return {
      activeThisWeek,
      activeLastWeek,
      retentionRate: activeLastWeek > 0 ? (activeThisWeek / activeLastWeek) * 100 : 0,
    };
  }

  async getUserEngagement(query = {}) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [totalUsers, engagedUsers] = await Promise.all([
      User.countDocuments(query),
      User.countDocuments({
        ...query,
        $or: [
          { lastActiveAt: { $gte: thirtyDaysAgo } },
          { 'preferences.notifications': true },
        ],
      }),
    ]);

    return {
      totalUsers,
      engagedUsers,
      engagementRate: totalUsers > 0 ? (engagedUsers / totalUsers) * 100 : 0,
    };
  }

  async getUserDemographics(query = {}) {
    const demographics = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ['$age', 18] }, then: 'Under 18' },
                  { case: { $lt: ['$age', 25] }, then: '18-24' },
                  { case: { $lt: ['$age', 35] }, then: '25-34' },
                  { case: { $lt: ['$age', 45] }, then: '35-44' },
                  { case: { $lt: ['$age', 55] }, then: '45-54' },
                  { case: { $lt: ['$age', 65] }, then: '55-64' },
                ],
                default: '65+',
              },
            },
            gender: '$profile.gender',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return demographics;
  }

  async getUserActivity(query = {}) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyActivity = await User.aggregate([
      { $match: { ...query, lastActiveAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$lastActiveAt' },
            month: { $month: '$lastActiveAt' },
            day: { $dayOfMonth: '$lastActiveAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return dailyActivity;
  }

  // Helper methods for hourse analytics
  async getTotalFamilies(query = {}) {
    return await hourse.countDocuments(query);
  }

  async getActiveFamilies(query = {}) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await hourse.countDocuments({
      ...query,
      'members.lastActiveAt': { $gte: thirtyDaysAgo },
    });
  }

  async getNewFamilies(query = {}) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await hourse.countDocuments({
      ...query,
      createdAt: { $gte: sevenDaysAgo },
    });
  }

  async getFamilySize(query = {}) {
    const familySizes = await hourse.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            size: {
              $switch: {
                branches: [
                  { case: { $lt: [{ $size: '$members' }, 3] }, then: 'Small (1-2)' },
                  { case: { $lt: [{ $size: '$members' }, 5] }, then: 'Medium (3-4)' },
                  { case: { $lt: [{ $size: '$members' }, 8] }, then: 'Large (5-7)' },
                ],
                default: 'Very Large (8+)',
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return familySizes;
  }

  async getFamilyEngagement(query = {}) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [totalFamilies, engagedFamilies] = await Promise.all([
      hourse.countDocuments(query),
      hourse.countDocuments({
        ...query,
        $or: [
          { 'members.lastActiveAt': { $gte: thirtyDaysAgo } },
          { 'settings.locationSharing': true },
        ],
      }),
    ]);

    return {
      totalFamilies,
      engagedFamilies,
      engagementRate: totalFamilies > 0 ? (engagedFamilies / totalFamilies) * 100 : 0,
    };
  }

  async getFamilyActivity(query = {}) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyActivity = await hourse.aggregate([
      { $match: { ...query, updatedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return dailyActivity;
  }

  // Helper methods for subscription analytics
  async getTotalSubscriptions(query = {}) {
    return await Subscription.countDocuments(query);
  }

  async getActiveSubscriptions(query = {}) {
    return await Subscription.countDocuments({
      ...query,
      status: { $in: ['active', 'trialing'] },
    });
  }

  async getRevenue(query = {}) {
    const revenue = await Subscription.aggregate([
      { $match: { ...query, status: 'active' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$plan.price' },
          avgRevenue: { $avg: '$plan.price' },
          subscriptionCount: { $sum: 1 },
        },
      },
    ]);

    return revenue[0] || { totalRevenue: 0, avgRevenue: 0, subscriptionCount: 0 };
  }

  async getSubscriptionGrowth(query = {}) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [currentMonth, previousMonth] = await Promise.all([
      Subscription.countDocuments({
        ...query,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Subscription.countDocuments({
        ...query,
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
    ]);

    return {
      currentMonth,
      previousMonth,
      growthRate: previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0,
    };
  }

  async getChurnRate(query = {}) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [cancelledThisMonth, totalActive] = await Promise.all([
      Subscription.countDocuments({
        ...query,
        status: 'canceled',
        canceledAt: { $gte: thirtyDaysAgo },
      }),
      Subscription.countDocuments({
        ...query,
        status: { $in: ['active', 'trialing'] },
      }),
    ]);

    return {
      cancelledThisMonth,
      totalActive,
      churnRate: totalActive > 0 ? (cancelledThisMonth / totalActive) * 100 : 0,
    };
  }

  async getPlanDistribution(query = {}) {
    const planDistribution = await Subscription.aggregate([
      { $match: { ...query, status: 'active' } },
      {
        $group: {
          _id: '$plan.id',
          count: { $sum: 1 },
          revenue: { $sum: '$plan.price' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return planDistribution;
  }

  async getPaymentMetrics(query = {}) {
    const paymentMetrics = await Subscription.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$plan.price' },
        },
      },
    ]);

    return paymentMetrics;
  }

  // Helper methods for safety analytics
  async getEmergencyAlerts(query = {}) {
    return await EmergencyAlert.countDocuments(query);
  }

  async getSafetyChecks(query = {}) {
    return await SafetyCheck.countDocuments(query);
  }

  async getResponseTimes(query = {}) {
    const responseTimes = await SafetyCheck.aggregate([
      { $match: { ...query, responseTime: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
        },
      },
    ]);

    return responseTimes[0] || { avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0 };
  }

  async getAlertTypes(query = {}) {
    const alertTypes = await EmergencyAlert.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return alertTypes;
  }

  async getSafetyMetrics(query = {}) {
    const [totalAlerts, respondedAlerts] = await Promise.all([
      EmergencyAlert.countDocuments(query),
      EmergencyAlert.countDocuments({
        ...query,
        status: 'responded',
      }),
    ]);

    return {
      totalAlerts,
      respondedAlerts,
      responseRate: totalAlerts > 0 ? (respondedAlerts / totalAlerts) * 100 : 0,
    };
  }

  // Helper methods for communication analytics
  async getTotalMessages(query = {}) {
    return await Message.countDocuments(query);
  }

  async getMessageTypes(query = {}) {
    const messageTypes = await Message.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return messageTypes;
  }

  async getChatActivity(query = {}) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyActivity = await Message.aggregate([
      { $match: { ...query, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return dailyActivity;
  }

  async getCommunicationMetrics(query = {}) {
    const [totalMessages, uniqueSenders] = await Promise.all([
      Message.countDocuments(query),
      Message.distinct('sender', query),
    ]);

    return {
      totalMessages,
      uniqueSenders: uniqueSenders.length,
      avgMessagesPerSender: uniqueSenders.length > 0 ? totalMessages / uniqueSenders.length : 0,
    };
  }

  // Helper methods for location analytics
  async getLocationUpdates(query = {}) {
    return await Location.countDocuments(query);
  }

  async getGeofenceBreaches(query = {}) {
    // This would depend on your geofence implementation
    return 0;
  }

  async getLocationAccuracy(query = {}) {
    const accuracy = await Location.aggregate([
      { $match: { ...query, accuracy: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$accuracy' },
          minAccuracy: { $min: '$accuracy' },
          maxAccuracy: { $max: '$accuracy' },
        },
      },
    ]);

    return accuracy[0] || { avgAccuracy: 0, minAccuracy: 0, maxAccuracy: 0 };
  }

  async getLocationMetrics(query = {}) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyUpdates = await Location.aggregate([
      { $match: { ...query, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return dailyUpdates;
  }

  // Helper methods for performance analytics
  async getApiPerformance() {
    // This would integrate with your monitoring system
    return {
      avgResponseTime: 0,
      requestsPerSecond: 0,
      errorRate: 0,
    };
  }

  async getDatabasePerformance() {
    // This would integrate with your database monitoring
    return {
      avgQueryTime: 0,
      connections: 0,
      slowQueries: 0,
    };
  }

  async getCachePerformance() {
    // This would integrate with your cache monitoring
    return {
      hitRate: 0,
      missRate: 0,
      memoryUsage: 0,
    };
  }

  async getErrorRates() {
    // This would integrate with your error tracking system
    return {
      totalErrors: 0,
      errorRate: 0,
      topErrors: [],
    };
  }

  // Helper methods for business analytics
  async getUserAcquisition(query = {}) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [newUsers, totalUsers] = await Promise.all([
      User.countDocuments({
        ...query,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      User.countDocuments(query),
    ]);

    return {
      newUsers,
      totalUsers,
      acquisitionRate: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0,
    };
  }

  async getConversionRates(query = {}) {
    const [totalUsers, subscribedUsers] = await Promise.all([
      User.countDocuments(query),
      Subscription.countDocuments({
        ...query,
        status: { $in: ['active', 'trialing'] },
      }),
    ]);

    return {
      totalUsers,
      subscribedUsers,
      conversionRate: totalUsers > 0 ? (subscribedUsers / totalUsers) * 100 : 0,
    };
  }

  async getBusinessMetrics(query = {}) {
    const [revenue, activeSubscriptions, churnedSubscriptions] = await Promise.all([
      this.getRevenue(query),
      this.getActiveSubscriptions(query),
      this.getChurnRate(query),
    ]);

    return {
      revenue: revenue.totalRevenue,
      activeSubscriptions,
      churnRate: churnedSubscriptions.churnRate,
      avgRevenuePerUser: activeSubscriptions > 0 ? revenue.totalRevenue / activeSubscriptions : 0,
    };
  }
}

module.exports = new AnalyticsService(); 