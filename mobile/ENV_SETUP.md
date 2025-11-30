# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `mobile` directory with the following variables:

```bash
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration (Required)
EXPO_PUBLIC_API_URL=https://your-api-domain.com

# Application Configuration
EXPO_PUBLIC_APP_NAME=Bondarys
EXPO_PUBLIC_APP_VERSION=1.0.0

# Social Authentication (Optional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
EXPO_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id

# Push Notifications (Optional)
EXPO_PUBLIC_PUSH_NOTIFICATION_KEY=your_push_notification_key

# Analytics & Monitoring (Optional)
EXPO_PUBLIC_ANALYTICS_KEY=your_analytics_key
EXPO_PUBLIC_ERROR_REPORTING_KEY=your_error_reporting_key

# Feature Flags (Optional - defaults shown)
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_LOCATION_SERVICES=true
```

## Validation

Before building, validate your environment variables:

```bash
npm run validate:env
```

This will check that all required variables are set and fail the build if any are missing.

## Important Notes

1. **Never commit `.env` files** - They contain sensitive information
2. **Use `.env.example`** - Create a template without sensitive values
3. **CI/CD** - Set environment variables as GitHub secrets for CI/CD
4. **Expo** - All variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app

## CI/CD Setup

For GitHub Actions, add these as secrets:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL`

The CI workflow will use these for validation.

