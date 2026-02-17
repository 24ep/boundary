# Quick Start Guide - New Best Practices

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run Linting
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format

# Check TypeScript
npm run type-check
```

## 📝 Using New Features

### TypeScript Path Aliases

You can now use clean imports:
```typescript
// Before
import Button from '../../../components/Button';

// After
import Button from '@components/Button';
```

Available aliases:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@screens/` → `src/screens/`
- `@services/` → `src/services/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@constants/` → `src/constants/`
- `@hooks/` → `src/hooks/`
- `@contexts/` → `src/contexts/`

### Redux Toolkit Usage

#### Using Typed Hooks
```typescript
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { loginSuccess, logout } from '@store/slices/authSlice';
import { selectUser, selectIsAuthenticated } from '@store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const handleLogin = () => {
    dispatch(loginSuccess(userData));
  };
}
```

#### Available Slices
- `authSlice` - Authentication state
- `familySlice` - Family management
- `chatSlice` - Chat and messaging
- `locationSlice` - Location tracking
- `safetySlice` - Safety features

## 🔧 Common Tasks

### Format Code
```bash
npm run format
```

### Check Types
```bash
npm run type-check
```

### Run Tests
```bash
npm test
npm run test:coverage
```

## ⚠️ Important Notes

1. **Context API Still Works**: Your existing Context API code continues to work. Redux is available for new features or gradual migration.

2. **TypeScript Strict Mode**: Some existing code may have type errors. Fix them gradually.

3. **Linting**: Expect some linting errors initially. Most can be auto-fixed with `npm run lint:fix`.

4. **Path Aliases**: If path aliases don't work, you may need to configure Metro bundler (see `metro.config.js`).

## 📚 Documentation

- `TECH_STACK_REVIEW.md` - Full technology stack review
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `IMPLEMENTATION_SUMMARY.md` - Summary of changes
- `src/store/README.md` - Redux store documentation

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Run linting and fix issues
3. ✅ Review TypeScript errors
4. ⏳ Consider UI library migration (Native Base → React Native Paper)
5. ⏳ Plan React Native upgrade
6. ⏳ Add error tracking (Sentry)

---

**Need Help?** Check the detailed guides in the documentation files.

