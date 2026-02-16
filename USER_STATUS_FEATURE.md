# User Status Feature

## Overview

The system now includes a user status management feature that allows administrators to control user access and permissions at a granular level.

## User Status Types

### ACTIVE (Default)

- Full access to the application
- Can perform all operations based on their role permissions
- Default status for all new users

### SUSPENDED

- Can log in and access the application
- Can view/read data based on their role permissions
- **Cannot perform any mutations** (create, update, delete operations)
- Receives error message: "You have been suspended from performing operations. Please contact your administrator."

### BLOCKED

- **Cannot log in** to the application
- All authentication attempts are rejected
- Receives error message: "You have been blocked. Please contact your administrator."

## Database Schema

### User Model

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  username  String     @unique
  name      String
  password  String
  roles     UserRole[] @default([CASHIER])
  status    UserStatus @default(ACTIVE)  // New field
  shift     Shift      @default(MORNING)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  // ... relations
}

enum UserStatus {
  ACTIVE
  BLOCKED
  SUSPENDED
}
```

## Implementation Details

### 1. Authentication Layer (`lib/middleware/auth.ts`)

- Checks user status during authentication
- Blocks BLOCKED users from accessing any authenticated routes
- Returns 403 error with appropriate message

### 2. Mutation Protection (`lib/middleware/user-status.ts`)

New middleware functions:

- `requireActiveMutation()`: Prevents SUSPENDED and BLOCKED users from performing mutations
- `requireActiveAccess()`: Prevents only BLOCKED users from accessing (allows SUSPENDED to read)
- `checkUserBlocked()`: Helper to check if user is blocked
- `checkUserSuspended()`: Helper to check if user is suspended

### 3. Protected Endpoints

All mutation endpoints now include status checks:

#### Sales Operations

- `POST /api/sales` - Create sale
- `POST /api/sales/[id]/complete` - Complete sale
- `POST /api/sales/[id]/cancel` - Cancel sale

#### Inventory Management

- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/[id]` - Update inventory item
- `DELETE /api/inventory/[id]` - Delete inventory item
- `POST /api/inventory/[id]/adjust-stock` - Adjust stock

#### Category Management

- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

#### Customer Management

- `POST /api/customers` - Create customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

#### User Management

- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

## API Responses

### Blocked User (Login Attempt)

```json
{
	"error": {
		"message": "You have been blocked. Please contact your administrator.",
		"code": "USER_BLOCKED"
	}
}
```

Status Code: 403

### Blocked User (Authenticated Request)

```json
{
	"error": {
		"message": "You have been blocked. Please contact your administrator.",
		"code": "USER_BLOCKED"
	}
}
```

Status Code: 403

### Suspended User (Mutation Attempt)

```json
{
	"error": {
		"message": "You have been suspended from performing operations. Please contact your administrator.",
		"code": "USER_SUSPENDED"
	}
}
```

Status Code: 403

## User Data Response

The user status is now included in all user data responses:

```json
{
	"id": "user_id",
	"email": "user@example.com",
	"username": "username",
	"name": "User Name",
	"roles": ["CASHIER"],
	"status": "ACTIVE",
	"shift": "MORNING",
	"createdAt": "2024-01-01T00:00:00.000Z",
	"updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage Examples

### Blocking a User

Update user status via the user management endpoint:

```typescript
PUT /api/users/[id]
{
  "status": "BLOCKED"
}
```

### Suspending a User

```typescript
PUT /api/users/[id]
{
  "status": "SUSPENDED"
}
```

### Reactivating a User

```typescript
PUT /api/users/[id]
{
  "status": "ACTIVE"
}
```

## Access Control Matrix

| Status    | Login | View Data | Create | Update | Delete |
| --------- | ----- | --------- | ------ | ------ | ------ |
| ACTIVE    | ✅    | ✅        | ✅     | ✅     | ✅     |
| SUSPENDED | ✅    | ✅        | ❌     | ❌     | ❌     |
| BLOCKED   | ❌    | ❌        | ❌     | ❌     | ❌     |

## Migration

A database migration has been created and applied:

- Migration: `20260216075033_add_user_status`
- Adds `status` field to users table with default value `ACTIVE`
- All existing users automatically get `ACTIVE` status

## Type Exports

The `UserStatus` enum is exported from `lib/types.ts` for use throughout the application:

```typescript
import { UserStatus } from "@/lib/types";

// Usage
if (user.status === UserStatus.BLOCKED) {
	// Handle blocked user
}
```

## Security Considerations

1. **Layered Protection**: Status checks occur at multiple levels:
   - Authentication layer (blocks BLOCKED users)
   - Mutation layer (blocks SUSPENDED and BLOCKED users)

2. **Consistent Messaging**: Clear error messages help users understand their status

3. **Audit Trail**: All status changes should be logged via activity logs

4. **Role Independence**: User status works independently of role-based permissions

## Future Enhancements

Potential improvements:

- Add suspension reason field
- Add suspension expiry date for temporary suspensions
- Add email notifications when status changes
- Add activity log entries for status changes
- Add bulk status update functionality
- Add status change history tracking
