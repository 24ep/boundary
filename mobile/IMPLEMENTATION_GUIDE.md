# Implementation Guide - Best Practices

This guide provides step-by-step instructions for implementing the recommended best practices.

## Quick Start

### 1. Install New Dependencies

```bash
cd mobile
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks prettier
```

### 2. Verify Configuration

The following files have been created/updated:
- ✅ `tsconfig.json` - Enhanced TypeScript configuration
- ✅ `.eslintrc.js` - ESLint configuration
- ✅ `.prettierrc.js` - Prettier configuration
- ✅ `.prettierignore` - Prettier ignore file
- ✅ `.eslintignore` - ESLint ignore file
- ✅ `package.json` - Updated with linting scripts and dependencies

### 3. Run Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code
npm run format

# Check TypeScript types
npm run type-check
```

## Migration Steps

### Phase 1: Code Quality (Immediate)

1. **Install dependencies** (see above)
2. **Run linting** to identify issues:
   ```bash
   npm run lint
   ```
3. **Fix auto-fixable issues**:
   ```bash
   npm run lint:fix
   ```
4. **Format all code**:
   ```bash
   npm run format
   ```
5. **Fix TypeScript errors**:
   ```bash
   npm run type-check
   ```

### Phase 2: Redux Toolkit Migration

1. **Create slice files** for each domain:
   - `src/store/slices/authSlice.ts`
   - `src/store/slices/familySlice.ts`
   - `src/store/slices/chatSlice.ts`
   - `src/store/slices/locationSlice.ts`
   - `src/store/slices/safetySlice.ts`

2. **Use the example** in `src/store/slices/authSlice.example.ts` as a template

3. **Update store.ts**:
   ```typescript
   import { configureStore } from '@reduxjs/toolkit';
   import { persistStore, persistReducer } from 'redux-persist';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { combineReducers } from '@reduxjs/toolkit';
   
   import authReducer from './slices/authSlice';
   import familyReducer from './slices/familySlice';
   // ... other slices
   
   const rootReducer = combineReducers({
     auth: authReducer,
     family: familyReducer,
     // ... other reducers
   });
   
   const persistConfig = {
     key: 'root',
     storage: AsyncStorage,
     whitelist: ['auth', 'family'],
   };
   
   const persistedReducer = persistReducer(persistConfig, rootReducer);
   
   export const store = configureStore({
     reducer: persistedReducer,
     middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware({
         serializableCheck: {
           ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
         },
       }),
   });
   
   export const persistor = persistStore(store);
   export type RootState = ReturnType<typeof store.getState>;
   export type AppDispatch = typeof store.dispatch;
   ```

4. **Create typed hooks**:
   ```typescript
   // src/store/hooks.ts
   import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
   import type { RootState, AppDispatch } from './store';
   
   export const useAppDispatch = () => useDispatch<AppDispatch>();
   export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
   ```

### Phase 3: UI Library Migration

**Option A: React Native Paper** (Recommended for Material Design)

```bash
npm install react-native-paper react-native-vector-icons
```

**Option B: NativeWind** (Recommended for Tailwind CSS)

```bash
npm install nativewind tailwindcss
npx tailwindcss init
```

**Option C: Tamagui** (Recommended for Performance)

```bash
npm install @tamagui/core @tamagui/config
```

### Phase 4: Error Tracking

1. **Install Sentry**:
   ```bash
   npm install @sentry/react-native
   ```

2. **Initialize in App.tsx**:
   ```typescript
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN',
     enableInExpoDevelopment: false,
     debug: __DEV__,
   });
   ```

3. **Update ErrorBoundary**:
   ```typescript
   import * as Sentry from '@sentry/react-native';
   
   class ErrorBoundary extends React.Component {
     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
       Sentry.captureException(error, {
         contexts: {
           react: {
             componentStack: errorInfo.componentStack,
           },
         },
       });
     }
   }
   ```

### Phase 5: Testing

1. **Add test files** for critical components:
   ```typescript
   // src/components/__tests__/Button.test.tsx
   import { render, fireEvent } from '@testing-library/react-native';
   import Button from '../Button';
   
   describe('Button', () => {
     it('renders correctly', () => {
       const { getByText } = render(<Button>Press me</Button>);
       expect(getByText('Press me')).toBeTruthy();
     });
   });
   ```

2. **Run tests**:
   ```bash
   npm test
   npm run test:coverage
   ```

## Pre-commit Hooks (Optional but Recommended)

Install husky and lint-staged:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

Create `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

## CI/CD Integration

Add to your CI pipeline (GitHub Actions example):

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run format:check
      - run: npm test
```

## Common Issues & Solutions

### Issue: ESLint not finding React Native rules

**Solution**: The current ESLint config uses Expo's base config which includes React Native rules. If you need more, install:
```bash
npm install --save-dev eslint-plugin-react-native
```

### Issue: TypeScript path aliases not working

**Solution**: Ensure Metro bundler is configured. Add to `metro.config.js`:
```javascript
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  // ... other aliases
};

module.exports = config;
```

### Issue: Prettier conflicts with ESLint

**Solution**: Ensure `eslint-config-prettier` is last in the `extends` array in `.eslintrc.js`.

## Next Steps

1. ✅ Complete Phase 1 (Code Quality)
2. ⏳ Plan Phase 2 (Redux Migration)
3. ⏳ Research UI Library options
4. ⏳ Set up error tracking
5. ⏳ Add tests incrementally

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

