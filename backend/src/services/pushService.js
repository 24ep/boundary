const admin = require('firebase-admin');
const webpush = require('web-push');

class PushService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Initialize Firebase Admin SDK
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });

        this.fcm = admin.messaging();
        console.log('Firebase Admin SDK initialized');
      }

      // Initialize Web Push
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          'mailto:' + (process.env.SUPPORT_EMAIL || 'support@bondarys.com'),
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        console.log('Web Push initialized');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Push service initialization error:', error);
    }
  }

  // Send push notification to specific user
  async sendToUser(userId, notification) {
    try {
      if (!this.initialized) {
        throw new Error('Push service not initialized');
      }

      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const results = [];

      // Send to mobile devices (FCM)
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        const fcmResult = await this.sendToFCM(user.fcmTokens, notification);
        results.push(...fcmResult);
      }

      // Send to web browsers
      if (user.webPushSubscriptions && user.webPushSubscriptions.length > 0) {
        const webResult = await this.sendToWebPush(user.webPushSubscriptions, notification);
        results.push(...webResult);
      }

      return results;
    } catch (error) {
      console.error('Send to user error:', error);
      throw error;
    }
  }

  // Send to multiple users
  async sendToUsers(userIds, notification) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.sendToUser(userId, notification);
          results.push(...result);
        } catch (error) {
          console.error(`Failed to send to user ${userId}:`, error);
          results.push({ userId, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Send to users error:', error);
      throw error;
    }
  }

  // Send to FCM (mobile devices)
  async sendToFCM(tokens, notification) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.image,
        },
        data: notification.data || {},
        android: {
          notification: {
            sound: 'default',
            channelId: 'bondarys_channel',
            priority: notification.priority || 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              alert: {
                title: notification.title,
                body: notification.body,
              },
            },
          },
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.tag,
            requireInteraction: notification.requireInteraction || false,
            actions: notification.actions || [],
          },
          fcmOptions: {
            link: notification.url || '/',
          },
        },
      };

      const response = await this.fcm.sendMulticast({
        tokens,
        ...message,
      });

      const results = [];
      response.responses.forEach((resp, idx) => {
        results.push({
          token: tokens[idx],
          success: resp.success,
          messageId: resp.messageId,
          error: resp.error,
        });
      });

      return results;
    } catch (error) {
      console.error('FCM send error:', error);
      throw error;
    }
  }

  // Send to Web Push (browsers)
  async sendToWebPush(subscriptions, notification) {
    try {
      if (!webpush) {
        throw new Error('Web Push not initialized');
      }

      const results = [];
      
      for (const subscription of subscriptions) {
        try {
          const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.tag,
            requireInteraction: notification.requireInteraction || false,
            actions: notification.actions || [],
            data: notification.data || {},
            url: notification.url || '/',
          });

          const result = await webpush.sendNotification(subscription, payload);
          
          results.push({
            subscription: subscription.endpoint,
            success: true,
            statusCode: result.statusCode,
          });
        } catch (error) {
          results.push({
            subscription: subscription.endpoint,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Web Push send error:', error);
      throw error;
    }
  }

  // Send to topic (for broadcast messages)
  async sendToTopic(topic, notification) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        topic,
      };

      const response = await this.fcm.send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Topic send error:', error);
      throw error;
    }
  }

  // Subscribe user to topic
  async subscribeToTopic(tokens, topic) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const response = await this.fcm.subscribeToTopic(tokens, topic);
      return response;
    } catch (error) {
      console.error('Subscribe to topic error:', error);
      throw error;
    }
  }

  // Unsubscribe user from topic
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const response = await this.fcm.unsubscribeFromTopic(tokens, topic);
      return response;
    } catch (error) {
      console.error('Unsubscribe from topic error:', error);
      throw error;
    }
  }

  // Add FCM token for user
  async addFCMToken(userId, token) {
    try {
      const User = require('../models/User');
      
      await User.findByIdAndUpdate(userId, {
        $addToSet: { fcmTokens: token },
      });

      return true;
    } catch (error) {
      console.error('Add FCM token error:', error);
      throw error;
    }
  }

  // Remove FCM token for user
  async removeFCMToken(userId, token) {
    try {
      const User = require('../models/User');
      
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: token },
      });

      return true;
    } catch (error) {
      console.error('Remove FCM token error:', error);
      throw error;
    }
  }

  // Add web push subscription for user
  async addWebPushSubscription(userId, subscription) {
    try {
      const User = require('../models/User');
      
      await User.findByIdAndUpdate(userId, {
        $addToSet: { webPushSubscriptions: subscription },
      });

      return true;
    } catch (error) {
      console.error('Add web push subscription error:', error);
      throw error;
    }
  }

  // Remove web push subscription for user
  async removeWebPushSubscription(userId, endpoint) {
    try {
      const User = require('../models/User');
      
      await User.findByIdAndUpdate(userId, {
        $pull: { webPushSubscriptions: { endpoint } },
      });

      return true;
    } catch (error) {
      console.error('Remove web push subscription error:', error);
      throw error;
    }
  }

  // Clean up invalid tokens
  async cleanupInvalidTokens() {
    try {
      const User = require('../models/User');
      const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } });

      for (const user of users) {
        const validTokens = [];
        
        for (const token of user.fcmTokens) {
          try {
            // Test token validity by sending a test message
            await this.fcm.send({
              token,
              notification: {
                title: 'Test',
                body: 'Test message',
              },
            });
            validTokens.push(token);
          } catch (error) {
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              console.log(`Removing invalid token for user ${user._id}`);
            }
          }
        }

        if (validTokens.length !== user.fcmTokens.length) {
          user.fcmTokens = validTokens;
          await user.save();
        }
      }

      return true;
    } catch (error) {
      console.error('Cleanup invalid tokens error:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // This would require a notification log model
      // For now, return basic stats
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        successRate: 0,
      };
    } catch (error) {
      console.error('Get notification stats error:', error);
      throw error;
    }
  }
}

// Create push service instance
const pushService = new PushService();

// Export functions
const sendPushNotification = (options) => pushService.sendToUser(options.userId, options);
const sendToUsers = (userIds, notification) => pushService.sendToUsers(userIds, notification);
const sendToTopic = (topic, notification) => pushService.sendToTopic(topic, notification);
const subscribeToTopic = (tokens, topic) => pushService.subscribeToTopic(tokens, topic);
const unsubscribeFromTopic = (tokens, topic) => pushService.unsubscribeFromTopic(tokens, topic);
const addFCMToken = (userId, token) => pushService.addFCMToken(userId, token);
const removeFCMToken = (userId, token) => pushService.removeFCMToken(userId, token);
const addWebPushSubscription = (userId, subscription) => pushService.addWebPushSubscription(userId, subscription);
const removeWebPushSubscription = (userId, endpoint) => pushService.removeWebPushSubscription(userId, endpoint);
const cleanupInvalidTokens = () => pushService.cleanupInvalidTokens();
const getNotificationStats = (userId, days) => pushService.getNotificationStats(userId, days);

module.exports = {
  pushService,
  sendPushNotification,
  sendToUsers,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  addFCMToken,
  removeFCMToken,
  addWebPushSubscription,
  removeWebPushSubscription,
  cleanupInvalidTokens,
  getNotificationStats,
}; 