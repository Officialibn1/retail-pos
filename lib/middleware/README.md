# Middleware & Error Handling

## Authentication Middleware (`lib/middleware/auth.ts`)

### `requireAuth(request)`
Validates the `auth-token` cookie, verifies the JWT, and checks the session exists in the DB. Returns `{ request: AuthenticatedRequest }` on success or a `NextResponse` error on failure. Also blocks `BLOCKED` users at this layer.

### `requireRoles(roles[])` / helpers
Factory that returns a role-check function. Returns `null` if the user has a matching role, or a `403 NextResponse` otherwise.

```typescript
requireSuperAdmin()       // SUPERADMIN only
requireManager()          // SUPERADMIN | MANAGER
requireCategoryManager()  // SUPERADMIN | MANAGER | ADMIN
requireCustomerManager()  // SUPERADMIN | MANAGER | ADMIN
requireAnyRole()          // any authenticated role
```

### Route protection pattern

```typescript
export async function POST(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Role (if needed)
  const roleCheck = requireSuperAdmin()(authResult.request);
  if (roleCheck) return roleCheck;

  // 3. Mutation status (blocks SUSPENDED users from writes)
  const statusCheck = await requireActiveMutation(authResult.request.user.id);
  if (statusCheck) return statusCheck;

  // ... route logic
}
```

## User Status Middleware (`lib/middleware/user-status.ts`)

| Function | Blocks |
|---|---|
| `requireActiveMutation(userId)` | SUSPENDED + BLOCKED users (use on POST/PUT/DELETE) |
| `requireActiveAccess(userId)` | BLOCKED users only (use on GET if needed) |

## Error Handling (`lib/errors.ts`)

All errors follow this response shape:
```json
{ "error": { "message": "...", "code": "ERROR_CODE", "details": {} } }
```

### `handleError(error, context)` — recommended catch-all

Automatically detects Zod errors, Prisma errors, and generic errors:
```typescript
} catch (error) {
  return handleError(error, "POST /api/users");
}
```

### `withErrorHandling(handler, context)` — wrapper

```typescript
export const POST = withErrorHandling(async (request) => {
  // errors caught automatically
}, "POST /api/users");
```

### Specific handlers

```typescript
handleValidationError(zodError)
handlePrismaError(prismaError, context)
handleNotFoundError("User", id)          // → 404
handleAuthenticationError("message")     // → 401
handleAuthorizationError("message")      // → 403
handleBusinessRuleError("message", data) // → 422
```

### Error codes

| Code | Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod schema failure |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `FORBIDDEN` | 403 | Insufficient role |
| `USER_BLOCKED` | 403 | Account blocked |
| `USER_SUSPENDED` | 403 | Account suspended (mutations only) |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Unique constraint violation |
| `BUSINESS_RULE_VIOLATION` | 422 | Domain logic failure |
| `INSUFFICIENT_STOCK` | 422 | Not enough inventory |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

Internal errors are logged server-side with full context but return only a generic message to the client.
