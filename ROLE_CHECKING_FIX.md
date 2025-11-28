# Role Checking Logic Fix

## Summary

Fixed the role checking logic throughout the application to properly handle users with multiple roles (stored as an array in the database).

## Problem

The application was inconsistently checking user roles:

1. Some components were checking only the first role (`user.roles`)
2. Some were trying to use `includes()` on an array when expecting a single value
3. String literals were used instead of the `UserRole` enum in some places
4. The `user.role` property doesn't exist (it's `user.roles` as an array)

## Changes Made

### 1. `components/auth/role-guard.tsx`

**Before:**

```typescript
if (!user || !allowedRoles.includes(user.roles)) {
	return <>{fallback}</>;
}
```

**After:**

```typescript
const hasAllowedRole = user?.roles.some((role) => allowedRoles.includes(role));

if (!user || !hasAllowedRole) {
	return <>{fallback}</>;
}
```

### 2. `components/auth/protected-route.tsx`

**Before:**

```typescript
if (allowedRoles && !allowedRoles.includes(user.role)) {
	// Access denied
}
```

**After:**

```typescript
const hasAllowedRole = allowedRoles
	? user.roles.some((role) => allowedRoles.includes(role))
	: true;

if (allowedRoles && !hasAllowedRole) {
	// Access denied
}
```

### 3. `lib/auth.ts`

Updated all permission checking functions to accept and check arrays of roles:

**Before:**

```typescript
export function canManageUsers(userRole: UserRole): boolean {
	return userRole === "SuperAdmin";
}
```

**After:**

```typescript
export function canManageUsers(userRoles: UserRole[]): boolean {
	return userRoles.includes("SUPERADMIN");
}
```

Also fixed the role enum values from `"SuperAdmin"` to `"SUPERADMIN"` to match the database schema.

### 4. `components/dashboard/dashboard-sidebar.tsx`

**Before:**

```typescript
roles: ["SUPERADMIN", "MANAGER"] as const,
```

**After:**

```typescript
import { UserRole } from "@/lib/types";
roles: [UserRole.SUPERADMIN, UserRole.MANAGER] as const,
```

### 5. `app/dashboard/settings/page.tsx`

**Before:**

```typescript
{user.role === "SuperAdmin" && (
  // Security settings
)}
```

**After:**

```typescript
{user.roles.includes("SUPERADMIN") && (
  // Security settings
)}
```

### 6. `app/dashboard/users/page.tsx`

**Before:**

```typescript
if (user && canManageUsers(user.roles)) {
	fetchUsers();
}
```

**After:**

```typescript
if (user && canManageUsers(user.roles)) {
	fetchUsers();
}
```

### 7. `app/dashboard/inventory/page.tsx`

**Before:**

```typescript
<ProtectedRoute allowedRoles={["SUPERADMIN", "MANAGER"]}>
```

**After:**

```typescript
import { UserRole } from "@/lib/types";
<ProtectedRoute allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]}>
```

## How It Works Now

### Role Checking Logic

The application now properly checks if a user has **at least one** of the required roles:

```typescript
// Check if user has any of the allowed roles
const hasAllowedRole = user.roles.some((role) => allowedRoles.includes(role));
```

This means:

- A user with `[SUPERADMIN, MANAGER]` can access pages requiring `SUPERADMIN` OR `MANAGER`
- A user with `[CASHIER]` cannot access pages requiring `MANAGER`
- The check is flexible and supports multiple roles per user

### Middleware (Already Correct)

The middleware in `lib/middleware/auth.ts` was already correctly implemented:

```typescript
export function requireRoles(requiredRoles: UserRole[]) {
	return (authenticatedRequest: AuthenticatedRequest): NextResponse | null => {
		const userRoles = authenticatedRequest.user.roles;

		// Check if user has at least one of the required roles
		const hasRequiredRole = requiredRoles.some((role) =>
			userRoles.includes(role),
		);

		if (!hasRequiredRole) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 },
			);
		}

		return null;
	};
}
```

## Testing

All TypeScript diagnostics pass with no errors. The role checking logic now:

1. ✅ Properly handles arrays of roles
2. ✅ Uses the correct `UserRole` enum values
3. ✅ Checks if users have at least one required role
4. ✅ Is consistent across all components and utilities

## Database Schema

The Prisma schema correctly defines roles as an array:

```prisma
model User {
  roles UserRole[] @default([CASHIER])
}

enum UserRole {
  SUPERADMIN
  ADMIN
  MANAGER
  CASHIER
}
```

This allows users to have multiple roles simultaneously, providing flexibility for permission management.
