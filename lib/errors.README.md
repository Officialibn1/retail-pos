# Error Handling Utilities

This module provides comprehensive error handling utilities for the backend API, ensuring consistent error responses and proper error logging.

## Features

- ✅ Consistent error response format across all endpoints
- ✅ Automatic error type detection and routing
- ✅ Zod validation error handling with detailed field-level errors
- ✅ Prisma database error handling with user-friendly messages
- ✅ Authentication and authorization error handlers
- ✅ Not found error handler
- ✅ Business rule violation handler
- ✅ Internal error handler (logs details server-side, returns generic message to client)
- ✅ Error wrapper for automatic error handling in async functions

## Error Response Format

All errors follow this consistent structure:

```typescript
{
  error: {
    message: string;      // Human-readable error message
    code: string;         // Error code for client-side handling
    details?: any;        // Optional additional error details
  }
}
```

## Error Codes

| Code                       | HTTP Status | Description                            |
| -------------------------- | ----------- | -------------------------------------- |
| `VALIDATION_ERROR`         | 400         | Input validation failed                |
| `INVALID_INPUT`            | 400         | Invalid input data                     |
| `UNAUTHORIZED`             | 401         | Authentication required                |
| `INVALID_CREDENTIALS`      | 401         | Invalid login credentials              |
| `INVALID_TOKEN`            | 401         | Invalid or expired token               |
| `SESSION_EXPIRED`          | 401         | Session has expired                    |
| `FORBIDDEN`                | 403         | Insufficient permissions               |
| `INSUFFICIENT_PERMISSIONS` | 403         | User lacks required permissions        |
| `NOT_FOUND`                | 404         | Resource not found                     |
| `RESOURCE_NOT_FOUND`       | 404         | Specific resource not found            |
| `CONFLICT`                 | 409         | Resource conflict                      |
| `DUPLICATE_RESOURCE`       | 409         | Duplicate resource (unique constraint) |
| `CONSTRAINT_VIOLATION`     | 409         | Database constraint violation          |
| `BUSINESS_RULE_VIOLATION`  | 422         | Business logic rule violated           |
| `INSUFFICIENT_STOCK`       | 422         | Not enough stock available             |
| `RESOURCE_IN_USE`          | 422         | Resource is currently in use           |
| `INTERNAL_ERROR`           | 500         | Unexpected server error                |
| `DATABASE_ERROR`           | 500         | Database operation failed              |

## Usage

### 1. Using `handleError` (Recommended)

The `handleError` function automatically detects the error type and routes to the appropriate handler:

```typescript
import { handleError } from "@/lib/errors";

export async function POST(request: NextRequest) {
	try {
		// Your route logic here
	} catch (error) {
		return handleError(error, "POST /api/users");
	}
}
```

### 2. Using `withErrorHandling` Wrapper

Wrap your route handler to automatically catch and handle errors:

```typescript
import { withErrorHandling } from "@/lib/errors";

export const POST = withErrorHandling(async (request: NextRequest) => {
	// Your route logic here
	// Errors are automatically caught and handled
	return NextResponse.json({ success: true });
}, "POST /api/users");
```

### 3. Using Specific Error Handlers

For more control, use specific error handlers:

```typescript
import {
	handleValidationError,
	handlePrismaError,
	handleNotFoundError,
	handleAuthenticationError,
	handleAuthorizationError,
	handleBusinessRuleError,
} from "@/lib/errors";

export async function GET(request: NextRequest) {
	// Authentication check
	if (!token) {
		return handleAuthenticationError("Please log in to continue");
	}

	// Authorization check
	if (!hasPermission) {
		return handleAuthorizationError("Admin access required", {
			required: ["ADMIN"],
			current: ["USER"],
		});
	}

	// Resource check
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user) {
		return handleNotFoundError("User", id);
	}

	// Business rule check
	if (stock < requested) {
		return handleBusinessRuleError("Insufficient stock", {
			requested,
			available: stock,
		});
	}

	return NextResponse.json({ user });
}
```

### 4. Custom Error Responses

For custom error scenarios, use `formatErrorResponse`:

```typescript
import { formatErrorResponse, ErrorCode } from "@/lib/errors";

export async function POST(request: NextRequest) {
	if (customCondition) {
		return formatErrorResponse(
			"Custom error message",
			ErrorCode.BUSINESS_RULE_VIOLATION,
			{ customField: "value" },
			422,
		);
	}
}
```

## Prisma Error Handling

The `handlePrismaError` function automatically converts Prisma errors to user-friendly messages:

| Prisma Code | Error Message                                      | HTTP Status |
| ----------- | -------------------------------------------------- | ----------- |
| P2002       | "A record with this {field} already exists"        | 409         |
| P2003       | "Invalid reference: {field} does not exist"        | 400         |
| P2025       | "The requested resource was not found"             | 404         |
| P2014       | "Cannot perform operation: {relation} is required" | 400         |
| P2023       | "Invalid ID format provided"                       | 400         |

## Zod Validation Error Handling

The `handleValidationError` function formats Zod errors with field-level details:

```json
{
	"error": {
		"message": "Validation failed. Please check your input data.",
		"code": "VALIDATION_ERROR",
		"details": [
			{
				"field": "email",
				"message": "Invalid email format",
				"code": "invalid_string"
			},
			{
				"field": "age",
				"message": "Expected number, received string",
				"code": "invalid_type"
			}
		]
	}
}
```

## Security Considerations

- ✅ Internal errors log full details server-side but return generic messages to clients
- ✅ Database errors don't expose schema or query details
- ✅ Validation errors provide helpful feedback without exposing system internals
- ✅ All errors are logged with context for debugging

## Best Practices

1. **Always provide context**: Pass a context string to error handlers for better logging

   ```typescript
   handleError(error, "POST /api/users - createUser");
   ```

2. **Use specific handlers when appropriate**: For known error scenarios, use specific handlers for better error messages

   ```typescript
   if (!user) return handleNotFoundError("User", userId);
   ```

3. **Don't expose sensitive information**: Never include passwords, tokens, or sensitive data in error responses

4. **Log errors properly**: All error handlers automatically log errors server-side with full details

5. **Use business rule errors for domain logic**: Use `handleBusinessRuleError` for application-specific validation
   ```typescript
   if (quantity > stock) {
   	return handleBusinessRuleError("Insufficient stock", { quantity, stock });
   }
   ```

## Requirements Validation

This implementation satisfies the following requirements:

- ✅ **Requirement 11.1**: Zod schema validation with detailed error messages
- ✅ **Requirement 11.2**: Database constraint error handling with user-friendly messages
- ✅ **Requirement 11.3**: Resource not found handling with 404 status
- ✅ **Requirement 11.4**: Unauthorized access error handling with 401/403 status
- ✅ **Requirement 11.5**: Internal error security (logs details, returns generic message)
