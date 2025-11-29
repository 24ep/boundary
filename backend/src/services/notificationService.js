const { sendEmail } = require('./emailService');
const { sendSMS } = require('./smsService');
const { sendPushNotification } = require('./pushService');
const User = require('../models/User');
const hourse = require('../models/hourse');
const EmergencyAlert = require('../models/EmergencyAlert');
const SafetyCheck = require('../models/SafetyCheck');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      EMERGENCY_ALERT: 'emergency_alert',
      SAFETY_CHECK: 'safety_check',
      LOCATION_UPDATE: 'location_update',
      FAMILY_INVITE: 'family_invite',
      MESSAGE: 'message',
      GEOFENCE_BREACH: 'geofence_breach',
      SUBSCRIPTION: 'subscription',
      SYSTEM: 'system',
    };

    this.channels = {
      PUSH: 'push',
      EMAIL: 'email',
      SMS: 'sms',
      IN_APP: 'in_app',
    };
  }

  // Send emergency alert notifications
  async sendEmergencyAlert(alert, recipients = []) {
    try {
      const notificationData = {
        type: this.notificationTypes.EMERGENCY_ALERT,
        title: '🚨 Emergency Alert',
        body: `${alert.user.firstName} ${alert.user.lastName} has sent an emergency alert`,
        data: {
          alertId: alert._id.toString(),
          userId: alert.user._id.toString(),
          type: alert.type,
          message: alert.message,
          location: alert.location,
        },
        priority: 'high',
        sound: 'emergency',
        badge: 1,
      };

      // Get recipients if not provided
      if (recipients.length === 0) {
        recipients = await this.getEmergencyRecipients(alert.user);
      }

      // Send notifications through all channels
      const results = await Promise.allSettled([
        this.sendPushNotifications(recipients, notificationData),
        this.sendEmailNotifications(recipients, 'emergency-alert', {
          alert,
          user: alert.user,
        }),
        this.sendSMSNotifications(recipients, `EMERGENCY: ${alert.user.firstName} needs help! Location: ${alert.getFormattedAddress()}`),
      ]);

      return {
        success: true,
        recipients: recipients.length,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
          sms: results[2].status === 'fulfilled' ? results[2].value : results[2].reason,
        },
      };
    } catch (error) {
      console.error('Send emergency alert notification error:', error);
      throw error;
    }
  }

  // Send safety check notifications
  async sendSafetyCheck(safetyCheck, recipients = []) {
    try {
      const notificationData = {
        type: this.notificationTypes.SAFETY_CHECK,
        title: '👋 Safety Check',
        body: `${safetyCheck.requestedBy.firstName} is checking on your safety`,
        data: {
          safetyCheckId: safetyCheck._id.toString(),
          requestedBy: safetyCheck.requestedBy._id.toString(),
          message: safetyCheck.message,
          expiresAt: safetyCheck.expiresAt,
        },
        priority: 'high',
        sound: 'default',
        badge: 1,
      };

      // Get recipients if not provided
      if (recipients.length === 0) {
        recipients = [safetyCheck.user];
      }

      // Send notifications
      const results = await Promise.allSettled([
        this.sendPushNotifications(recipients, notificationData),
        this.sendEmailNotifications(recipients, 'safety-check', {
          safetyCheck,
          requestedBy: safetyCheck.requestedBy,
        }),
      ]);

      return {
        success: true,
        recipients: recipients.length,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
        },
      };
    } catch (error) {
      console.error('Send safety check notification error:', error);
      throw error;
    }
  }

  // Send location update notifications
  async sendLocationUpdate(user, location, familyMembers = []) {
    try {
      const notificationData = {
        type: this.notificationTypes.LOCATION_UPDATE,
        title: '📍 Location Update',
        body: `${user.firstName} has updated their location`,
        data: {
          userId: user._id.toString(),
          location: location,
          timestamp: new Date().toISOString(),
        },
        priority: 'normal',
        sound: 'default',
      };

      // Get hourse members if not provided
      if (familyMembers.length === 0) {
        const hourse = await hourse.findById(user.hourse).populate('members');
        familyMembers = hourse ? hourse.members.filter(member => member._id.toString() !== user._id.toString()) : [];
      }

      // Send notifications to hourse members
      const results = await Promise.allSettled([
        this.sendPushNotifications(familyMembers, notificationData),
        this.sendEmailNotifications(familyMembers, 'location-update', {
          user,
          location,
        }),
      ]);

      return {
        success: true,
        recipients: familyMembers.length,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
        },
      };
    } catch (error) {
      console.error('Send location update notification error:', error);
      throw error;
    }
  }

  // Send hourse invitation notifications
  async sendFamilyInvite(invitation, invitedUser) {
    try {
      const notificationData = {
        type: this.notificationTypes.FAMILY_INVITE,
        title: '👨‍👩‍👧‍👦 hourse Invitation',
        body: `${invitation.invitedBy.firstName} has invited you to join their hourse`,
        data: {
          invitationId: invitation._id.toString(),
          familyId: invitation.hourse._id.toString(),
          invitedBy: invitation.invitedBy._id.toString(),
          message: invitation.message,
        },
        priority: 'normal',
        sound: 'default',
        badge: 1,
      };

      // Send notifications
      const results = await Promise.allSettled([
        this.sendPushNotifications([invitedUser], notificationData),
        this.sendEmailNotifications([invitedUser], 'hourse-invitation', {
          invitation,
          hourse: invitation.hourse,
          invitedBy: invitation.invitedBy,
        }),
        this.sendSMSNotifications([invitedUser], `You've been invited to join ${invitation.hourse.name} hourse on Bondarys`),
      ]);

      return {
        success: true,
        recipients: 1,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
          sms: results[2].status === 'fulfilled' ? results[2].value : results[2].reason,
        },
      };
    } catch (error) {
      console.error('Send hourse invite notification error:', error);
      throw error;
    }
  }

  // Send message notifications
  async sendMessageNotification(message, recipients = []) {
    try {
      const notificationData = {
        type: this.notificationTypes.MESSAGE,
        title: `💬 New Message from ${message.sender.firstName}`,
        body: message.type === 'text' ? message.content.substring(0, 100) : `Sent a ${message.type}`,
        data: {
          messageId: message._id.toString(),
          chatId: message.chat._id.toString(),
          senderId: message.sender._id.toString(),
          type: message.type,
        },
        priority: 'normal',
        sound: 'default',
        badge: 1,
      };

      // Get recipients if not provided
      if (recipients.length === 0) {
        recipients = await this.getChatRecipients(message.chat, message.sender._id);
      }

      // Send notifications
      const results = await Promise.allSettled([
        this.sendPushNotifications(recipients, notificationData),
        this.sendEmailNotifications(recipients, 'new-message', {
          message,
          sender: message.sender,
          chat: message.chat,
        }),
      ]);

      return {
        success: true,
        recipients: recipients.length,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
        },
      };
    } catch (error) {
      console.error('Send message notification error:', error);
      throw error;
    }
  }

  // Send geofence breach notifications
  async sendGeofenceBreach(user, geofence, location) {
    try {
      const notificationData = {
        type: this.notificationTypes.GEOFENCE_BREACH,
        title: '🚪 Geofence Alert',
        body: `${user.firstName} has ${geofence.type === 'enter' ? 'entered' : 'left'} ${geofence.name}`,
        data: {
          userId: user._id.toString(),
          geofenceId: geofence._id.toString(),
          type: geofence.type,
          location: location,
        },
        priority: 'high',
        sound: 'geofence',
        badge: 1,
      };

      // Get hourse members
      const hourse = await hourse.findById(user.hourse).populate('members');
      const recipients = hourse ? hourse.members.filter(member => member._id.toString() !== user._id.toString()) : [];

      // Send notifications
      const results = await Promise.allSettled([
        this.sendPushNotifications(recipients, notificationData),
        this.sendEmailNotifications(recipients, 'geofence-breach', {
          user,
          geofence,
          location,
        }),
      ]);

      return {
        success: true,
        recipients: recipients.length,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
        },
      };
    } catch (error) {
      console.error('Send geofence breach notification error:', error);
      throw error;
    }
  }

  // Send subscription notifications
  async sendSubscriptionNotification(user, subscription, type) {
    try {
      let title, body, template;

      switch (type) {
        case 'created':
          title = '🎉 Subscription Active';
          body = `Your ${subscription.plan.name} subscription is now active`;
          template = 'subscription-created';
          break;
        case 'renewed':
          title = '✅ Subscription Renewed';
          body = `Your ${subscription.plan.name} subscription has been renewed`;
          template = 'subscription-renewed';
          break;
        case 'cancelled':
          title = '❌ Subscription Cancelled';
          body = `Your ${subscription.plan.name} subscription has been cancelled`;
          template = 'subscription-cancelled';
          break;
        case 'payment_failed':
          title = '⚠️ Payment Failed';
          body = `Payment for your ${subscription.plan.name} subscription failed`;
          template = 'payment-failed';
          break;
        default:
          title = '📋 Subscription Update';
          body = 'Your subscription has been updated';
          template = 'subscription-update';
      }

      const notificationData = {
        type: this.notificationTypes.SUBSCRIPTION,
        title,
        body,
        data: {
          subscriptionId: subscription._id.toString(),
          planName: subscription.plan.name,
          status: subscription.status,
          type,
        },
        priority: 'normal',
        sound: 'default',
      };

      // Send notifications
      const results = await Promise.allSettled([
        this.sendPushNotifications([user], notificationData),
        this.sendEmailNotifications([user], template, {
          user,
          subscription,
          type,
        }),
      ]);

      return {
        success: true,
        recipients: 1,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
        },
      };
    } catch (error) {
      console.error('Send subscription notification error:', error);
      throw error;
    }
  }

  // Send system notifications
  async sendSystemNotification(users, title, body, data = {}) {
    try {
      const notificationData = {
        type: this.notificationTypes.SYSTEM,
        title,
        body,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        priority: 'normal',
        sound: 'default',
      };

      // Send notifications
      const results = await Promise.allSettled([
        this.sendPushNotifications(users, notificationData),
        this.sendEmailNotifications(users, 'system-notification', {
          title,
          body,
          data,
        }),
      ]);

      return {
        success: true,
        recipients: users.length,
        results: {
          push: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
          email: results[1].status === 'fulfilled' ? results[1].value : results[1].reason,
        },
      };
    } catch (error) {
      console.error('Send system notification error:', error);
      throw error;
    }
  }

  // Helper methods
  async getEmergencyRecipients(user) {
    try {
      const recipients = [];

      // Add emergency contacts
      if (user.emergencyContacts && user.emergencyContacts.length > 0) {
        const contactUsers = await User.find({
          phoneNumber: { $in: user.emergencyContacts.map(contact => contact.phoneNumber) },
        });
        recipients.push(...contactUsers);
      }

      // Add hourse members
      if (user.hourse) {
        const hourse = await hourse.findById(user.hourse).populate('members');
        if (hourse) {
          const familyMembers = hourse.members.filter(member => member._id.toString() !== user._id.toString());
          recipients.push(...familyMembers);
        }
      }

      return recipients;
    } catch (error) {
      console.error('Get emergency recipients error:', error);
      return [];
    }
  }

  async getChatRecipients(chat, senderId) {
    try {
      if (chat.type === 'direct') {
        // For direct chats, get the other user
        const otherUser = chat.participants.find(participant => 
          participant._id.toString() !== senderId.toString()
        );
        return otherUser ? [otherUser] : [];
      } else {
        // For group chats, get all participants except sender
        return chat.participants.filter(participant => 
          participant._id.toString() !== senderId.toString()
        );
      }
    } catch (error) {
      console.error('Get chat recipients error:', error);
      return [];
    }
  }

  async sendPushNotifications(users, notificationData) {
    try {
      const pushTokens = users
        .filter(user => user.pushTokens && user.pushTokens.length > 0)
        .flatMap(user => user.pushTokens);

      if (pushTokens.length === 0) {
        return { success: true, sent: 0, message: 'No push tokens available' };
      }

      const results = await Promise.allSettled(
        pushTokens.map(token => sendPushNotification(token, notificationData))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        success: true,
        sent: successful,
        failed,
        total: pushTokens.length,
      };
    } catch (error) {
      console.error('Send push notifications error:', error);
      throw error;
    }
  }

  async sendEmailNotifications(users, template, data) {
    try {
      const emailPromises = users
        .filter(user => user.email && user.preferences?.notifications?.email !== false)
        .map(user => sendEmail({
          to: user.email,
          template,
          data: { ...data, user },
        }));

      if (emailPromises.length === 0) {
        return { success: true, sent: 0, message: 'No email notifications to send' };
      }

      const results = await Promise.allSettled(emailPromises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        success: true,
        sent: successful,
        failed,
        total: emailPromises.length,
      };
    } catch (error) {
      console.error('Send email notifications error:', error);
      throw error;
    }
  }

  async sendSMSNotifications(users, message) {
    try {
      const smsPromises = users
        .filter(user => user.phoneNumber && user.preferences?.notifications?.sms !== false)
        .map(user => sendSMS({
          to: user.phoneNumber,
          message,
        }));

      if (smsPromises.length === 0) {
        return { success: true, sent: 0, message: 'No SMS notifications to send' };
      }

      const results = await Promise.allSettled(smsPromises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        success: true,
        sent: successful,
        failed,
        total: smsPromises.length,
      };
    } catch (error) {
      console.error('Send SMS notifications error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 