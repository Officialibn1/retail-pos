# Testing Setup

This document describes the testing configuration for the project.

## Test Framework

The project uses **Jest** as the testing framework with the following setup:

### Installed Packages

```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest
```

### Configuration Files

1. **jest.config.js** - Main Jest configuration

   - Uses Next.js Jest configuration
   - Test environment: jsdom
   - Module path aliases (@/ → root)
   - Excludes verification scripts from test runs

2. **jest.setup.js** - Test environment setup
   - Imports @testing-library/jest-dom for DOM matchers
   - Polyfills TextEncoder/TextDecoder for Prisma compatibility
   - Mocks Next.js router (useRouter, usePathname, useSearchParams)
   - Mocks window.matchMedia for responsive design tests
   - Mocks localStorage for persistence tests

## Running Tests

### Available Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- path/to/test.test.ts

# Run tests silently (less output)
pnpm test -- --silent
```

### Test File Patterns

Jest will run files matching these patterns:

- `**/__tests__/**/*.test.[jt]s?(x)`
- `**/?(*.)+(spec|test).[jt]s?(x)`

**Note:** Verification scripts (`verify-*.ts`) are excluded from test runs.

## Test Structure

### Unit Tests

Located in `__tests__` directories next to the code they test:

- `lib/store/slices/__tests__/authSlice.test.ts`
- `lib/store/slices/__tests__/cartSlice.test.ts`

### Verification Scripts

TypeScript scripts that can be run directly with `tsx`:

- `lib/store/api/__tests__/verify-auth-endpoints.ts`
- `lib/store/api/__tests__/verify-sales-endpoints.ts`
- `lib/store/api/__tests__/verify-user-endpoints.ts`

Run verification scripts with:

```bash
npx tsx path/to/verify-script.ts
```

## Known Issues

### Redux Serialization Warnings

When testing Redux slices with Date objects, you may see warnings about non-serializable values:

```
A non-serializable value was detected in the state, in the path: `auth.user.createdAt`
```

These warnings are expected in tests and can be safely ignored. In production, dates should be stored as ISO strings.

## Writing Tests

### Example Test Structure

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';

describe('Auth Slice', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  };

  it('should handle setUser', () => {
    const store = createTestStore();
    const mockUser = { id: '1', email: 'test@example.com', ... };

    store.dispatch(setUser(mockUser));
    const state = store.getState().auth;

    expect(state.user).toEqual(mockUser);
  });
});
```

### Best Practices

1. **Isolate tests** - Each test should create its own store instance
2. **Test behavior** - Focus on what the code does, not how it does it
3. **Use descriptive names** - Test names should clearly describe what they test
4. **Mock external dependencies** - Use Jest mocks for API calls, timers, etc.
5. **Keep tests simple** - One assertion per test when possible

## Coverage

To generate a coverage report:

```bash
pnpm test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Troubleshooting

### TextEncoder is not defined

If you see this error, ensure `jest.setup.js` includes the TextEncoder polyfill:

```javascript
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

### Module not found errors

Check that path aliases are correctly configured in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Tests timing out

Increase the test timeout in your test file:

```typescript
jest.setTimeout(10000); // 10 seconds
```
