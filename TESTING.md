# Testing

## Test Credentials

After seeding the database (`pnpm db:seed`), use these accounts:

| Role       | Email                  | Password    | Permissions                                        |
| ---------- | ---------------------- | ----------- | -------------------------------------------------- |
| SUPERADMIN | superadmin@pos.com     | password123 | Full access, user management                       |
| MANAGER    | manager@pos.com        | password123 | All data, inventory, analytics, activity logs      |
| ADMIN      | admin@pos.com          | password123 | Own sales, categories, customers                   |
| CASHIER    | cashier@pos.com        | password123 | Own sales and checkout only                        |

> ⚠️ These credentials are for development only. Never use them in production.

See `prisma/SEED_README.md` to understand what data gets seeded.

---

## Test Framework

The project uses **Jest** with `@testing-library/react`.

### Commands

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report (output in coverage/)
```

### Configuration

- `jest.config.js` — Next.js Jest config, jsdom environment, `@/` path alias
- `jest.setup.js` — jest-dom matchers, TextEncoder polyfill, Next.js router mocks, localStorage mock

### Test file locations

| Type | Pattern | Example |
|---|---|---|
| Unit tests | `__tests__/*.test.ts(x)` | `lib/store/slices/__tests__/authSlice.test.ts` |
| Verification scripts (manual) | `__tests__/verify-*.ts` | `lib/store/api/__tests__/verify-user-endpoints.ts` |

Verification scripts are excluded from Jest runs. Run them manually with:
```bash
npx tsx lib/store/api/__tests__/verify-user-endpoints.ts
```

### Writing tests

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setUser } from "../authSlice";

describe("Auth Slice", () => {
  it("should set user", () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(setUser({ id: "1", email: "test@example.com", /* ... */ }));
    expect(store.getState().auth.user?.email).toBe("test@example.com");
  });
});
```

### Known issue — Redux Date serialization warnings

Tests that put `Date` objects in Redux state will show:
```
A non-serializable value was detected in the state, in the path: `auth.user.createdAt`
```
This is expected in tests. In production, dates are serialized as ISO strings.

### Troubleshooting

| Error | Fix |
|---|---|
| `TextEncoder is not defined` | Ensure `jest.setup.js` includes the `util` polyfill |
| Module not found `@/...` | Check `moduleNameMapper` in `jest.config.js` |
| Tests timing out | Add `jest.setTimeout(10000)` at the top of the test file |
