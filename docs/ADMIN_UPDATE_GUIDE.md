# 🎛️ Admin Update Guide - Bondarys CMS

## 🚀 How to Update as an Admin

### **Step 1: Access Admin Console**
```bash
# Start the backend server
cd backend
node simple-server.js

# Start the admin console (in new terminal)
cd admin
npm run dev
```

**Open:** `http://localhost:3001`

### **Step 2: Navigate to CMS Management**
1. Click **"CMS Manager"** (green button)
2. Click **"Marketing CMS"** (purple button)
3. Access different CMS sections

## 🎯 Admin Update Features

### **1. Translation Management**

#### **Add New Language**
1. Go to **Languages** tab
2. Click **"Add Language"**
3. Fill in details:
   ```
   Code: es
   Name: Spanish
   Native Name: Español
   RTL: No
   Active: Yes
   ```
4. Click **"Save"**

#### **Update Existing Translations**
1. Go to **Translations** tab
2. Select language from dropdown
3. Find translation key
4. Update the value
5. Click **"Save"**

#### **Add New Translation Keys**
1. Go to **Translation Keys** tab
2. Click **"Add Key"**
3. Fill in details:
   ```
   Key: settings.privacy
   Context: mobile_app
   Category: settings
   Description: Privacy settings title
   ```
4. Click **"Save"**

### **2. Marketing Content Management**

#### **Create Marketing Slide**
1. Go to **Marketing Content** tab
2. Click **"Add Slide"**
3. Fill in details:
   ```
   Title: Welcome to Bondarys
   Description: Your family management app
   Image URL: https://example.com/image.jpg
   Button Text: Get Started
   Button URL: /onboarding
   Order: 1
   Active: Yes
   ```
4. Click **"Save"**

#### **Update Modal Marketing**
1. Go to **Modal Marketing** tab
2. Click **"Add Modal"**
3. Configure:
   ```
   Title: Special Offer
   Content: Get 50% off premium features
   Type: popup
   Trigger: immediate
   Target: all_users
   Active: Yes
   ```
4. Click **"Save"**

### **3. User Management**

#### **Create Admin User**
1. Go to **Admin Users** tab
2. Click **"Add Admin"**
3. Fill in details:
   ```
   Name: John Doe
   Email: john@example.com
   Role: super_admin
   Permissions: all
   Active: Yes
   ```
4. Click **"Save"**

#### **Manage User Roles**
1. Go to **Roles** tab
2. Click **"Add Role"**
3. Configure permissions:
   ```
   Name: content_manager
   Permissions: 
   - manage_content: true
   - manage_translations: true
   - view_analytics: true
   - manage_users: false
   ```
4. Click **"Save"**

### **4. House Management**

#### **Add New House**
1. Go to **Houses** tab
2. Click **"Add House"**
3. Fill in details:
   ```
   Name: Smith Family Home
   Address: 123 Main St, City, State
   Type: single_family
   Status: active
   Owner: John Smith
   ```
4. Click **"Save"**

#### **Update House Information**
1. Find house in list
2. Click **"Edit"**
3. Update information
4. Click **"Save"**

### **5. Social Media Management**

#### **Add Social Account**
1. Go to **Social Media** tab
2. Click **"Add Account"**
3. Configure:
   ```
   Platform: Facebook
   Account Name: Bondarys Official
   URL: https://facebook.com/bondarys
   Status: active
   Manager: admin@bondarys.com
   ```
4. Click **"Save"**

#### **Monitor Social Activity**
1. View social media dashboard
2. Check engagement metrics
3. Review recent posts
4. Update account status

### **6. Application Settings**

#### **Update System Settings**
1. Go to **Settings** tab
2. Update configuration:
   ```
   App Name: Bondarys
   Version: 1.0.0
   Maintenance Mode: No
   Feature Flags:
   - new_ui: true
   - beta_features: false
   - analytics: true
   ```
3. Click **"Save"**

#### **Configure Notifications**
1. Go to **Notifications** tab
2. Set up alerts:
   ```
   Email Notifications: Yes
   Push Notifications: Yes
   SMS Notifications: No
   Alert Types: system, security, updates
   ```
3. Click **"Save"**

## 🔧 API Endpoints for Admin Updates

### **Translation Management**
```bash
# Get all languages
GET /cms/localization/languages

# Get translations for language
GET /cms/localization/translations/en

# Create translation key
POST /cms/localization/keys
{
  "key": "settings.privacy",
  "context": "mobile_app",
  "description": "Privacy settings"
}

# Add translation
POST /cms/localization/translations
{
  "key_id": "key-id",
  "language_id": "language-id",
  "value": "Privacy Settings"
}
```

### **Marketing Content**
```bash
# Get marketing slides
GET /cms/marketing/slides

# Create marketing slide
POST /cms/marketing/slides
{
  "title": "Welcome to Bondarys",
  "description": "Your family app",
  "image_url": "https://example.com/image.jpg",
  "button_text": "Get Started",
  "button_url": "/onboarding",
  "order": 1,
  "is_active": true
}
```

### **Admin Management**
```bash
# Get dashboard stats
GET /admin/dashboard/stats

# Get admin users
GET /admin/users

# Create admin user
POST /admin/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "permissions": ["manage_content", "manage_translations"]
}
```

## 📊 Admin Dashboard Features

### **1. Real-time Statistics**
- Total users
- Active families
- Content items
- Translation completion
- System health

### **2. Recent Activity**
- User actions
- Content updates
- Translation changes
- System events

### **3. Quick Actions**
- Add new content
- Update translations
- Manage users
- Configure settings

## 🎯 Bulk Operations

### **Import Translations**
1. Go to **Translations** tab
2. Click **"Import"**
3. Upload CSV file:
   ```
   key,en,th,zh,ja,ko,vi,hi,ar
   common.welcome,Welcome,ยินดีต้อนรับ,欢迎,ようこそ,환영합니다,Chào mừng,स्वागत,مرحباً
   common.error,Error,ข้อผิดพลาด,错误,エラー,오류,Lỗi,त्रुटि,خطأ
   ```
4. Click **"Import"**

### **Export Translations**
1. Go to **Translations** tab
2. Click **"Export"**
3. Select languages
4. Download CSV file

### **Bulk Update Content**
1. Go to **Content** tab
2. Select multiple items
3. Click **"Bulk Actions"**
4. Choose action:
   - Activate/Deactivate
   - Change category
   - Update status
   - Delete

## 🚀 Quick Start Commands

### **Start All Services**
```bash
# Terminal 1: Backend
cd backend
node simple-server.js

# Terminal 2: Admin Console
cd admin
npm run dev

# Terminal 3: Mobile App
cd mobile
npm start
```

### **Test Admin Features**
```bash
# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/cms/localization/languages
curl http://localhost:3000/admin/dashboard/stats
```

## 🎉 Admin Update Complete!

As an admin, you can now:

✅ **Manage Translations** - Add languages, update translations  
✅ **Create Content** - Marketing slides, modals, notifications  
✅ **Manage Users** - Admin accounts, roles, permissions  
✅ **Configure Settings** - App settings, features, notifications  
✅ **Monitor Activity** - Dashboard, analytics, logs  
✅ **Bulk Operations** - Import/export, bulk updates  

The admin console provides a complete interface for managing all aspects of the Bondarys CMS system! 🎊
