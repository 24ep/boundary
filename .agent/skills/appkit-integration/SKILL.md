---
name: appkit-integration
description: Instructions and patterns for integrating AppKit (Identity, Auth, CMS) into applications.
---

# AppKit Integration Skill

## Core Architecture
The application is 100% driven by the `alphayard-appkit` SDK. All API transport, authentication, and state management for core features are consolidated within this unified SDK.

### Universal SDK Pattern
For features not yet having a dedicated module in the SDK (e.g., Chat, Shopping), use the universal `call()` method. This ensures all requests benefit from:
- **Unified Base URL**: Managed centrally by the SDK.
- **Automatic Auth**: Tokens are handled internally; no need to manually append headers.
- **401 Interceptor**: Automatic token refresh and request retry logic is built-in.
- **Type Safety**: Generic support for request/response types.

```typescript
import { appkit } from '../api/appkit';

// Generic call example
const data = await appkit.call<MyResponseType>('GET', '/api/custom-feature');
```

## Available Modules

### `appkit.auth`
Handles login, register, OTP, MFA, and session management.
- `login(credentials)`
- `loginWithOtp(identifier, otp)`
- `logout()`
- `refreshToken()`

### `appkit.identity`
Manages user profiles, security settings, and device management.
- `getProfile()`
- `updateProfile(updates)`
- `getSecuritySettings()`
- `revokeSession(sessionId)`

### `appkit.groups`
Manages Circles, memberships, and organizational structures.
- `getCircles()`
- `getCircleMembers(circleId)`
- `getCircleTypes()`

### `appkit.safety`
Handles emergency alerts and safety status.
- `getAlerts()`
- `triggerAlert(type, location)`
- `updateEmergencyContacts(contacts)`

### `appkit.legal`
Manages legal documents and user acceptances.
- `getPublishedDocuments()`
- `acceptDocument(documentId)`
- `getPendingAcceptances()`

### `appkit.branding`
Dynamic app configuration, themes, and assets.
- `getAppConfig()`
- `getTheme()`
- `getAssetsByType(type)`

### `appkit.cms`
Strapi-based content management integration.
- `getContent(slug)`
- `listContent(params)`
- `call(method, path, data)` // Direct Strapi access

## Best Practices
1. **Never use axios/fetch direct**: Always use `appkit.call()` or a dedicated module.
2. **Standardized Imports**: Always import from `alphayard-appkit` npm package.
3. **No Local Token Management**: Do not use `AsyncStorage` for tokens; the SDK handles `accessToken` and `refreshToken` securely.
4. **Unified Error Handling**: The SDK throws standard errors that can be caught globally.

## Reference Files
- Data Source: [docs.tsx](file:///e:/GitCloneProject/boundary/appkit/src/app/dev-hub/data/docs.tsx)
- Search UI: [DevHubSearch.tsx](file:///e:/GitCloneProject/boundary/appkit/src/app/dev-hub/components/DevHubSearch.tsx)
