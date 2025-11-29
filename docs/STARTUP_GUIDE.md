# 🚀 Bondarys Application Startup Guide

## Current Status
✅ **Backend Server**: Running on http://localhost:3000  
⏳ **Mobile App**: Starting up...  
⏳ **Database**: Needs Supabase configuration  

## 🎯 Quick Start

### 1. Backend Server (✅ Running)
The backend server is currently running and accessible at:
- **Health Check**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api
- **Status**: ✅ Connected to Supabase

### 2. Mobile Application (⏳ Starting)
The mobile app is starting up. Once ready, you can:
- **Web**: http://localhost:3001 (if using Expo web)
- **Mobile**: Scan QR code with Expo Go app
- **Status**: ⏳ Initializing...

### 3. Database Setup (⚠️ Needs Configuration)
To complete the setup, you need to:

#### Option A: Use Existing Supabase Project
1. Get your Supabase credentials from your project dashboard
2. Update the environment variables in `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

#### Option B: Create New Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Get the URL and service role key
4. Update the environment variables

#### Option C: Use Demo Mode (No Database)
The app can run in demo mode without a database for testing the UI.

## 🔧 Available Commands

### Backend Commands
```bash
# Start backend server
cd backend
npm run dev

# Run database migrations (after Supabase setup)
npm run migrate

# Check migration status
npm run migrate:status

# Health check
curl http://localhost:3000/health
```

### Mobile Commands
```bash
# Start mobile app
cd mobile
npm start

# Start with specific platform
npm run web    # Web version
npm run ios    # iOS simulator
npm run android # Android emulator
```

## 📱 Accessing the Application

### Web Browser
1. Open http://localhost:3001 in your browser
2. The app should load with the marketing screen
3. Navigate through the signup flow

### Mobile Device
1. Install Expo Go app on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

### Development Tools
- **Backend API**: http://localhost:3000/health
- **Mobile Dev Tools**: http://localhost:3001
- **Expo Dev Tools**: http://localhost:19002

## 🗄️ Database Features (After Setup)

### Core Features
- ✅ User authentication and registration
- ✅ Family management with invite codes
- ✅ Real-time chat messaging
- ✅ Location tracking and sharing
- ✅ Safety alerts and notifications
- ✅ File upload and storage
- ✅ Calendar events and tasks
- ✅ Emotion tracking and analytics

### Sample Data
The migration system includes sample data for testing:
- Demo users with test accounts
- Sample families (family, friends, sharehouse)
- Test messages and conversations
- Location history for testing
- Calendar events and tasks

## 🔐 Authentication

### Demo Account
For testing without registration:
- **Email**: demo@bondarys.com
- **Password**: password

### Registration Flow
1. Marketing screen with app introduction
2. Multi-step signup process:
   - Username and email
   - Password setup
   - Family creation or joining
   - Personal information (optional)
   - Survey (optional)
3. Welcome animation
4. Home screen

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:3000/health

# Restart backend
cd backend
npm run dev
```

### Mobile App Issues
```bash
# Clear Expo cache
cd mobile
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache
```

### Database Issues
```bash
# Check migration status
cd backend
npm run migrate:status

# Run migrations
npm run migrate
```

## 📊 Application Features

### Authentication
- ✅ Multi-step signup flow
- ✅ Social login options (Google, Facebook, LINE)
- ✅ Password reset functionality
- ✅ Email verification

### Family Management
- ✅ Create new families
- ✅ Join existing families with invite codes
- ✅ Family member management
- ✅ Role-based permissions

### Real-time Features
- ✅ Chat messaging
- ✅ Location sharing
- ✅ Safety alerts
- ✅ Notifications

### UI/UX
- ✅ Modern gradient design
- ✅ Glassmorphism effects
- ✅ Smooth animations
- ✅ Responsive layout
- ✅ Custom fonts (Prompt for Thai, Darker Grotesque for English)

## 🎨 Design System

### Color Palette
- **Primary**: #FA7272 (Coral Red)
- **Secondary**: #FFBBB4 (Light Pink)
- **Background**: Gradient from #FA7272 to #FFBBB4
- **Text**: White on gradients, dark on light backgrounds

### Typography
- **Thai Text**: Prompt font family
- **English Text**: Darker Grotesque font family
- **Fallback**: System fonts

## 🔄 Next Steps

1. **Complete Database Setup**: Configure Supabase credentials
2. **Run Migrations**: Set up the database schema
3. **Test Features**: Try the signup flow and family features
4. **Customize**: Modify colors, fonts, or features as needed

## 📞 Support

If you encounter any issues:
1. Check the console logs for errors
2. Verify all services are running
3. Check the health endpoints
4. Review the troubleshooting section above

---

**🎉 Your Bondarys application is ready to use!**

The backend is running and the mobile app is starting up. Once you configure the database, you'll have access to all the family management features.
