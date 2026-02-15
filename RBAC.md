# Role-Based Access Control (RBAC) Documentation

This document outlines the complete Role-Based Access Control (RBAC) structure for the Retail POS System.

## Overview

The system implements a hierarchical role-based permission system with four distinct roles, each with specific capabilities and access levels.

## User Roles

### 1. SUPERADMIN

**Highest privilege level - Full system access**

- ✅ View all sales, activity logs, and analytics data
- ✅ Manage users (create, read, update, delete)
- ✅ Manage inventory (create, read, update, delete)
- ✅ Manage categories (create, read, update, delete)
- ✅ Manage customers (create, read, update, delete)
- ✅ Access dashboard and analytics
- ✅ View activity logs
- ✅ Process sales and checkout

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

## API Route Protection

### Sales Routes

- `GET /api/sales` - All roles (filtered by role)
- `POST /api/sales` - All roles
- `GET /api/sales/:id` - All roles (filtered by role)
- `PUT /api/sales/:id/complete` - All roles (own sales)
- `PUT /api/sales/:id/cancel` - All roles (own sales)

### Inventory Routes

- `GET /api/inventory` - All roles
- `POST /api/inventory` - SUPERADMIN, MANAGER
- `PUT /api/inventory/:id` - SUPERADMIN, MANAGER
- `DELETE /api/inventory/:id` - SUPERADMIN, MANAGER
- `POST /api/inventory/:id/adjust-stock` - SUPERADMIN, MANAGER

### Category Routes

- `GET /api/categories` - All roles
- `POST /api/categories` - SUPERADMIN, MANAGER, ADMIN
- `PUT /api/categories/:id` - SUPERADMIN, MANAGER, ADMIN
- `DELETE /api/categories/:id` - SUPERADMIN, MANAGER, ADMIN

### Customer Routes

- `GET /api/customers` - All roles
- `POST /api/customers` - All roles
- `PUT /api/customers/:id` - SUPERADMIN, MANAGER, ADMIN
- `DELETE /api/customers/:id` - SUPERADMIN, MANAGER, ADMIN

### User Routes

- `GET /api/users` - SUPERADMIN only
- `POST /api/users` - SUPERADMIN only
- `PUT /api/users/:id` - SUPERADMIN only
- `DELETE /api/users/:id` - SUPERADMIN only

### Analytics Routes

- `GET /api/analytics/dashboard` - All roles (data filtered by role: SUPERADMIN/MANAGER see all, ADMIN/CASHIER see own)
- `GET /api/analytics/*` (other endpoints) - SUPERADMIN, MANAGER only

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

## Security Considerations

1. **Token-Based Authentication**: All API routes require valid JWT tokens
2. **Session Validation**: Tokens are validated against active sessions in the database
3. **Role Verification**: User roles are fetched fresh from the database on each request
4. **Data Filtering**: Backend services enforce role-based data filtering
5. **Middleware Protection**: API routes use middleware to enforce permissions before processing

## Testing RBAC

To test different role permissions:

1. Create test users with different roles
2. Login as each user type
3. Verify access to features matches the permission matrix
4. Check that data filtering works correctly (own vs all data)
5. Attempt unauthorized actions to verify proper rejection

## Notes

- Roles are stored as an array in the user model, allowing for future multi-role support
- Permission checks use "some" logic, meaning a user with multiple roles gets the union of all permissions
- All permission checks happen on both frontend (UI) and backend (API) for security
- Frontend checks improve UX by hiding unavailable features
- Backend checks enforce security and prevent unauthorized access
