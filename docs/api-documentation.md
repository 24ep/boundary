# Bondarys API Documentation

## 📋 Overview

The Bondarys API provides comprehensive endpoints for family management, real-time communication, location tracking, safety features, and integrated services.

**Base URL**: `https://api.bondarys.com/v1`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

## 🔐 Authentication

### JWT Token Authentication

All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Refresh

When the access token expires, use the refresh token to get a new one:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## 📊 Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 👤 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "profile": {
        "dateOfBirth": "1990-01-01",
        "gender": "male"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Logout User

```http
POST /auth/logout
Authorization: Bearer <token>
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "newPassword123"
}
```

### Verify Email

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

## 👥 User Management Endpoints

### Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "profile": {
    "bio": "Family man",
    "interests": ["sports", "music"]
  }
}
```

### Update Avatar

```http
POST /users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

// Form data with image file
```

### Get Emergency Contacts

```http
GET /users/emergency-contacts
Authorization: Bearer <token>
```

### Add Emergency Contact

```http
POST /users/emergency-contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phoneNumber": "+1234567890",
  "relationship": "spouse",
  "isPrimary": true
}
```

### Update Emergency Contact

```http
PUT /users/emergency-contacts/:contactId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "phoneNumber": "+1234567890",
  "relationship": "spouse"
}
```

### Delete Emergency Contact

```http
DELETE /users/emergency-contacts/:contactId
Authorization: Bearer <token>
```

### Get User Geofences

```http
GET /users/geofences
Authorization: Bearer <token>
```

### Create Geofence

```http
POST /users/geofences
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Home",
  "type": "home",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "radius": 100,
  "notifications": true,
  "breachType": "both"
}
```

### Update Geofence

```http
PUT /users/geofences/:geofenceId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Work",
  "radius": 200
}
```

### Delete Geofence

```http
DELETE /users/geofences/:geofenceId
Authorization: Bearer <token>
```

### Block User

```http
POST /users/:userId/block
Authorization: Bearer <token>
```

### Unblock User

```http
DELETE /users/:userId/block
Authorization: Bearer <token>
```

### Delete Account

```http
DELETE /users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "currentPassword",
  "reason": "No longer needed"
}
```

## 👨‍👩‍👧‍👦 Family Management Endpoints

### Create Family

```http
POST /families
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "The Smith Family",
  "description": "Our happy family",
  "settings": {
    "locationSharing": true,
    "notifications": true,
    "privacy": "family_only"
  }
}
```

### Get Family Details

```http
GET /families/:familyId
Authorization: Bearer <token>
```

### Update Family

```http
PUT /families/:familyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "The Smith Family",
  "description": "Updated description",
  "settings": {
    "locationSharing": true,
    "notifications": true
  }
}
```

### Delete Family

```http
DELETE /families/:familyId
Authorization: Bearer <token>
```

### Get Family Members

```http
GET /families/:familyId/members
Authorization: Bearer <token>
```

### Invite Family Member

```http
POST /families/:familyId/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "role": "member",
  "message": "Join our family!"
}
```

### Accept Family Invitation

```http
POST /families/invitations/:invitationId/accept
Authorization: Bearer <token>
```

### Decline Family Invitation

```http
POST /families/invitations/:invitationId/decline
Authorization: Bearer <token>
```

### Remove Family Member

```http
DELETE /families/:familyId/members/:memberId
Authorization: Bearer <token>
```

### Update Member Role

```http
PUT /families/:familyId/members/:memberId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Get Family Invitations

```http
GET /families/invitations
Authorization: Bearer <token>
```

## 📍 Location Endpoints

### Update Location

```http
POST /location/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "accuracy": 10,
  "speed": 5.5,
  "heading": 90,
  "altitude": 100,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Location History

```http
GET /location/history
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate`: Start date (ISO string)
- `endDate`: End date (ISO string)
- `limit`: Number of records (default: 50)

### Get Family Locations

```http
GET /location/family
Authorization: Bearer <token>
```

### Request Location

```http
POST /location/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "target_user_id",
  "message": "Where are you?",
  "expiresIn": 300
}
```

### Share Location

```http
POST /location/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["user_id_1", "user_id_2"],
  "duration": 3600,
  "message": "Sharing my location"
}
```

### Get Geofence Status

```http
GET /location/geofences/status
Authorization: Bearer <token>
```

## 🚨 Safety Endpoints

### Create Emergency Alert

```http
POST /safety/emergency
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "medical",
  "severity": "high",
  "description": "Need immediate medical attention",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "contacts": ["contact_id_1", "contact_id_2"]
}
```

### Get Emergency Alerts

```http
GET /safety/emergency
Authorization: Bearer <token>
```

### Update Emergency Alert

```http
PUT /safety/emergency/:alertId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "resolution": "Medical help arrived"
}
```

### Request Safety Check

```http
POST /safety/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["user_id_1", "user_id_2"],
  "message": "Are you okay?",
  "expiresIn": 300,
  "requireResponse": true
}
```

### Respond to Safety Check

```http
POST /safety/check/:checkId/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ok",
  "message": "I'm fine, thanks!"
}
```

### Get Safety Check History

```http
GET /safety/check/history
Authorization: Bearer <token>
```

### Get Safety Statistics

```http
GET /safety/statistics
Authorization: Bearer <token>
```

## 💬 Chat Endpoints

### Create Chat

```http
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "family",
  "name": "Family Chat",
  "participants": ["user_id_1", "user_id_2"],
  "familyId": "family_id"
}
```

### Get Chats

```http
GET /chat
Authorization: Bearer <token>
```

### Get Chat Messages

```http
GET /chat/:chatId/messages
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of messages (default: 50)
- `before`: Message ID to get messages before
- `after`: Message ID to get messages after

### Send Message

```http
POST /chat/:chatId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "text",
  "content": "Hello everyone!",
  "replyTo": "message_id" // Optional
}
```

### Send File Message

```http
POST /chat/:chatId/messages
Authorization: Bearer <token>
Content-Type: multipart/form-data

// Form data with file and message details
```

### Update Message

```http
PUT /chat/:chatId/messages/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated message content"
}
```

### Delete Message

```http
DELETE /chat/:chatId/messages/:messageId
Authorization: Bearer <token>
```

### React to Message

```http
POST /chat/:chatId/messages/:messageId/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "reaction": "👍"
}
```

### Remove Reaction

```http
DELETE /chat/:chatId/messages/:messageId/reactions
Authorization: Bearer <token>
```

### Mark Chat as Read

```http
POST /chat/:chatId/read
Authorization: Bearer <token>
```

### Leave Chat

```http
POST /chat/:chatId/leave
Authorization: Bearer <token>
```

## 💳 Billing Endpoints

### Create Subscription

```http
POST /billing/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "premium_monthly",
  "paymentMethodId": "pm_card_visa",
  "familyId": "family_id"
}
```

### Get Subscriptions

```http
GET /billing/subscriptions
Authorization: Bearer <token>
```

### Update Subscription

```http
PUT /billing/subscriptions/:subscriptionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "premium_yearly"
}
```

### Cancel Subscription

```http
POST /billing/subscriptions/:subscriptionId/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Too expensive",
  "effectiveDate": "end_of_period"
}
```

### Get Payment Methods

```http
GET /billing/payment-methods
Authorization: Bearer <token>
```

### Add Payment Method

```http
POST /billing/payment-methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "expMonth": 12,
    "expYear": 2025,
    "cvc": "123"
  }
}
```

### Update Payment Method

```http
PUT /billing/payment-methods/:methodId
Authorization: Bearer <token>
Content-Type: application/json

{
  "expMonth": 11,
  "expYear": 2026
}
```

### Delete Payment Method

```http
DELETE /billing/payment-methods/:methodId
Authorization: Bearer <token>
```

### Get Invoices

```http
GET /billing/invoices
Authorization: Bearer <token>
```

### Get Invoice Details

```http
GET /billing/invoices/:invoiceId
Authorization: Bearer <token>
```

### Download Invoice

```http
GET /billing/invoices/:invoiceId/download
Authorization: Bearer <token>
```

## 👨‍💼 Admin Endpoints

### Get All Users

```http
GET /admin/users
Authorization: Bearer <admin_token>
```

### Get User Details

```http
GET /admin/users/:userId
Authorization: Bearer <admin_token>
```

### Update User

```http
PUT /admin/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "suspended",
  "role": "moderator"
}
```

### Delete User

```http
DELETE /admin/users/:userId
Authorization: Bearer <admin_token>
```

### Get All Families

```http
GET /admin/families
Authorization: Bearer <admin_token>
```

### Get Family Details

```http
GET /admin/families/:familyId
Authorization: Bearer <admin_token>
```

### Update Family

```http
PUT /admin/families/:familyId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "active"
}
```

### Delete Family

```http
DELETE /admin/families/:familyId
Authorization: Bearer <admin_token>
```

### Get System Analytics

```http
GET /admin/analytics
Authorization: Bearer <admin_token>
```

### Send Broadcast Message

```http
POST /admin/broadcast
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "System Maintenance",
  "message": "Scheduled maintenance on Sunday",
  "type": "info",
  "targetAudience": "all_users"
}
```

### Get System Health

```http
GET /admin/health
Authorization: Bearer <admin_token>
```

## 🔗 Webhook Endpoints

### Stripe Webhook

```http
POST /webhooks/stripe
Content-Type: application/json

// Stripe webhook payload
```

### Twilio Webhook

```http
POST /webhooks/twilio
Content-Type: application/json

// Twilio webhook payload
```

### Firebase Webhook

```http
POST /webhooks/firebase
Content-Type: application/json

// Firebase webhook payload
```

### Google Webhook

```http
POST /webhooks/google
Content-Type: application/json

// Google webhook payload
```

### Apple Webhook

```http
POST /webhooks/apple
Content-Type: application/json

// Apple webhook payload
```

### AWS S3 Webhook

```http
POST /webhooks/aws-s3
Content-Type: application/json

// AWS S3 webhook payload
```

### Sentry Webhook

```http
POST /webhooks/sentry
Content-Type: application/json

// Sentry webhook payload
```

## 📊 Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## 🔒 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| API endpoints | 100 requests | 15 minutes |
| File uploads | 10 files | 1 hour |
| Location updates | 60 requests | 1 minute |
| Chat messages | 30 messages | 1 minute |

## 📱 WebSocket Events

### Connection

```javascript
const socket = io('https://api.bondarys.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Location Updates
```javascript
socket.on('location:update', (data) => {
  console.log('Location updated:', data);
});
```

#### New Message
```javascript
socket.on('chat:new_message', (data) => {
  console.log('New message:', data);
});
```

#### Emergency Alert
```javascript
socket.on('safety:emergency', (data) => {
  console.log('Emergency alert:', data);
});
```

#### Safety Check
```javascript
socket.on('safety:check_request', (data) => {
  console.log('Safety check requested:', data);
});
```

#### Family Updates
```javascript
socket.on('family:update', (data) => {
  console.log('Family updated:', data);
});
```

#### Geofence Breach
```javascript
socket.on('location:geofence_breach', (data) => {
  console.log('Geofence breach:', data);
});
```

### Emitting Events

#### Update Location
```javascript
socket.emit('location:update', {
  coordinates: { lat: 40.7128, lng: -74.0060 },
  accuracy: 10
});
```

#### Send Message
```javascript
socket.emit('chat:send_message', {
  chatId: 'chat_id',
  content: 'Hello!',
  type: 'text'
});
```

#### Typing Indicator
```javascript
socket.emit('chat:typing', {
  chatId: 'chat_id',
  isTyping: true
});
```

## 🧪 Testing

### Test Environment

**Base URL**: `https://api-test.bondarys.com/v1`

### Test Data

Use these test accounts for development:

```json
{
  "admin": {
    "email": "admin@bondarys.com",
    "password": "admin123"
  },
  "user": {
    "email": "user@bondarys.com",
    "password": "user123"
  }
}
```

### Postman Collection

Download our Postman collection for easy API testing:
[Bondarys API Collection](https://api.bondarys.com/postman-collection.json)

## 📞 Support

For API support and questions:

- **Email**: api-support@bondarys.com
- **Documentation**: https://docs.bondarys.com/api
- **Status Page**: https://status.bondarys.com
- **GitHub Issues**: https://github.com/bondarys/bondarys/issues

---

**Last Updated**: January 2024  
**Version**: 1.0.0 