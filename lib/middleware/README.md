# Authentication Middleware

This module provides authentication and authorization middleware for Next.js API routes.

## Usage

### Basic Authentication

To protect a route and require authentication:

```typescript
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
	// Require authentication
	const authResult = await requireAuth(request);

	// Check if authentication failed
	if (authResult instanceof Response) {
		return authResult; // Return error response
	}

	// Extract authenticated request
	const { request: authenticatedRequest } = authResult;

	// Access user information
	const user = authenticatedRequest.user;
	console.log(user.id, user.email, user.roles);

	// Your route logic here
	return Response.json({ message: "Success", user });
}
```

### Role-Based Authorization

To require specific roles:

```typescript
import { NextRequest } from "next/server";
import { requireAuth, requireRoles } from "@/lib/middleware";
import { UserRole } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
	// Require authentication
	const authResult = await requireAuth(request);
	if (authResult instanceof Response) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;

	// Require MANAGER role or higher
	const roleCheck = requireRoles([
		UserRole.SUPERADMIN,
		UserRole.ADMIN,
		UserRole.MANAGER,
	])(authenticatedRequest);

	if (roleCheck) {
		return roleCheck; // Return forbidden response
	}

	// User has required role, proceed with logic
	return Response.json({ message: "Authorized" });
}
```

### Using Helper Functions

For common role requirements:

```typescript
import { NextRequest } from "next/server";
import {
	requireAuth,
	requireSuperAdmin,
	requireManager,
} from "@/lib/middleware";

// SUPERADMIN only endpoint
export async function DELETE(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof Response) return authResult;

	const { request: authenticatedRequest } = authResult;

	const roleCheck = requireSuperAdmin()(authenticatedRequest);
	if (roleCheck) return roleCheck;

	// Only SUPERADMIN can reach here
	return Response.json({ message: "Admin action completed" });
}

// MANAGER or higher endpoint
export async function PUT(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof Response) return authResult;

	const { request: authenticatedRequest } = authResult;

	const roleCheck = requireManager()(authenticatedRequest);
	if (roleCheck) return roleCheck;

	// MANAGER, ADMIN, or SUPERADMIN can reach here
	return Response.json({ message: "Manager action completed" });
}
```

## Error Responses

### 401 Unauthorized

Returned when:

- No authentication token is provided
- Token is invalid or expired
- Session not found in database
- User no longer exists

Example response:

```json
{
	"error": {
		"message": "Authentication required",
		"code": "UNAUTHORIZED"
	}
}
```

### 403 Forbidden

Returned when:

- User is authenticated but lacks required role permissions

Example response:

```json
{
	"error": {
		"message": "Insufficient permissions",
		"code": "FORBIDDEN",
		"details": {
			"required": ["SUPERADMIN"],
			"current": ["CASHIER"]
		}
	}
}
```

## Available Helper Functions

- `requireAuth(request)` - Validates JWT and session, returns authenticated request
- `requireRoles(roles)` - Factory function that returns role checker middleware
- `requireSuperAdmin()` - Shorthand for requiring SUPERADMIN role
- `requireManager()` - Shorthand for requiring MANAGER, ADMIN, or SUPERADMIN
- `requireAnyRole()` - Shorthand for requiring any authenticated user

## Security Features

- JWT token validation
- Session verification against database
- User existence check
- Automatic expired session cleanup
- HTTP-only cookie extraction
- Detailed error responses with appropriate status codes
