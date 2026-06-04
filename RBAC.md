# Role-Based Access Control (RBAC) Documentation

This document outlines the complete Role-Based Access Control (RBAC) structure for the Retail POS System.

## Overview

The system implements a hierarchical role-based permission system with four distinct roles, each with specific capabilities and access levels. Additionally, users have a status field that controls account access independent of their assigned roles.

## User Roles

The system defines four hierarchical roles that determine what actions a user can perform and what data they can access. Each user is assigned one or more roles stored as an array in the database.

### Role Enum Values

```typescript
enum UserRole {
  SUPERADMIN
  ADMIN
  MANAGER
  CASHIER
}
```

### 1. SUPERADMIN

**Highest privilege level - Full system access**

- ✅ View all sales, activity logs, and analytics data
- ✅ Manage users (create, read, update, delete)
- ✅ Manage user status (activate, suspend, block)
- ✅ Manage inventory (create, read, update, delete)
- ✅ Manage categories (create, read, update, delete)
- ✅ Manage customers (create, read, update, delete)
- ✅ Access dashboard and analytics
- ✅ View activity logs
- ✅ Process sales and checkout
- ✅ Export database backups
- ✅ Cannot be blocked or suspended (protected status)

### 2. MANAGER

**Management level - Can view all data and manage inventory**

- ✅ View all sales, activity logs, and analytics data
- ✅ Manage inventory (create, read, update, delete)
- ✅ Manage categories (create, read, update, delete)
- ✅ Manage customers (create, read, update, delete)
- ✅ Access dashboard and analytics
- ✅ View activity logs
- ✅ Process sales and checkout
- ❌ Cannot manage users

### 3. ADMIN

**Administrative level - Limited to own data with category/customer management**

- ⚠️ View only their own sales and dashboard stats
- ✅ Manage categories (create, read, update, delete)
- ✅ Manage customers (create, read, update, delete)
- ✅ Access dashboard (own data only)
- ✅ Process sales and checkout
- ❌ Cannot access analytics page
- ❌ Cannot view all data
- ❌ Cannot manage inventory
- ❌ Cannot manage users
- ❌ Cannot view activity logs

### 4. CASHIER

**Basic operations level - Limited to own data**

- ⚠️ View only their own sales and dashboard stats
- ✅ Create customers only
- ✅ Access dashboard (own data only)
- ✅ Process sales and checkout
- ❌ Cannot access analytics page
- ❌ Cannot update or delete customers
- ❌ Cannot manage categories
- ❌ Cannot manage inventory
- ❌ Cannot manage users
- ❌ Cannot view all data
- ❌ Cannot view activity logs

## User Shifts

Each user is assigned a shift that indicates their work schedule. This is primarily used for organizational purposes and scheduling.

### Shift Enum Values

```typescript
enum Shift {
  MORNING
  EVENING
  FULLTIME
}
```

### Shift Descriptions

- **MORNING**: User works morning shift
- **EVENING**: User works evening shift
- **FULLTIME**: User works full-time (both shifts or flexible schedule)

The default shift for new users is `MORNING`.

## User Status

In addition to roles, each user has a status field that controls account access at the authentication level. User status is independent of roles and provides account-level access control.

### Status Enum Values

```typescript
enum UserStatus {
  ACTIVE
  BLOCKED
  SUSPENDED
}
```

### Status Values

#### ACTIVE (Default)

- User account is fully operational
- Can authenticate and access the system
- Can perform all operations (read and write)
- All role-based permissions apply normally

#### BLOCKED

- User account is permanently disabled
- Cannot authenticate or access the system at all
- All API requests are rejected with 403 Forbidden
- Typically used for terminated employees or security violations
- Requires SUPERADMIN action to unblock

#### SUSPENDED

- User account is temporarily restricted
- Can authenticate and access the system
- **Can perform READ operations** (view data, access pages)
- **Cannot perform WRITE operations** (create, update, delete)
- Mutation attempts are rejected with 403 Forbidden
- Typically used for temporary restrictions (e.g., pending investigation, policy violations)
- Can be reactivated by SUPERADMIN

### Status vs Role

- **Status** controls access level (blocked, read-only, or full access)
- **Roles** control what a user can do based on their permissions (authorization level)
- A BLOCKED user cannot access the system at all
- A SUSPENDED user can view data but cannot perform mutations
- Only ACTIVE users can perform all operations allowed by their role

### Status Management

- Only SUPERADMIN can change user status
- Status changes are logged in activity logs
- Blocked/suspended users' active sessions remain valid but operations are restricted
- Default status for new users is ACTIVE

## Permission Matrix

| Feature                    | SUPERADMIN | MANAGER | ADMIN | CASHIER |
| -------------------------- | ---------- | ------- | ----- | ------- |
| **Sales**                  |
| View All Sales             | ✅         | ✅      | ❌    | ❌      |
| View Own Sales             | ✅         | ✅      | ✅    | ✅      |
| Create Sale                | ✅         | ✅      | ✅    | ✅      |
| Complete Sale              | ✅         | ✅      | ✅    | ✅      |
| Cancel Sale                | ✅         | ✅      | ✅    | ✅      |
| **Inventory**              |
| View Inventory             | ✅         | ✅      | ✅    | ✅      |
| Create Item                | ✅         | ✅      | ❌    | ❌      |
| Update Item                | ✅         | ✅      | ❌    | ❌      |
| Delete Item                | ✅         | ✅      | ❌    | ❌      |
| Adjust Stock               | ✅         | ✅      | ❌    | ❌      |
| **Categories**             |
| View Categories            | ✅         | ✅      | ✅    | ✅      |
| Create Category            | ✅         | ✅      | ✅    | ❌      |
| Update Category            | ✅         | ✅      | ✅    | ❌      |
| Delete Category            | ✅         | ✅      | ✅    | ❌      |
| **Customers**              |
| View Customers             | ✅         | ✅      | ✅    | ✅      |
| Create Customer            | ✅         | ✅      | ✅    | ✅      |
| Update Customer            | ✅         | ✅      | ✅    | ❌      |
| Delete Customer            | ✅         | ✅      | ✅    | ❌      |
| **Users**                  |
| View Users                 | ✅         | ❌      | ❌    | ❌      |
| Create User                | ✅         | ❌      | ❌    | ❌      |
| Update User                | ✅         | ❌      | ❌    | ❌      |
| Delete User                | ✅         | ❌      | ❌    | ❌      |
| Change User Status         | ✅         | ❌      | ❌    | ❌      |
| **Backup**                 |
| Export Database Backup     | ✅         | ❌      | ❌    | ❌      |
| **Analytics**              |
| Access Dashboard Page      | ✅         | ✅      | ✅    | ✅      |
| View Dashboard Stats (Own) | ✅         | ✅      | ✅    | ✅      |
| View Dashboard Stats (All) | ✅         | ✅      | ❌    | ❌      |
| Access Analytics Page      | ✅         | ✅      | ❌    | ❌      |
| Access Analytics Endpoints | ✅         | ✅      | ❌    | ❌      |
| **Activity Logs**          |
| View All Logs              | ✅         | ✅      | ❌    | ❌      |
| View Own Logs              | ✅         | ✅      | ❌    | ❌      |

## Implementation Details

### Helper Functions (lib/auth.ts)

```typescript
// View all data across the system
canViewAllData(userRoles);
// Returns: true for SUPERADMIN, MANAGER

// Access dashboard page
canViewDashboardPage(userRoles);
// Returns: true for all roles

// View activity logs (all or own)
canViewActivityLogs(userRoles);
// Returns: true for SUPERADMIN, MANAGER

// Manage inventory
canManageInventory(userRoles);
// Returns: true for SUPERADMIN, MANAGER

// Manage users
canManageUsers(userRoles);
// Returns: true for SUPERADMIN only

// Access analytics
canAccessAnalytics(userRoles);
// Returns: true for SUPERADMIN, MANAGER

// Access analytics dashboard
canAccessAnalyticsDashboard(userRoles);
// Returns: true for SUPERADMIN, MANAGER

// View other users' performance
canAccessOtherUsersPerformance(userRoles);
// Returns: true for SUPERADMIN, MANAGER

// Manage categories
canManageCategories(userRoles);
// Returns: true for SUPERADMIN, MANAGER, ADMIN

// Manage customers (full CRUD)
canManageCustomers(userRoles);
// Returns: true for SUPERADMIN, MANAGER, ADMIN

// Create customers
canCreateCustomer(userRoles);
// Returns: true for all roles
```

### Middleware Functions (lib/middleware/auth.ts)

```typescript
// Require authentication
requireAuth(request);

// Require specific roles
requireRoles(requiredRoles);

// Require SUPERADMIN
requireSuperAdmin();

// Require SUPERADMIN or MANAGER
requireManager();

// Require category management permission
requireCategoryManager();
// Allows: SUPERADMIN, MANAGER, ADMIN

// Require customer management permission
requireCustomerManager();
// Allows: SUPERADMIN, MANAGER, ADMIN

// Require any authenticated role
requireAnyRole();
```

### User Status Middleware (lib/middleware/user-status.ts)

```typescript
// Check if user can perform mutations (create, update, delete)
// Blocks SUSPENDED and BLOCKED users from mutations
requireActiveMutation(userId);
// Returns: NextResponse error if user is SUSPENDED or BLOCKED, null if ACTIVE

// Check if user can access the application (read operations)
// Only blocks BLOCKED users, allows SUSPENDED users to read
requireActiveAccess(userId);
// Returns: NextResponse error if user is BLOCKED, null if ACTIVE or SUSPENDED

// Helper: Check if user is blocked
checkUserBlocked(userId);
// Returns: boolean

// Helper: Check if user is suspended
checkUserSuspended(userId);
// Returns: boolean
```

### Middleware Usage Pattern

API routes should apply middleware in this order:

1. **Authentication** (`requireAuth`) - Verify user is logged in
2. **Role Authorization** (`requireManager`, `requireSuperAdmin`, etc.) - Check role permissions
3. **Status Check** - Apply based on operation type:
   - **Mutation operations** (POST, PUT, DELETE): Use `requireActiveMutation(user.id)`
   - **Read operations** (GET): Use `requireActiveAccess(user.id)` or no status check

Example for mutation endpoint:

```typescript
export async function POST(request: NextRequest) {
	// 1. Authenticate
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	// 2. Check role (if needed)
	const roleCheck = requireSuperAdmin()(authResult.request);
	if (roleCheck) return roleCheck;

	// 3. Check user status for mutations
	const statusCheck = await requireActiveMutation(authResult.request.user.id);
	if (statusCheck) return statusCheck;

	// Proceed with operation...
}
```

## Data Filtering

### Sales & Analytics

- **SUPERADMIN & MANAGER**: See all sales and analytics across all users
- **ADMIN & CASHIER**: See only their own sales (no analytics access)

Implementation in services:

```typescript
// Only SUPERADMIN and MANAGER can see all data
if (
	!userRoles.includes(UserRole.SUPERADMIN) &&
	!userRoles.includes(UserRole.MANAGER)
) {
	whereClause.userId = userId; // Filter to own data
}
```

### Activity Logs

- **SUPERADMIN & MANAGER**: See all activity logs
- **ADMIN & CASHIER**: No access to activity logs

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
  status    UserStatus @default(ACTIVE)
  shift     Shift      @default(MORNING)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  sessions            Session[]
  passwordResetTokens PasswordResetToken[]
  sales               Sale[]
  activityLogs        ActivityLog[]

  @@map("users")
}
```

Key fields:

- **roles**: Array of UserRole enums (supports multiple roles)
- **status**: UserStatus enum (ACTIVE, BLOCKED, SUSPENDED)
- **shift**: Shift enum (MORNING, EVENING, FULLTIME)
- Default role: CASHIER
- Default status: ACTIVE
- Default shift: MORNING

## API Route Protection

All API routes follow a consistent protection pattern using authentication, role-based authorization, and user status checks.

### Sales Routes

- `GET /api/sales` - All roles (filtered by role), ACTIVE or SUSPENDED users
- `POST /api/sales` - All roles, **ACTIVE users only** (mutation protected)
- `GET /api/sales/:id` - All roles (filtered by role), ACTIVE or SUSPENDED users
- `PUT /api/sales/:id/complete` - All roles (own sales), **ACTIVE users only** (mutation protected)
- `PUT /api/sales/:id/cancel` - All roles (own sales), **ACTIVE users only** (mutation protected)

### Inventory Routes

- `GET /api/inventory` - All roles, ACTIVE or SUSPENDED users
- `POST /api/inventory` - SUPERADMIN, MANAGER, **ACTIVE users only** (mutation protected)
- `PUT /api/inventory/:id` - SUPERADMIN, MANAGER, **ACTIVE users only** (mutation protected)
- `DELETE /api/inventory/:id` - SUPERADMIN, MANAGER, **ACTIVE users only** (mutation protected)
- `POST /api/inventory/:id/adjust-stock` - SUPERADMIN, MANAGER, **ACTIVE users only** (mutation protected)

### Category Routes

- `GET /api/categories` - All roles, ACTIVE or SUSPENDED users
- `POST /api/categories` - SUPERADMIN, MANAGER, ADMIN, **ACTIVE users only** (mutation protected)
- `PUT /api/categories/:id` - SUPERADMIN, MANAGER, ADMIN, **ACTIVE users only** (mutation protected)
- `DELETE /api/categories/:id` - SUPERADMIN, MANAGER, ADMIN, **ACTIVE users only** (mutation protected)

### Customer Routes

- `GET /api/customers` - All roles, ACTIVE or SUSPENDED users
- `POST /api/customers` - All roles, **ACTIVE users only** (mutation protected)
- `PUT /api/customers/:id` - SUPERADMIN, MANAGER, ADMIN, **ACTIVE users only** (mutation protected)
- `DELETE /api/customers/:id` - SUPERADMIN, MANAGER, ADMIN, **ACTIVE users only** (mutation protected)

### User Routes

- `GET /api/users` - SUPERADMIN only, ACTIVE or SUSPENDED users
- `POST /api/users` - SUPERADMIN only, **ACTIVE users only** (mutation protected with `requireActiveMutation`)
  - Automatically generates a secure random password (12 characters)
  - Sends welcome email with login credentials to the new user
  - Response message: "User created successfully. Login credentials have been sent to the user's email."
- `GET /api/users/:id` - SUPERADMIN only, ACTIVE or SUSPENDED users
- `PUT /api/users/:id` - SUPERADMIN only, **ACTIVE users only** (mutation protected)
- `DELETE /api/users/:id` - SUPERADMIN only, **ACTIVE users only** (mutation protected)
- `GET /api/users/:id/status` - SUPERADMIN only, ACTIVE or SUSPENDED users
- `PATCH /api/users/:id/status` - SUPERADMIN only, **ACTIVE users only** (mutation protected)

### Analytics Routes

- `GET /api/analytics/dashboard` - All roles (data filtered by role: SUPERADMIN/MANAGER see all, ADMIN/CASHIER see own), ACTIVE or SUSPENDED users
- `GET /api/analytics/*` (other endpoints) - SUPERADMIN, MANAGER only, ACTIVE or SUSPENDED users

### Backup Routes

- `POST /api/backup` - SUPERADMIN only, ACTIVE or SUSPENDED users (read-only operation that exports database to Excel)
  - Uses standard middleware pattern: `requireAuth()` followed by `requireSuperAdmin()`
  - Exports all database tables to Excel workbook format

### Protection Pattern

Routes follow this protection hierarchy:

1. **Authentication** - Must have valid session token
2. **Role Authorization** - Must have required role(s)
3. **User Status** - Must have appropriate status:
   - **Read operations (GET)**: ACTIVE or SUSPENDED users allowed
   - **Write operations (POST/PUT/DELETE)**: ACTIVE users only

## Frontend Guards

Use the helper functions in components to conditionally render UI elements:

```typescript
import { useAuth } from "@/components/auth/auth-provider";
import { canManageInventory, canViewAllData } from "@/lib/auth";

function MyComponent() {
  const { user } = useAuth();

  // Show inventory management UI
  if (canManageInventory(user.roles)) {
    return <InventoryManagement />;
  }

  // Show all data or filtered data
  const showAllData = canViewAllData(user.roles);

  return <DataView showAll={showAllData} />;
}
```

## Authentication Mechanism

The system uses cookie-based JWT authentication with password reset capabilities:

### Authentication Flow

1. **Cookie Storage**: JWT tokens are stored in HTTP-only cookies named `auth-token`
2. **Token Extraction**: The `getTokenFromCookies()` helper extracts tokens from request cookies
3. **Token Verification**: JWT tokens are verified using the `JWT_SECRET` environment variable
4. **Session Validation**: Tokens are validated against active sessions in the database
5. **Standard Middleware**: Most routes use the `requireAuth()` middleware from `lib/middleware/auth.ts`

### Login Process

1. User logs in via `/api/auth/login`
2. Server generates JWT token and stores it in `auth-token` cookie
3. Session record is created in database
4. Subsequent requests include the cookie automatically
5. Middleware extracts token from cookie, verifies JWT, and validates session
6. User information is attached to the request object

### Password Reset

The system supports two types of password reset mechanisms:

```prisma
model PasswordResetToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  otp       String?
  type      ResetType @default(LINK)
  expires   DateTime
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([otp])
  @@map("password_reset_tokens")
}

enum ResetType {
  LINK
  OTP
}
```

**Reset Types:**

- **LINK**: Email-based reset link (default)
- **OTP**: One-time password code

Password reset tokens are:

- Stored in the database with expiration
- Linked to specific users
- Automatically deleted when user is deleted (cascade)
- Indexed for fast lookup by userId and OTP

## Security Considerations

1. **Token-Based Authentication**: All API routes require valid JWT tokens stored in HTTP-only cookies
2. **Session Validation**: Tokens are validated against active sessions in the database
3. **Role Verification**: User roles are fetched fresh from the database on each request
4. **User Status Enforcement**: User status is checked on each request to enforce access restrictions
5. **Mutation Protection**: SUSPENDED users are blocked from all create/update/delete operations
6. **Data Filtering**: Backend services enforce role-based data filtering
7. **Middleware Protection**: API routes use middleware to enforce permissions before processing
8. **Layered Security**: Three layers of protection (authentication → role → status) ensure comprehensive access control
9. **HTTP-Only Cookies**: Authentication tokens are stored in HTTP-only cookies to prevent XSS attacks
10. **Secure Password Generation**: New user accounts are created with randomly generated 12-character passwords
11. **Email Notification**: Login credentials are automatically sent to new users via email

## Testing RBAC

To test different role permissions and user status restrictions:

### Role Testing

1. Create test users with different roles (SUPERADMIN, MANAGER, ADMIN, CASHIER)
2. Login as each user type
3. Verify access to features matches the permission matrix
4. Check that data filtering works correctly (own vs all data)
5. Attempt unauthorized actions to verify proper rejection

### User Status Testing

1. **ACTIVE User Testing**:
   - Verify user can perform all operations allowed by their role
   - Test both read and write operations
2. **SUSPENDED User Testing**:
   - Verify user can login and access the system
   - Verify user can view data (GET requests succeed)
   - Verify user cannot create, update, or delete (POST/PUT/DELETE return 403)
   - Test error message: "You have been suspended from performing operations"
3. **BLOCKED User Testing**:
   - Verify user cannot access any endpoints (all requests return 403)
   - Test error message: "You have been blocked. Please contact your administrator"

### Test Scenarios

- Create a sale as ACTIVE user → Should succeed
- Create a sale as SUSPENDED user → Should fail with 403
- View sales as SUSPENDED user → Should succeed
- Update inventory as SUSPENDED MANAGER → Should fail with 403
- View inventory as SUSPENDED MANAGER → Should succeed

## Notes

- Roles are stored as an array in the user model, allowing for future multi-role support
- Permission checks use "some" logic, meaning a user with multiple roles gets the union of all permissions
- User status provides an additional layer of access control independent of roles
- SUSPENDED status enables read-only access, useful for investigations or temporary restrictions
- BLOCKED status completely denies access, used for permanent account termination
- All permission checks happen on both frontend (UI) and backend (API) for security
- Frontend checks improve UX by hiding unavailable features
- Backend checks enforce security and prevent unauthorized access
- Status checks are performed after authentication and role checks in the middleware chain
