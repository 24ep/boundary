# Backend Setup Scripts

This folder contains ordered setup scripts for the Bondarys backend.

## Setup Order

Run these scripts in order from the repository root:

1. **01-env-setup.js** - Creates root .env file, installs dependencies, creates logs directory
2. **02-exec-sql-setup.js** - Creates exec_sql function in database
3. **03-run-cms-migrations.js** - Complete CMS setup with migrations and verification

## Usage

```bash
# Run all setup scripts in order
node backend/setup/01-env-setup.js
node backend/setup/02-exec-sql-setup.js
node backend/setup/03-run-cms-migrations.js
```

## Prerequisites

- Node.js installed
- Supabase project configured
- Docker (for local Supabase)

## Environment Variables

All scripts use the root `.env` file. Update with your actual Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
```

## What Each Script Does

### 01-env-setup.js
- Creates comprehensive `.env` file with all required variables
- Installs backend dependencies
- Creates logs directory
- Validates required environment variables

### 02-exec-sql-setup.js
- Creates the `exec_sql` function in the database
- Required for Supabase RPC-based migrations

### 03-run-cms-migrations.js
- Complete CMS setup and verification
- Runs all database migrations
- Tests database connection
- Verifies CMS tables and API endpoints
- Provides comprehensive setup feedback
