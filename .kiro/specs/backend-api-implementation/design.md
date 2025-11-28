# Design Document

## Overview

This design document outlines the architecture and implementation strategy for a complete backend API system for the Retail POS application. The system will replace the current mock data implementation with a fully functional, database-backed API using Next.js App Router API routes, PostgreSQL with Prisma ORM, and JWT-based authentication with HTTP-only cookies.

The backend will provide:

- Secure authentication and session management
- RESTful API endpoints for all CRUD operations
- Role-based access control middleware
- Raw SQL queries for complex analytics
- Comprehensive error handling and validation
- Type-safe database operations using Prisma

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│  (React Components, Client-side State Management)           │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests (fetch/axios)
                     │ JWT in HTTP-only Cookie
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes (App Router)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware                            │  │
│  │  - JWT Validation                                     │  │
│  │  - Session Verification                               │  │
│  │  - Role-Based Access Control                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Route Handlers                                   │  │
│  │  - /api/auth/*                                        │  │
│  │  - /api/users/*                                       │  │
│  │  - /api/inventory/*                                   │  │
│  │  - /api/sales/*                                       │  │
│  │  - /api/customers/*                                   │  │
│  │  - /api/analytics/*                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma Client
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│  - Users & Sessions                                         │
│  - Inventory Items & Categories                             │
│  - Sales & Sale Items                                       │
│  - Customers                                                │
│  - Stock Movements                                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js with Next.js 14 App Router
- **Database**: PostgreSQL
- **ORM**: Prisma 7 with custom output directory
- **Authentication**: JWT (jsonwebtoken library)
- **Password Hashing**: bcryptjs
- **Validation**: Zod schemas
- **Type Safety**: TypeScript 5

## Components and Interfaces

### 1. Authentication Module

**Location**: `lib/auth/`

#### JWT Service (`lib/auth/jwt.ts`)

```typescript
interface JWTPayload {
	userId: string;
	email: string;
	roles: UserRole[];
}

interface TokenPair {
	token: string;
	expiresAt: Date;
}

function generateToken(payload: JWTPayload): TokenPair;
function verifyToken(token: string): JWTPayload | null;
function getTokenFromCookies(request: Request): string | null;
```

#### Session Service (`lib/auth/session.ts`)

```typescript
interface SessionData {
	id: string;
	userId: string;
	token: string;
	expires: Date;
}

async function createSession(
	userId: string,
	token: string,
): Promise<SessionData>;
async function getSession(token: string): Promise<SessionData | null>;
async function deleteSession(token: string): Promise<void>;
async function cleanupExpiredSessions(): Promise<void>;
```

#### Password Service (`lib/auth/password.ts`)

```typescript
async function hashPassword(password: string): Promise<string>;
async function verifyPassword(password: string, hash: string): Promise<boolean>;
async function createResetToken(userId: string): Promise<string>;
async function verifyResetToken(token: string): Promise<string | null>;
```

### 2. Middleware

**Location**: `lib/middleware/`

#### Auth Middleware (`lib/middleware/auth.ts`)

```typescript
interface AuthenticatedRequest extends NextRequest {
	user: {
		id: string;
		email: string;
		roles: UserRole[];
	};
}

async function requireAuth(
	request: NextRequest,
): Promise<AuthenticatedRequest | Response>;
function requireRoles(
	roles: UserRole[],
): (request: AuthenticatedRequest) => Response | null;
```

### 3. API Route Handlers

**Location**: `app/api/`

#### Authentication Routes (`app/api/auth/`)

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### User Routes (`app/api/users/`)

- `GET /api/users` - List all users (SUPERADMIN only)
- `POST /api/users` - Create user (SUPERADMIN only)
- `GET /api/users/[id]` - Get user by ID (SUPERADMIN only)
- `PUT /api/users/[id]` - Update user (SUPERADMIN only)
- `DELETE /api/users/[id]` - Delete user (SUPERADMIN only)

#### Inventory Routes (`app/api/inventory/`)

- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item (MANAGER+)
- `GET /api/inventory/[id]` - Get inventory item by ID
- `PUT /api/inventory/[id]` - Update inventory item (MANAGER+)
- `DELETE /api/inventory/[id]` - Soft delete inventory item (MANAGER+)
- `POST /api/inventory/[id]/adjust-stock` - Adjust stock quantity (MANAGER+)

#### Category Routes (`app/api/categories/`)

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (MANAGER+)
- `GET /api/categories/[id]` - Get category with items
- `PUT /api/categories/[id]` - Update category (MANAGER+)
- `DELETE /api/categories/[id]` - Delete category (MANAGER+)

#### Sales Routes (`app/api/sales/`)

- `GET /api/sales` - List sales (filtered by role)
- `POST /api/sales` - Create sale (PENDING status)
- `GET /api/sales/[id]` - Get sale by ID
- `POST /api/sales/[id]/complete` - Complete sale
- `POST /api/sales/[id]/cancel` - Cancel sale

#### Customer Routes (`app/api/customers/`)

- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer with sales history
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

#### Analytics Routes (`app/api/analytics/`)

- `GET /api/analytics/sales` - Sales analytics (MANAGER+)
- `GET /api/analytics/inventory` - Inventory analytics (MANAGER+)
- `GET /api/analytics/dashboard` - Dashboard stats (MANAGER+)

### 4. Database Services

**Location**: `lib/services/`

Each service encapsulates database operations for a specific domain:

#### User Service (`lib/services/user.service.ts`)

```typescript
async function createUser(data: CreateUserInput): Promise<User>;
async function getUserById(id: string): Promise<User | null>;
async function getUserByEmail(email: string): Promise<User | null>;
async function updateUser(id: string, data: UpdateUserInput): Promise<User>;
async function deleteUser(id: string): Promise<void>;
async function listUsers(): Promise<User[]>;
```

#### Inventory Service (`lib/services/inventory.service.ts`)

```typescript
async function createInventoryItem(
	data: CreateInventoryItemInput,
): Promise<InventoryItem>;
async function getInventoryItemById(id: string): Promise<InventoryItem | null>;
async function updateInventoryItem(
	id: string,
	data: UpdateInventoryItemInput,
): Promise<InventoryItem>;
async function softDeleteInventoryItem(id: string): Promise<void>;
async function listInventoryItems(
	includeDeleted?: boolean,
): Promise<InventoryItem[]>;
async function adjustStock(
	id: string,
	quantity: number,
	reason: string,
	notes?: string,
): Promise<void>;
```

#### Sales Service (`lib/services/sales.service.ts`)

```typescript
async function createSale(data: CreateSaleInput): Promise<Sale>;
async function getSaleById(id: string): Promise<Sale | null>;
async function completeSale(
	id: string,
	paymentData: PaymentInput,
): Promise<Sale>;
async function cancelSale(id: string): Promise<Sale>;
async function listSales(
	userId?: string,
	roleFilter?: boolean,
): Promise<Sale[]>;
```

#### Analytics Service (`lib/services/analytics.service.ts`)

```typescript
async function getSalesAnalytics(userId?: string): Promise<SalesAnalytics>;
async function getTopSellingProducts(
	limit: number,
	userId?: string,
): Promise<TopProduct[]>;
async function getSalesByDateRange(
	startDate: Date,
	endDate: Date,
	userId?: string,
): Promise<DailySales[]>;
async function getPaymentMethodBreakdown(
	userId?: string,
): Promise<PaymentMethodStats[]>;
async function getInventoryAnalytics(): Promise<InventoryAnalytics>;
async function getDashboardStats(userId?: string): Promise<DashboardStats>;
```

## Data Models

The data models are defined in the Prisma schema. Key models include:

### User Model

- Stores user credentials, roles, and shift information
- Supports multiple roles per user (array)
- Related to sessions, sales, and password reset tokens

### Session Model

- Tracks active user sessions
- Stores JWT token and expiration
- Cascade deletes when user is deleted

### InventoryItem Model

- Stores product information with pricing
- Supports soft deletion via `deletedAt` field
- Related to category, sale items, and stock movements

### Sale Model

- Tracks sales transactions with status workflow
- Stores payment information and totals
- Related to user (cashier), customer, and sale items

### SaleItem Model

- Line items for each sale
- Captures quantity and price at time of sale
- Related to sale and inventory item

### StockMovement Model

- Audit trail for all inventory changes
- Records quantity, reason, and timestamp
- Related to inventory item

### Customer Model

- Optional customer information
- Phone number is unique if provided
- Related to sales

### InventoryItemCategory Model

- Organizes inventory items
- Name must be unique
- Related to inventory items

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

**Redundancies Identified:**

- Properties 9.4 and 1.5 both test logout session deletion - can be combined
- Properties 9.5 and 2.4 both test cascade deletion of sessions - can be combined
- Properties 10.2 and 5.2 both test stock movements on sale completion - already covered in 5.2
- Properties 10.3 and 5.3 both test stock movements on sale cancellation - already covered in 5.3
- Properties 10.4 and 3.5 both test stock movements on manual adjustment - already covered in 3.5
- Properties 6.2 and 6.5 both test customer relationship loading - can be combined
- Properties 4.2 and 4.5 test similar category relationship loading - can be combined

**Consolidated Properties:**
The following properties provide unique validation value after removing redundancies:

### Authentication & Session Properties

**Property 1: Password verification and JWT generation**
_For any_ valid user credentials, the login process should verify the password using bcrypt and generate a valid JWT token that can be decoded to retrieve the user information.
**Validates: Requirements 1.1**

**Property 2: Session creation with JWT**
_For any_ generated JWT token, a corresponding session record should exist in the database with matching token and valid expiration timestamp.
**Validates: Requirements 1.2, 9.1**

**Property 3: Protected route authentication**
_For any_ request to a protected route with a valid session token, the authentication middleware should successfully validate the token and allow access; for invalid or missing tokens, access should be denied.
**Validates: Requirements 1.3, 9.2**

**Property 4: Logout session cleanup**
_For any_ authenticated user session, logging out should remove the session record from the database and clear the authentication cookie.
**Validates: Requirements 1.5, 9.4**

### User Management Properties

**Property 5: User creation with password hashing**
_For any_ valid user data, creating a user should result in the password being hashed (not stored as plaintext) and the default CASHIER role being assigned.
**Validates: Requirements 2.1**

**Property 6: Password exclusion in responses**
_For any_ user retrieval operation, the returned user data should never include the password hash field.
**Validates: Requirements 2.2**

**Property 7: User update persistence**
_For any_ valid user update data, after updating a user, retrieving that user should reflect all the changes made.
**Validates: Requirements 2.3**

**Property 8: User deletion cascade**
_For any_ user with associated sessions, deleting the user should also remove all their sessions from the database.
**Validates: Requirements 2.4, 9.5**

**Property 9: Role-based user management access**
_For any_ user without SUPERADMIN role, attempts to perform user management operations (create, update, delete) should be rejected with a forbidden status.
**Validates: Requirements 2.5**

### Inventory Management Properties

**Property 10: SKU uniqueness enforcement**
_For any_ inventory item creation or update, if the SKU already exists on a different item, the operation should fail with a validation error.
**Validates: Requirements 3.1**

**Property 11: Soft delete filtering**
_For any_ inventory retrieval operation, only items where deletedAt is null should be returned, excluding soft-deleted items.
**Validates: Requirements 3.2**

**Property 12: Inventory update persistence**
_For any_ valid inventory item update data, after updating an item, retrieving that item should reflect all the changes made.
**Validates: Requirements 3.3**

**Property 13: Soft delete behavior**
_For any_ inventory item, deleting it should set the deletedAt timestamp to the current time without removing the record from the database.
**Validates: Requirements 3.4**

**Property 14: Stock adjustment with audit trail**
_For any_ stock adjustment operation, the inventory item's stock should be updated by the specified quantity AND a stock movement record should be created with the quantity, reason, and timestamp.
**Validates: Requirements 3.5, 10.1, 10.4**

### Category Management Properties

**Property 15: Category name uniqueness**
_For any_ category creation or update, if the name already exists on a different category, the operation should fail with a validation error.
**Validates: Requirements 4.1, 4.3**

**Property 16: Category with item counts and relationships**
_For any_ category retrieval, the returned data should include an accurate count of associated inventory items and optionally include the full item details.
**Validates: Requirements 4.2, 4.5**

**Property 17: Category deletion protection**
_For any_ category that has associated inventory items, deletion attempts should fail with an error indicating the category is in use.
**Validates: Requirements 4.4**

### Sales Processing Properties

**Property 18: Sale creation with stock validation**
_For any_ sale creation request, all items must have sufficient stock available, and the created sale should have PENDING status with accurate total calculation.
**Validates: Requirements 5.1**

**Property 19: Sale completion workflow**
_For any_ pending sale, completing it should atomically: update status to COMPLETED, record payment details, reduce inventory stock for all items, and create stock movement records with reason "SALE".
**Validates: Requirements 5.2, 10.2**

**Property 20: Sale cancellation reversal**
_For any_ completed sale, cancelling it should atomically: update status to CANCELLED, restore inventory stock for all items, and create stock movement records with reason "SALE_CANCELLED".
**Validates: Requirements 5.3, 10.3**

**Property 21: Role-based sales filtering**
_For any_ sales retrieval by a CASHIER user, only sales where the userId matches the requesting user should be returned; for MANAGER or SUPERADMIN users, all sales should be returned.
**Validates: Requirements 5.4, 8.5**

### Customer Management Properties

**Property 22: Customer phone uniqueness**
_For any_ customer creation or update with a phone number, if that phone already exists on a different customer, the operation should fail with a validation error.
**Validates: Requirements 6.1**

**Property 23: Customer with sales history**
_For any_ customer retrieval, the returned data should include all associated sales with complete details.
**Validates: Requirements 6.2, 6.5**

**Property 24: Customer update persistence**
_For any_ valid customer update data, after updating a customer, retrieving that customer should reflect all the changes made.
**Validates: Requirements 6.3**

**Property 25: Customer deletion protection**
_For any_ customer that has associated sales, deletion attempts should fail with an error indicating the customer has purchase history.
**Validates: Requirements 6.4**

### Analytics Properties

**Property 26: Sales analytics accuracy**
_For any_ set of sales data, the calculated total sales count, total revenue, and average order value should match the actual sum and count of sales records.
**Validates: Requirements 7.1**

**Property 27: Top-selling products ranking**
_For any_ sales data, the top-selling products should be correctly ordered by total quantity sold in descending order.
**Validates: Requirements 7.2**

**Property 28: Sales date range grouping**
_For any_ date range, sales should be correctly grouped by day with accurate totals for each day.
**Validates: Requirements 7.3**

**Property 29: Payment method aggregation**
_For any_ sales data, the payment method breakdown should correctly sum sales count and revenue for each payment method.
**Validates: Requirements 7.4**

**Property 30: Inventory analytics calculations**
_For any_ inventory data, the total inventory value should equal the sum of (price × stock) for all non-deleted items.
**Validates: Requirements 7.5**

### Access Control Properties

**Property 31: Role-based endpoint access**
_For any_ API endpoint with role requirements, requests from users without the required roles should be rejected with a 403 forbidden status.
**Validates: Requirements 8.1, 8.4**

### Stock Movement Properties

**Property 32: Stock movement ordering and details**
_For any_ stock movement retrieval, movements should be ordered by creation date (newest first) and include complete inventory item details.
**Validates: Requirements 10.5**

### Error Handling Properties

**Property 33: Input validation with Zod**
_For any_ API request with invalid data, the system should validate using Zod schemas and return a 400 status with detailed error messages describing what fields are invalid.
**Validates: Requirements 11.1**

**Property 34: Database constraint error handling**
_For any_ database operation that violates a constraint (unique, foreign key, not null), the system should catch the error and return a user-friendly message without exposing database internals.
**Validates: Requirements 11.2**

**Property 35: Resource not found handling**
_For any_ request for a non-existent resource ID, the system should return a 404 status with a message indicating which resource was not found.
**Validates: Requirements 11.3**

**Property 36: Unauthorized access error handling**
_For any_ request without valid authentication, the system should return a 401 status; for requests with valid authentication but insufficient permissions, the system should return a 403 status.
**Validates: Requirements 11.4**

**Property 37: Internal error security**
_For any_ unexpected error during request processing, the system should log the full error details server-side but return only a generic 500 status message to the client without exposing internal details.
**Validates: Requirements 11.5**

### Password Reset Properties

**Property 38: Reset token generation**
_For any_ password reset request for a valid user, a unique reset token should be created with an expiration timestamp set to 1 hour in the future.
**Validates: Requirements 12.1**

**Property 39: Reset token validation**
_For any_ password reset attempt, the token must exist in the database and have an expiration timestamp in the future for the reset to proceed.
**Validates: Requirements 12.2**

**Property 40: Password reset completion**
_For any_ valid reset token and new password, completing the reset should hash the new password, update the user record, and delete the reset token to prevent reuse.
**Validates: Requirements 12.3, 12.4**

## Error Handling

### Error Response Format

All API errors will follow a consistent format:

```typescript
interface ErrorResponse {
	error: {
		message: string;
		code: string;
		details?: any;
	};
}
```

### Error Categories

1. **Validation Errors (400)**

   - Invalid input data
   - Missing required fields
   - Format errors
   - Business rule violations

2. **Authentication Errors (401)**

   - Missing or invalid JWT token
   - Expired session
   - Invalid credentials

3. **Authorization Errors (403)**

   - Insufficient role permissions
   - Access to restricted resources

4. **Not Found Errors (404)**

   - Resource does not exist
   - Invalid resource ID

5. **Conflict Errors (409)**

   - Unique constraint violations
   - Concurrent modification conflicts

6. **Server Errors (500)**
   - Unexpected errors
   - Database connection failures
   - Internal service errors

### Error Handling Strategy

- Use try-catch blocks in all API route handlers
- Validate input data using Zod schemas before processing
- Catch Prisma errors and convert to user-friendly messages
- Log all errors server-side with full context
- Never expose sensitive information in error responses
- Return appropriate HTTP status codes

## Testing Strategy

### Unit Testing

Unit tests will verify specific functionality and edge cases:

- **Authentication functions**: Password hashing, JWT generation/verification, token extraction
- **Validation schemas**: Zod schema validation for all input types
- **Service functions**: Individual CRUD operations, business logic
- **Middleware**: Auth middleware, role checking functions
- **Error handlers**: Error transformation and response formatting
- **Utility functions**: Date formatting, currency calculations, data transformations

Unit tests will use:

- **Jest** as the test runner
- **@testing-library/react** for component testing (if needed)
- **Mocked Prisma client** for database operations
- **Supertest** for API endpoint testing

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** library:

- **Minimum 100 iterations** per property test to ensure thorough coverage
- Each property test will be tagged with a comment: `// Feature: backend-api-implementation, Property {number}: {property_text}`
- Tests will generate random valid inputs and verify properties hold
- Edge cases (empty strings, null values, boundary conditions) will be handled by generators

**Key Property Tests:**

- Authentication round-trips (login → session creation → validation → logout)
- CRUD operations maintain data integrity
- Role-based access control consistently enforces permissions
- Stock movements accurately track all inventory changes
- Soft deletes preserve data while filtering correctly
- Analytics calculations match actual data aggregations
- Error handling returns appropriate status codes and messages

### Integration Testing

Integration tests will verify end-to-end workflows:

- Complete sale workflow (create → complete → verify stock reduction)
- User authentication flow (login → access protected route → logout)
- Inventory management with stock movements
- Analytics queries return correct aggregated data
- Role-based access across multiple endpoints

### Test Database

- Use a separate test database to avoid affecting development data
- Reset database state between test suites
- Use Prisma migrations to set up test schema
- Seed test data for consistent test scenarios

### Testing Tools

- **Jest**: Test runner and assertion library
- **fast-check**: Property-based testing library
- **Supertest**: HTTP assertion library for API testing
- **Prisma Test Environment**: Custom Jest environment for database testing
- **MSW (Mock Service Worker)**: API mocking for frontend tests (if needed)

## Security Considerations

### Authentication Security

- JWT tokens stored in HTTP-only cookies (not localStorage)
- Secure flag enabled for cookies in production
- SameSite=Strict to prevent CSRF attacks
- Short token expiration (24 hours)
- Session validation on every request

### Password Security

- Bcrypt hashing with salt rounds = 10
- Passwords never returned in API responses
- Password reset tokens expire after 1 hour
- Reset tokens deleted after use

### Authorization Security

- Role-based access control on all protected endpoints
- Middleware validates roles before processing requests
- Data filtering based on user roles (CASHIER sees only their data)
- Principle of least privilege

### Data Security

- SQL injection prevention via Prisma parameterized queries
- Input validation using Zod schemas
- Soft deletes for audit trail preservation
- No sensitive data in error messages
- Server-side error logging only

### API Security

- Rate limiting (to be implemented)
- CORS configuration for allowed origins
- Request size limits
- Timeout configuration
- HTTPS enforcement in production

## Performance Considerations

### Database Optimization

- Indexes on frequently queried fields (userId, status, createdAt, barcode, SKU)
- Efficient joins using Prisma's include/select
- Raw SQL for complex analytics queries
- Connection pooling via Prisma
- Query result pagination for large datasets

### Caching Strategy

- Session caching (future enhancement)
- Analytics result caching with TTL
- Static data caching (categories)

### Query Optimization

- Select only needed fields
- Batch operations where possible
- Avoid N+1 queries using Prisma includes
- Use transactions for multi-step operations

## Deployment Considerations

### Environment Variables

Required environment variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=random-secret-key-min-32-chars
NODE_ENV=production|development
COOKIE_DOMAIN=yourdomain.com
```

### Database Migrations

- Run `npx prisma migrate deploy` before deployment
- Backup database before migrations
- Test migrations in staging environment

### Monitoring

- Log all authentication attempts
- Track API response times
- Monitor database connection pool
- Alert on error rate thresholds

## Future Enhancements

- Rate limiting per user/IP
- Refresh token implementation
- Multi-factor authentication
- Audit log for all data changes
- Real-time notifications via WebSockets
- Export functionality for reports
- Bulk operations for inventory
- Advanced analytics with date range filters
- Customer loyalty program integration
