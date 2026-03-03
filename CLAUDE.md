# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Platform Overview

**UniApps** is a multi-tenant mobile platform consisting of three independently deployable services:

| Service | Directory | Port | Stack |
|---------|-----------|------|-------|
| **AppKit** (Admin Console) | `appkit/` | 3002 | Next.js 14 + Prisma + PostgreSQL |
| **Bondary Backend** (Mobile API) | `bondary-backend/` | 4000 | Express.js + TypeScript + Prisma |
| **Boundary App** (Mobile) | `boundary-app/` | 8081 | Expo 51 / React Native 0.74 |

**Naming conventions**: "AppKit" = admin panel/CMS; "Boundary" = mobile app; "bondarys" = legacy internal DB schema name.

---

## Commands

### AppKit (Next.js Admin Console)

```bash
cd appkit
npm run dev           # Start dev server (port 3001)
npm run build         # Production build
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run type-check    # TypeScript check (no emit)
npm run test          # Run Jest tests
npm run test:watch    # Jest in watch mode
npm run db:seed       # Seed database (tsx prisma/seed.ts)
npm run db:seed:sso   # Seed SSO providers
npm run db:reset      # Prisma migrate reset + re-seed
```

Database operations (from `appkit/`):
```bash
npx prisma db push       # Push schema changes
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open Prisma Studio (DB browser)
npx prisma migrate dev   # Create migration
```

### Bondary Backend (Mobile API)

```bash
cd bondary-backend
npm run dev          # nodemon + ts-node (hot reload)
npm run build        # tsc compile to dist/
npm run start        # node dist/server.js
npm run type-check   # TypeScript check
npm run db:push      # prisma db push
npm run db:generate  # prisma generate
npm run db:studio    # prisma studio
npm run db:migrate   # prisma migrate dev
```

### Boundary App (Mobile)

```bash
cd boundary-app
npm run start        # expo start (Expo Go)
npm run dev          # expo start --dev-client
npm run android      # expo run:android
npm run ios          # expo run:ios
npm run web          # expo start --web
npm run test         # Jest
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run i18n:validate  # Validate i18n keys
npm run i18n:sync      # Sync translation files
```

### Root-level (monorepo)

```bash
npm run dev:admin               # AppKit dev
npm run dev:boundary-backend    # Bondary Backend dev
npm run dev:boundary-app        # Boundary App (expo start)
npm run build:all               # Build all workspaces
npm run lint:all                # Lint all workspaces
npm run type-check:all          # Type-check all workspaces
```

### Infrastructure

```bash
docker-compose up -d                        # Start all services + infra
docker-compose up -d db redis minio         # Start only infra
docker-compose logs -f bondary-backend      # Service logs
```

---

## Architecture

### AppKit (`appkit/`)

Pure Next.js 14 App Router application. There is **no separate Express server** — all backend logic runs as Next.js API routes.

```
appkit/
├── prisma/
│   ├── schema.prisma       # Single schema for all three services (shared DB)
│   └── seed.ts             # Seeds admin@appkit.com and demo data
├── src/
│   ├── app/
│   │   ├── (admin)/        # Route group: all authenticated admin UI pages
│   │   │   ├── layout.tsx  # Admin shell (sidebar, header, auth guard)
│   │   │   ├── dashboard/
│   │   │   ├── applications/
│   │   │   ├── appearance/ # Mobile app branding/theme settings
│   │   │   ├── collections/
│   │   │   ├── settings/   # system settings (SSO, SMTP, auth, org, MFA, webhooks)
│   │   │   └── system/     # audit logs, API keys, 2FA
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── admin/  # Admin-facing API routes (users, roles, audit, etc.)
│   │   │       ├── auth/   # Authentication endpoints (login, me, app-config)
│   │   │       ├── applications/
│   │   │       ├── cms/
│   │   │       └── ...
│   │   ├── login/          # Login page (public)
│   │   └── oauth/          # OAuth callback handling
│   ├── components/         # React components organized by feature domain
│   │   ├── appearance/     # ~35 setting components for mobile app theming
│   │   ├── layout/         # AdminHeader, AdminSidebarRail, AdminNavigation
│   │   ├── applications/
│   │   ├── auth/
│   │   └── ...
│   ├── services/           # Client-side API fetchers (called from React components)
│   │   ├── adminService.ts # Admin user, role, permission CRUD
│   │   ├── authService.ts  # Login/logout, JWT storage
│   │   ├── identityService.ts
│   │   └── ...
│   ├── server/             # Server-side modules (used in API routes only)
│   │   ├── config/
│   │   │   └── env.ts      # Zod-validated env schema; exports `config`
│   │   ├── middleware/     # Express-style middleware adapted for Next.js API routes
│   │   │   ├── adminAuth.ts      # JWT validation for admin endpoints
│   │   │   ├── appScoping.ts     # Multi-tenant app resolution via X-App-ID header
│   │   │   └── tenantValidation.ts
│   │   ├── services/       # Server-side business logic (Prisma queries)
│   │   │   ├── ApplicationService.ts
│   │   │   ├── SSOProviderService.ts
│   │   │   └── ...
│   │   └── lib/
│   │       └── prisma.ts   # Prisma client singleton
│   ├── lib/
│   │   └── auth.ts         # authenticate() + hasPermission() helpers for API routes
│   ├── contexts/           # React context providers (PermissionContext, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── middleware.ts        # Next.js edge middleware (CORS headers, security headers)
│   └── styles/
└── next.config.js          # output: 'standalone', Sentry integration
```

**API route pattern** — all API routes in `src/app/api/` follow Next.js App Router conventions:
```ts
// src/app/api/v1/admin/users/route.ts
export async function GET(req: NextRequest) {
  const authResult = await authenticate(req);
  if ('error' in authResult) return NextResponse.json(..., { status: authResult.status });
  // business logic...
}
```

**Services layer split** — two distinct service layers:
- `src/services/*.ts` — client-side fetchers that call internal `/api/...` endpoints (used in React components/pages)
- `src/server/services/*.ts` — server-side Prisma queries (used only in API route handlers)

**Multi-tenancy**: Every request to the Bondary Backend must include `X-App-ID` header (application UUID) or `X-App-Slug`. The `appScoping` middleware resolves and caches the Application record and attaches it to `req.application`.

### Bondary Backend (`bondary-backend/`)

Express.js TypeScript server with cluster mode in production, Socket.io with Redis adapter for WebSockets.

```
bondary-backend/src/
├── server.ts           # Entry point, cluster mode, Socket.io setup
├── config/
│   └── env.ts          # Zod-validated env, exports `config`
├── routes/
│   ├── admin/          # Admin API routes (auth, config, identity, upload, entity)
│   ├── mobile/         # Mobile API routes (auth, social, circles, chat, billing, etc.)
│   ├── v1/             # Versioned router aggregating admin + mobile routes
│   └── health.ts
├── middleware/
│   ├── auth.ts         # JWT verification for mobile users
│   ├── adminAuth.ts    # JWT verification for admin users
│   ├── appScoping.ts   # X-App-ID / X-App-Slug tenant resolution
│   ├── tenantValidation.ts
│   └── ...
├── services/           # Business logic (Prisma queries)
│   ├── identityService.ts   # User identity, OAuth, SSO
│   ├── SSOProviderService.ts
│   ├── fileManagementService.ts
│   └── ...
└── socket/
    └── socketService.ts    # Socket.io event handlers
```

### Boundary App (`boundary-app/`)

Expo 51 / React Native 0.74 app with Redux Toolkit for state, React Navigation for routing, and i18next for internationalization.

```
boundary-app/src/
├── navigation/         # React Navigation stack/tab configuration
├── screens/            # Screen components per feature
├── components/         # Shared UI components
├── services/           # API calls to bondary-backend (axios)
├── store/              # Redux Toolkit slices + redux-persist
├── i18n/               # Translation files (i18next)
├── hooks/              # Custom hooks
└── config/             # API base URL, feature flags
```

### Database Schema (shared, single PostgreSQL)

The `appkit/prisma/schema.prisma` defines all models used across all services. Three logical groupings:

- **core schema**: `users`, `applications`, `files`, `notifications`, `subscriptions`, `oauthProviders`
- **admin schema**: `adminUsers`, `adminRoles`, `adminPermissions`, `adminActivityLogs`
- **bondarys schema**: `circles`, social features, chat, location

Both `appkit` and `bondary-backend` have their own `prisma/` directories pointing to the same database, but the `appkit/prisma/schema.prisma` is the authoritative/most up-to-date schema.

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL (PostGIS) | 5432 | Primary database |
| Redis | 6379 | Session cache, Socket.io adapter, rate limiting |
| MinIO | 9000/9001 | S3-compatible object storage (local dev) |

---

## Key Patterns & Conventions

**Environment validation**: Both `appkit` and `bondary-backend` use Zod schemas in `src/server/config/env.ts` / `src/config/env.ts` to validate env vars at startup. Import `config` from there rather than reading `process.env` directly.

**Authentication flow**:
- Admin users authenticate at `POST /api/v1/auth/login` → JWT with `type: 'admin'`
- Mobile users authenticate via bondary-backend → JWT with `type: 'user'`
- The `authenticate()` helper in `appkit/src/lib/auth.ts` validates admin JWTs and falls back to trusting verified JWT claims if DB lookup fails

**Application scoping**: The default app slug is `'appkit'`. The `X-App-ID` or `X-App-Slug` header is used for multi-tenant routing. Application records are cached in-memory for 5 minutes.

**Object storage**: Uses AWS SDK v3 configured to point to MinIO locally. S3 env vars can be prefixed `S3_` (preferred) or `AWS_` (legacy compat).

**Sentry integration**: AppKit wraps `next.config.js` with `withSentryConfig`. Only active when `SENTRY_AUTH_TOKEN` and `SENTRY_DSN` are set.

**Default admin credentials** (after seeding): `admin@appkit.com` / see `prisma/seed.ts`
