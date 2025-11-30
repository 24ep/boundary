# Database Setup Quick Start

## Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Environment variables set:**
   ```bash
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Initial Setup

### 1. Initialize Supabase (if not done)

```bash
cd supabase
supabase init
```

### 2. Convert Existing Migrations

```bash
cd backend
npm run migrate:convert
```

This will:
- Convert numbered migrations to timestamped format
- Move them to `supabase/migrations/`
- Preserve UP/DOWN sections

### 3. Review Migrations

```bash
cd supabase
supabase migration list
```

### 4. Test Locally

```bash
# Reset database and apply all migrations + seed
supabase db reset
```

## Daily Workflow

### Creating a New Migration

```bash
# Option 1: Using Supabase CLI (Recommended)
cd supabase
supabase migration new add_user_preferences

# Option 2: Using custom script
cd backend
npm run migrate:create add_user_preferences
```

### Running Migrations

```bash
# Local development
supabase db push

# Or using custom service
cd backend
npm run migrate:ts migrate
```

### Checking Status

```bash
# Supabase CLI
supabase migration list

# Custom service
cd backend
npm run migrate:status
```

### Seed Data

```bash
# Seed runs automatically with db reset
supabase db reset

# Or validate seed file
cd backend
npm run seed:validate
```

## Production Deployment

### 1. Review Migrations

```bash
supabase migration list
```

### 2. Apply Migrations

```bash
supabase db push --linked
```

### 3. Verify

```bash
supabase migration list
```

## Common Commands

```bash
# Migrations
supabase migration new <name>     # Create migration
supabase db push                   # Apply migrations
supabase db reset                  # Reset (dev only)
supabase migration list            # List migrations

# Custom scripts
npm run migrate:ts migrate         # Run migrations
npm run migrate:status            # Check status
npm run migrate:rollback           # Rollback
npm run migrate:create <name>      # Create migration
npm run migrate:validate           # Validate migrations

# Seed
npm run seed:validate              # Validate seed file
npm run seed:clear                  # Clear seed data
```

## Troubleshooting

### Migration Already Exists

```bash
# Check what's executed
supabase migration list

# If migration is already applied, create a new one for changes
```

### Seed Data Conflicts

```bash
# Clear and re-seed
npm run seed:clear
supabase db reset
```

### Schema Drift

```bash
# Generate migration from current state
supabase db diff -f fix_drift

# Review and apply
supabase db push
```

## Next Steps

1. ✅ Convert existing migrations
2. ✅ Set up Supabase migrations folder
3. ✅ Create seed file
4. ✅ Test locally
5. ✅ Set up CI/CD
6. ✅ Document team workflow

---

For detailed information, see `DATABASE_MIGRATION_GUIDE.md`

