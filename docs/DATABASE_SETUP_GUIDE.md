# Database Setup Guide for CMS Implementation

This guide will help you set up the database and run the CMS migrations for the Bondarys application.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase CLI** (for local development)
3. **PostgreSQL** (if using local setup)

## Option 1: Local Supabase Setup (Recommended for Development)

### 1. Install Supabase CLI

```bash
# Windows (using Chocolatey)
choco install supabase

# Or using npm
npm install -g supabase

# Or using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Initialize Supabase Project

```bash
# Navigate to your project root
cd bondarys

# Initialize Supabase
supabase init

# Start local Supabase instance
supabase start
```

### 3. Run CMS Migrations

Once Supabase is running locally, you can run the migrations:

```bash
cd backend
node run-migrations-manual.js
```

## Option 2: Cloud Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Update Environment Variables

Create or update `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Migrations

```bash
cd backend
npm run migrate
```

## Option 3: Manual SQL Execution

If you prefer to run the SQL manually:

### 1. Access Your Database

- **Local Supabase**: Go to http://localhost:54323 (Supabase Studio)
- **Cloud Supabase**: Go to your project dashboard → SQL Editor

### 2. Execute Migration Files

Run the following SQL files in order:

1. `backend/src/database/migrations/005_cms_content_tables.sql`
2. `backend/src/database/migrations/006_marketing_cms_content.sql`
3. `backend/src/database/migrations/007_modal_marketing_cms.sql`
4. `backend/src/database/migrations/008_localization_cms.sql`
5. `backend/src/database/migrations/009_comprehensive_admin_cms.sql`

## Migration Files Overview

### 005_cms_content_tables.sql
- Creates basic CMS content tables
- Content types, categories, content meta
- Content interactions and analytics

### 006_marketing_cms_content.sql
- Marketing-specific content types
- Marketing content table
- Default marketing content

### 007_modal_marketing_cms.sql
- Modal marketing content management
- Analytics and interaction tracking
- Trigger conditions and display settings

### 008_localization_cms.sql
- Multi-language support
- Translation keys and translations
- Language management
- Default languages and translations

### 009_comprehensive_admin_cms.sql
- Admin roles and permissions
- House management
- Social media accounts
- Application settings
- System notifications

## Verification

After running migrations, verify the setup:

### 1. Check Tables Created

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%cms%' 
OR table_name LIKE '%marketing%' 
OR table_name LIKE '%localization%' 
OR table_name LIKE '%admin%';
```

### 2. Test API Endpoints

```bash
# Test marketing content
curl http://localhost:3000/cms/marketing/slides

# Test localization
curl http://localhost:3000/cms/localization/languages

# Test admin dashboard
curl http://localhost:3000/admin/dashboard/stats
```

### 3. Check Admin Console

1. Start the admin console:
```bash
cd admin
npm start
```

2. Navigate to http://localhost:3001
3. Test the CMS management interfaces

## Troubleshooting

### Common Issues

1. **"supabaseUrl is required"**
   - Make sure environment variables are set correctly
   - Check that Supabase is running locally

2. **"fetch failed"**
   - Ensure Supabase is running on port 54321
   - Check firewall settings

3. **Migration errors**
   - Check SQL syntax in migration files
   - Ensure previous migrations completed successfully
   - Check database permissions

### Debug Steps

1. **Test Database Connection**
```bash
cd backend
node test-db-connection.js
```

2. **Check Environment Variables**
```bash
cd backend
node test-supabase.js
```

3. **Verify Supabase Status**
```bash
supabase status
```

## Next Steps

After successful migration:

1. **Start the Backend Server**
```bash
cd backend
npm start
```

2. **Start the Admin Console**
```bash
cd admin-console
npm start
```

3. **Test Mobile App Integration**
```bash
cd mobile
npm start
```

4. **Create Admin User**
   - Use the admin console to create your first admin user
   - Set up roles and permissions

5. **Configure Content**
   - Add marketing content
   - Set up translations
   - Configure application settings

## Support

If you encounter issues:

1. Check the logs in `backend/logs/`
2. Verify database connectivity
3. Ensure all environment variables are set
4. Check Supabase service status

The CMS implementation is now ready for use with full content management, localization, and administrative capabilities!
