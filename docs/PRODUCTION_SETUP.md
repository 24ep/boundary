# Bondarys Production Setup Guide

This guide will help you set up and run the Bondarys application in production mode with complete authentication functionality.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm 8+** - Comes with Node.js
- **Expo CLI** - Will be installed automatically
- **Supabase Account** - [Sign up here](https://supabase.com/)

### 1. Environment Configuration

#### Backend Environment (.env)
Create a `.env` file in the `backend/` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-token-with-at-least-32-characters-long

# Server Configuration
PORT=3000
NODE_ENV=production

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Email Configuration (Optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Social Authentication (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

#### Mobile Environment (.env)
Create a `.env` file in the `mobile/` directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
EXPO_PUBLIC_API_URL=https://your-api-domain.com

# Application Configuration
EXPO_PUBLIC_APP_NAME=Bondarys
EXPO_PUBLIC_APP_VERSION=1.0.0

# Social Authentication (Optional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
EXPO_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id_here

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_LOCATION_SERVICES=true
```

### 2. Database Setup

#### Supabase Setup
1. Create a new project in [Supabase](https://supabase.com/)
2. Go to Settings > API to get your keys
3. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
4. Enable Row Level Security (RLS) policies as needed

#### Database Schema
The application uses the following main tables:
- `users` - User accounts and profiles
- `families` - Family groups
- `family_members` - Family membership
- `chat_rooms` & `chat_messages` - Family communication
- `user_locations` & `location_history` - Location tracking
- `notifications` - Push notifications
- `emergency_alerts` - Safety features
- `events` & `tasks` - Family organization

### 3. Running the Application

#### Option 1: Using the Startup Script (Recommended)

**Windows:**
```bash
scripts/start-production.bat
```

**Linux/Mac:**
```bash
./scripts/start-production.sh
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Mobile:**
```bash
cd mobile
npm install
expo start --dev-client
```

### 4. Testing the Authentication Flow

1. **Start the application** using one of the methods above
2. **Open the mobile app** on your device or emulator
3. **Test Registration:**
   - Tap "Sign Up"
   - Fill in the registration form
   - Submit and verify account creation
4. **Test Login:**
   - Use the credentials from registration
   - Verify successful login
5. **Test Onboarding:**
   - Complete the onboarding flow
   - Verify navigation to main app

## 🔧 Features Implemented

### ✅ Backend Features
- **User Registration & Login** - Complete with validation
- **JWT Authentication** - Access & refresh tokens
- **Password Security** - Bcrypt hashing
- **Supabase Integration** - PostgreSQL database
- **API Routes** - RESTful endpoints
- **Error Handling** - Comprehensive error responses
- **Logging** - Winston logger with file output
- **Rate Limiting** - Protection against abuse
- **CORS Configuration** - Secure cross-origin requests

### ✅ Mobile Features
- **Login Screen** - Email/password with validation
- **Signup Screen** - Complete registration form
- **Forgot Password** - Password reset flow
- **Onboarding** - Welcome and feature introduction
- **Navigation Flow** - Auth → Onboarding → Main App
- **Form Validation** - Real-time input validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Activity indicators
- **Social Login** - Google, Facebook, Apple (optional)
- **Environment Config** - Production/development settings

### ✅ Security Features
- **JWT Tokens** - Secure authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Server-side validation
- **Rate Limiting** - API protection
- **CORS** - Cross-origin security
- **Environment Variables** - Secure configuration
- **Token Refresh** - Automatic token renewal

## 📱 Mobile App Structure

```
mobile/
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Main navigation controller
│   │   ├── AuthNavigator.tsx      # Authentication screens
│   │   ├── AppNavigator.tsx       # Main app screens
│   │   └── MainTabNavigator.tsx   # Tab navigation
│   ├── screens/
│   │   └── auth/
│   │       ├── LoginScreen.tsx    # Login form
│   │       ├── SignupScreen.tsx   # Registration form
│   │       ├── ForgotPasswordScreen.tsx
│   │       └── OnboardingScreen.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state
│   ├── services/
│   │   └── api/
│   │       └── index.ts           # API client
│   └── config/
│       └── environment.ts         # Environment configuration
```

## 🔧 Backend API Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── auth.js                # Authentication endpoints
│   ├── models/
│   │   └── User.js                # User model with Supabase
│   ├── middleware/
│   │   └── auth.js                # JWT authentication
│   ├── services/
│   │   └── supabaseService.js     # Database service
│   └── server.js                  # Main server file
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Supabase client not initialized"**
   - Check your Supabase URL and keys in `.env`
   - Ensure Supabase project is active

2. **"Invalid credentials" on login**
   - Verify user exists in database
   - Check password hashing

3. **"Token refresh failed"**
   - Check JWT secrets in environment
   - Verify token expiration settings

4. **Mobile app won't connect to backend**
   - Check API URL in mobile `.env`
   - Ensure backend is running on correct port
   - Verify CORS settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📊 Monitoring

### Logs
- Backend logs: `backend/logs/`
- Error logs: `backend/logs/error.log`
- Combined logs: `backend/logs/combined.log`

### Health Check
- Backend health: `GET http://localhost:3000/health`
- Database health: Check Supabase dashboard

## 🔐 Security Checklist

- [ ] Strong JWT secrets (32+ characters)
- [ ] Secure Supabase service role key
- [ ] HTTPS in production
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database RLS policies enabled
- [ ] Input validation on all endpoints

## 🚀 Deployment

### Backend Deployment
1. Set up production environment variables
2. Deploy to your preferred platform (Heroku, AWS, etc.)
3. Configure domain and SSL
4. Set up monitoring and logging

### Mobile Deployment
1. Configure production environment
2. Build with Expo/EAS
3. Submit to app stores
4. Set up push notifications

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error details
3. Verify environment configuration
4. Test with development mode first

---

**🎉 Congratulations!** You now have a production-ready Bondarys application with complete authentication functionality.
