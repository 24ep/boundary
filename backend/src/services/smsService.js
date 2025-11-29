const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.init();
  }

  init() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('SMS service initialized successfully');
      } else {
        console.warn('Twilio credentials not found - SMS service disabled');
      }
    } catch (error) {
      console.error('SMS service initialization error:', error);
    }
  }

  async sendSMS({ to, message, priority = 'normal' }) {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }

      if (!to || !message) {
        throw new Error('Phone number and message are required');
      }

      // Format phone number
      const formattedNumber = this.formatPhoneNumber(to);

      // Send SMS
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber,
        priority: priority === 'high' ? 'high' : 'normal',
      });

      console.log(`SMS sent successfully to ${formattedNumber}: ${result.sid}`);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: formattedNumber,
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      throw error;
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned; // US/Canada
    }
    
    // Add + prefix
    return '+' + cleaned;
  }

  // Emergency alert SMS
  async sendEmergencyAlert(user, emergencyContacts, location) {
    if (!this.client) return;

    const message = `EMERGENCY ALERT: ${user.firstName} ${user.lastName} has triggered an emergency alert. ` +
      `Location: ${location ? `${location.latitude}, ${location.longitude}` : 'Unknown'}. ` +
      `Call: ${user.phoneNumber}. ` +
      `Map: https://maps.google.com/?q=${location ? `${location.latitude},${location.longitude}` : ''}`;

    const promises = emergencyContacts
      .filter(contact => contact.phoneNumber)
      .map(contact => 
        this.sendSMS({
          to: contact.phoneNumber,
          message,
          priority: 'high',
        }).catch(error => {
          console.error(`Failed to send emergency SMS to ${contact.phoneNumber}:`, error);
          return { success: false, error };
        })
      );

    return Promise.all(promises);
  }

  // Geofence notification
  async sendGeofenceNotification(user, geofence, action) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Geofence ${action}: You have ${action} the "${geofence.name}" area. ` +
      `Time: ${new Date().toLocaleString()}. ` +
      `Location: ${geofence.address || `${geofence.location.coordinates[1]}, ${geofence.location.coordinates[0]}`}`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Verification code
  async sendVerificationCode(phoneNumber, code) {
    const message = `Your Bondarys verification code is: ${code}. ` +
      `This code will expire in 10 minutes. Do not share this code with anyone.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Password reset code
  async sendPasswordResetCode(phoneNumber, code) {
    const message = `Your Bondarys password reset code is: ${code}. ` +
      `This code will expire in 15 minutes. If you didn't request this, please ignore.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // hourse invitation
  async sendFamilyInvitation(inviter, invitee, hourse) {
    if (!this.client || !invitee.phoneNumber) return;

    const message = `${inviter.firstName} has invited you to join the "${hourse.name}" hourse on Bondarys. ` +
      `Download the app and use your email to join.`;

    return this.sendSMS({
      to: invitee.phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Location sharing request
  async sendLocationRequest(fromUser, toUser) {
    if (!this.client || !toUser.phoneNumber) return;

    const message = `${fromUser.firstName} is requesting your location on Bondarys. ` +
      `Open the app to respond.`;

    return this.sendSMS({
      to: toUser.phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Safety check reminder
  async sendSafetyCheckReminder(user) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Safety Check: Are you okay? Please respond in the Bondarys app within 5 minutes. ` +
      `If no response, your emergency contacts will be notified.`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'high',
    });
  }

  // Account security alert
  async sendSecurityAlert(user, activity) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Security Alert: ${activity.description} detected on your Bondarys account. ` +
      `Time: ${activity.timestamp}. ` +
      `If this wasn't you, please secure your account immediately.`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'high',
    });
  }

  // Subscription payment reminder
  async sendPaymentReminder(user, subscription) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Payment Reminder: Your Bondarys ${subscription.plan.name} subscription will renew on ${subscription.nextBillingDate}. ` +
      `Amount: $${subscription.plan.price}. ` +
      `Update payment method: ${process.env.FRONTEND_URL}/billing`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Account suspended notification
  async sendAccountSuspendedNotification(user, reason) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Account Suspended: Your Bondarys account has been suspended. ` +
      `Reason: ${reason}. ` +
      `Contact support: ${process.env.SUPPORT_EMAIL}`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'high',
    });
  }

  // Welcome message
  async sendWelcomeMessage(user) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Welcome to Bondarys, ${user.firstName}! ` +
      `Your hourse safety app is now ready. ` +
      `Download the mobile app to get started.`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Weekly summary
  async sendWeeklySummary(user, summary) {
    if (!this.client || !user.phoneNumber) return;

    const message = `Weekly Summary: ${summary.safetyChecks} safety checks, ${summary.locationShares} location shares, ${summary.emergencyAlerts} alerts. ` +
      `View details in the app.`;

    return this.sendSMS({
      to: user.phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Test SMS
  async sendTestSMS(phoneNumber) {
    const message = `Test SMS from Bondarys. ` +
      `Time: ${new Date().toISOString()}. ` +
      `Environment: ${process.env.NODE_ENV}`;

    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal',
    });
  }

  // Bulk SMS (for notifications)
  async sendBulkSMS(recipients, message, priority = 'normal') {
    if (!this.client) return;

    const promises = recipients
      .filter(recipient => recipient.phoneNumber)
      .map(recipient => 
        this.sendSMS({
          to: recipient.phoneNumber,
          message,
          priority,
        }).catch(error => {
          console.error(`Failed to send bulk SMS to ${recipient.phoneNumber}:`, error);
          return { success: false, error, recipient: recipient.phoneNumber };
        })
      );

    return Promise.all(promises);
  }

  // Get SMS status
  async getSMSStatus(messageId) {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }

      const message = await this.client.messages(messageId).fetch();
      return {
        messageId: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        sentAt: message.dateCreated,
        deliveredAt: message.dateSent,
      };
    } catch (error) {
      console.error('Get SMS status error:', error);
      throw error;
    }
  }

  // Validate phone number
  async validatePhoneNumber(phoneNumber) {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const lookup = await this.client.lookups.v1.phoneNumbers(formattedNumber).fetch();
      
      return {
        valid: true,
        formatted: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        nationalFormat: lookup.nationalFormat,
        internationalFormat: lookup.internationalFormat,
      };
    } catch (error) {
      console.error('Phone number validation error:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = {
  smsService,
  sendSMS: (options) => smsService.sendSMS(options),
}; 