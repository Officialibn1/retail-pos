# Implementation Plan

- [x] 1. Install dependencies and set up project structure

  - Install required packages: jsonwebtoken, bcryptjs, @types/jsonwebtoken, @types/bcryptjs
  - Create directory structure: lib/auth/, lib/middleware/, lib/services/, lib/validations/
  - Set up environment variables for JWT_SECRET and other config
  - _Requirements: All_

- [-] 2. Implement authentication utilities

  - [x] 2.1 Create JWT service for token generation and verification

    - Implement generateToken() to create JWT with user payload
    - Implement verifyToken() to validate and decode JWT
    - Implement getTokenFromCookies() to extract token from request
    - _Requirements: 1.1, 1.3_

  - [x] 2.2 Create password service with bcrypt

    - Implement hashPassword() for password hashing
    - Implement verifyPassword() for password verification
    - _Requirements: 1.1, 2.1_

  - [ ] 2.3 Write property test for password hashing

    - **Property 5: User creation with password hashing**
    - **Validates: Requirements 2.1**

  - [x] 2.4 Create session service for database operations

    - Implement createSession() to store session in database
    - Implement getSession() to retrieve and validate session
    - Implement deleteSession() to remove session on logout
    - Implement cleanupExpiredSessions() utility
    - _Requirements: 1.2, 1.5, 9.1, 9.4_

  - [ ] 2.5 Write property test for session lifecycle
    - **Property 2: Session creation with JWT**
    - **Property 4: Logout session cleanup**
    - **Validates: Requirements 1.2, 1.5, 9.1, 9.4**

- [x] 3. Implement authentication middleware

  - [x] 3.1 Create auth middleware for protected routes

    - Implement requireAuth() to validate JWT and session
    - Implement requireRoles() for role-based access control
    - Handle authentication errors with proper status codes
    - _Requirements: 1.3, 8.1, 8.4_

  - [ ]\* 3.2 Write property test for authentication middleware
    - **Property 3: Protected route authentication**
    - **Property 31: Role-based endpoint access**
    - **Validates: Requirements 1.3, 8.1, 8.4**

- [x] 4. Implement Zod validation schemas

  - [x] 4.1 Create validation schemas for all entities

    - Create schemas for User (create, update, login)
    - Create schemas for InventoryItem (create, update, stock adjustment)
    - Create schemas for Sale (create, complete, cancel)
    - Create schemas for Customer (create, update)
    - Create schemas for Category (create, update)
    - Create schemas for PasswordReset (request, reset)
    - _Requirements: 11.1_

  - [ ]\* 4.2 Write property test for validation
    - **Property 33: Input validation with Zod**
    - **Validates: Requirements 11.1**

- [x] 5. Implement authentication API routes

  - [x] 5.1 Create POST /api/auth/login endpoint

    - Validate credentials using Zod schema
    - Verify user exists and password matches
    - Generate JWT token and create session
    - Set HTTP-only cookie with token
    - Return user data (excluding password)
    - _Requirements: 1.1, 1.2_

  - [ ]\* 5.2 Write property test for login flow

    - **Property 1: Password verification and JWT generation**
    - **Validates: Requirements 1.1**

  - [x] 5.3 Create POST /api/auth/logout endpoint

    - Extract token from cookies
    - Delete session from database
    - Clear authentication cookie
    - _Requirements: 1.5, 9.4_

  - [x] 5.4 Create GET /api/auth/me endpoint

    - Use requireAuth middleware
    - Return current user data from session
    - Exclude password from response
    - _Requirements: 1.3, 2.2_

  - [ ]\* 5.5 Write property test for password exclusion
    - **Property 6: Password exclusion in responses**
    - **Validates: Requirements 2.2**

- [x] 6. Implement password reset API routes

  - [x] 6.1 Create password reset token service

    - Implement createResetToken() to generate and store token
    - Implement verifyResetToken() to validate token
    - _Requirements: 12.1, 12.2_

  - [x] 6.2 Create POST /api/auth/request-reset endpoint

    - Validate email using Zod schema
    - Generate reset token with 1-hour expiration
    - Store token in database
    - _Requirements: 12.1_

  - [ ]\* 6.3 Write property test for reset token generation

    - **Property 38: Reset token generation**
    - **Validates: Requirements 12.1**

  - [x] 6.4 Create POST /api/auth/reset-password endpoint

    - Validate token and new password
    - Verify token exists and not expired
    - Hash new password and update user
    - Delete used token
    - _Requirements: 12.2, 12.3, 12.4_

  - [ ]\* 6.5 Write property test for password reset completion
    - **Property 39: Reset token validation**
    - **Property 40: Password reset completion**
    - **Validates: Requirements 12.2, 12.3, 12.4**

- [ ] 7. Implement user service and API routes

  - [x] 7.1 Create user service with CRUD operations

    - Implement createUser() with password hashing
    - Implement getUserById() and getUserByEmail()
    - Implement updateUser() with validation
    - Implement deleteUser() with cascade
    - Implement listUsers() excluding passwords
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 7.2 Create POST /api/users endpoint (SUPERADMIN only)

    - Use requireAuth and requireRoles middleware
    - Validate input with Zod schema
    - Hash password before storing
    - Set default CASHIER role
    - Return created user (excluding password)
    - _Requirements: 2.1, 2.5_

  - [x] 7.3 Create GET /api/users endpoint (SUPERADMIN only)

    - Use requireAuth and requireRoles middleware
    - Return all users excluding passwords
    - _Requirements: 2.2, 2.5_

  - [x] 7.4 Create GET /api/users/[id] endpoint (SUPERADMIN only)

    - Use requireAuth and requireRoles middleware
    - Return user by ID excluding password
    - Handle 404 if user not found
    - _Requirements: 2.2, 2.5, 11.3_

  - [x] 7.5 Create PUT /api/users/[id] endpoint (SUPERADMIN only)

    - Use requireAuth and requireRoles middleware
    - Validate update data with Zod schema
    - Update user record
    - Return updated user (excluding password)
    - _Requirements: 2.3, 2.5_

  - [ ]\* 7.6 Write property test for user update persistence

    - **Property 7: User update persistence**
    - **Validates: Requirements 2.3**

  - [x] 7.7 Create DELETE /api/users/[id] endpoint (SUPERADMIN only)

    - Use requireAuth and requireRoles middleware
    - Delete user (cascade deletes sessions)
    - Return success response
    - _Requirements: 2.4, 2.5_

  - [ ]\* 7.8 Write property test for user deletion cascade

    - **Property 8: User deletion cascade**
    - **Validates: Requirements 2.4, 9.5**

  - [ ]\* 7.9 Write property test for role-based user management
    - **Property 9: Role-based user management access**
    - **Validates: Requirements 2.5**

- [x] 8. Implement category service and API routes

  - [x] 8.1 Create category service with CRUD operations

    - Implement createCategory() with uniqueness check
    - Implement getCategoryById() with items
    - Implement updateCategory() with uniqueness check
    - Implement deleteCategory() with reference check
    - Implement listCategories() with item counts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.2 Create POST /api/categories endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Validate input with Zod schema
    - Ensure category name uniqueness
    - Return created category
    - _Requirements: 4.1_

  - [ ]\* 8.3 Write property test for category name uniqueness

    - **Property 15: Category name uniqueness**
    - **Validates: Requirements 4.1, 4.3**

  - [x] 8.4 Create GET /api/categories endpoint

    - Use requireAuth middleware
    - Return all categories with item counts
    - _Requirements: 4.2_

  - [ ]\* 8.5 Write property test for category with item counts

    - **Property 16: Category with item counts and relationships**
    - **Validates: Requirements 4.2, 4.5**

  - [x] 8.6 Create GET /api/categories/[id] endpoint

    - Use requireAuth middleware
    - Return category with all inventory items
    - Handle 404 if category not found
    - _Requirements: 4.5, 11.3_

  - [x] 8.7 Create PUT /api/categories/[id] endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Validate update data with Zod schema
    - Ensure name uniqueness
    - Return updated category
    - _Requirements: 4.3_

  - [x] 8.8 Create DELETE /api/categories/[id] endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Check for associated inventory items
    - Prevent deletion if items exist
    - Return success or error response
    - _Requirements: 4.4_

  - [ ]\* 8.9 Write property test for category deletion protection
    - **Property 17: Category deletion protection**
    - **Validates: Requirements 4.4**

- [x] 9. Implement inventory service and API routes

  - [x] 9.1 Create inventory service with CRUD operations

    - Implement createInventoryItem() with SKU uniqueness
    - Implement getInventoryItemById() excluding deleted
    - Implement updateInventoryItem() with validation
    - Implement softDeleteInventoryItem() setting deletedAt
    - Implement listInventoryItems() excluding deleted
    - Implement adjustStock() creating stock movement
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.2 Create POST /api/inventory endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Validate input with Zod schema
    - Ensure SKU uniqueness
    - Return created inventory item
    - _Requirements: 3.1_

  - [ ]\* 9.3 Write property test for SKU uniqueness

    - **Property 10: SKU uniqueness enforcement**
    - **Validates: Requirements 3.1**

  - [x] 9.4 Create GET /api/inventory endpoint

    - Use requireAuth middleware
    - Return all non-deleted inventory items with categories
    - Support optional query params for filtering
    - _Requirements: 3.2_

  - [ ]\* 9.5 Write property test for soft delete filtering

    - **Property 11: Soft delete filtering**
    - **Validates: Requirements 3.2**

  - [x] 9.6 Create GET /api/inventory/[id] endpoint

    - Use requireAuth middleware
    - Return inventory item by ID (excluding deleted)
    - Include category information
    - Handle 404 if not found or deleted
    - _Requirements: 3.2, 11.3_

  - [x] 9.7 Create PUT /api/inventory/[id] endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Validate update data with Zod schema
    - Update inventory item
    - Return updated item
    - _Requirements: 3.3_

  - [ ]\* 9.8 Write property test for inventory update persistence

    - **Property 12: Inventory update persistence**
    - **Validates: Requirements 3.3**

  - [x] 9.9 Create DELETE /api/inventory/[id] endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Perform soft delete by setting deletedAt
    - Return success response
    - _Requirements: 3.4_

  - [ ]\* 9.10 Write property test for soft delete behavior

    - **Property 13: Soft delete behavior**
    - **Validates: Requirements 3.4**

  - [x] 9.11 Create POST /api/inventory/[id]/adjust-stock endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Validate adjustment data with Zod schema
    - Update inventory stock
    - Create stock movement record
    - Return updated inventory item
    - _Requirements: 3.5, 10.1, 10.4_

  - [ ]\* 9.12 Write property test for stock adjustment with audit trail
    - **Property 14: Stock adjustment with audit trail**
    - **Validates: Requirements 3.5, 10.1, 10.4**

- [-] 10. Implement customer service and API routes

  - [x] 10.1 Create customer service with CRUD operations

    - Implement createCustomer() with phone uniqueness
    - Implement getCustomerById() with sales history
    - Implement updateCustomer() with validation
    - Implement deleteCustomer() with reference check
    - Implement listCustomers() with sales
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.2 Create POST /api/customers endpoint

    - Use requireAuth middleware
    - Validate input with Zod schema
    - Ensure phone uniqueness if provided
    - Return created customer
    - _Requirements: 6.1_

  - [ ]\* 10.3 Write property test for customer phone uniqueness

    - **Property 22: Customer phone uniqueness**
    - **Validates: Requirements 6.1**

  - [x] 10.4 Create GET /api/customers endpoint

    - Use requireAuth middleware
    - Return all customers with sales history
    - _Requirements: 6.2_

  - [ ]\* 10.5 Write property test for customer with sales history

    - **Property 23: Customer with sales history**
    - **Validates: Requirements 6.2, 6.5**

  - [x] 10.6 Create GET /api/customers/[id] endpoint

    - Use requireAuth middleware
    - Return customer with all associated sales
    - Handle 404 if customer not found
    - _Requirements: 6.5, 11.3_

  - [x] 10.7 Create PUT /api/customers/[id] endpoint

    - Use requireAuth middleware
    - Validate update data with Zod schema
    - Update customer record
    - Return updated customer
    - _Requirements: 6.3_

  - [ ]\* 10.8 Write property test for customer update persistence

    - **Property 24: Customer update persistence**
    - **Validates: Requirements 6.3**

  - [x] 10.9 Create DELETE /api/customers/[id] endpoint

    - Use requireAuth middleware
    - Check for associated sales
    - Prevent deletion if sales exist
    - Return success or error response
    - _Requirements: 6.4_

  - [ ]\* 10.10 Write property test for customer deletion protection
    - **Property 25: Customer deletion protection**
    - **Validates: Requirements 6.4**

- [x] 11. Implement sales service and API routes

  - [x] 11.1 Create sales service with transaction operations

    - Implement createSale() with stock validation
    - Implement getSaleById() with items and customer
    - Implement completeSale() with stock reduction
    - Implement cancelSale() with stock restoration
    - Implement listSales() with role-based filtering
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 11.2 Create POST /api/sales endpoint

    - Use requireAuth middleware
    - Validate input with Zod schema
    - Check inventory availability for all items
    - Create sale with PENDING status
    - Calculate and store total
    - Return created sale
    - _Requirements: 5.1_

  - [ ]\* 11.3 Write property test for sale creation with stock validation

    - **Property 18: Sale creation with stock validation**
    - **Validates: Requirements 5.1**

  - [x] 11.4 Create GET /api/sales endpoint

    - Use requireAuth middleware
    - Filter sales by role (CASHIER sees only their sales)
    - Return sales with items and customer info
    - _Requirements: 5.4, 8.5_

  - [ ]\* 11.5 Write property test for role-based sales filtering

    - **Property 21: Role-based sales filtering**
    - **Validates: Requirements 5.4, 8.5**

  - [x] 11.6 Create GET /api/sales/[id] endpoint

    - Use requireAuth middleware
    - Return sale with all items and customer
    - Apply role-based access (CASHIER can only see their sales)
    - Handle 404 if sale not found
    - _Requirements: 5.4, 11.3_

  - [x] 11.7 Create POST /api/sales/[id]/complete endpoint

    - Use requireAuth middleware
    - Validate payment data with Zod schema
    - Use database transaction for atomicity
    - Update sale status to COMPLETED
    - Record payment details and timestamps
    - Reduce inventory stock for all items
    - Create stock movement records with reason "SALE"
    - Return completed sale
    - _Requirements: 5.2, 10.2_

  - [ ]\* 11.8 Write property test for sale completion workflow

    - **Property 19: Sale completion workflow**
    - **Validates: Requirements 5.2, 10.2**

  - [x] 11.9 Create POST /api/sales/[id]/cancel endpoint

    - Use requireAuth middleware
    - Use database transaction for atomicity
    - Update sale status to CANCELLED
    - Restore inventory stock for all items
    - Create stock movement records with reason "SALE_CANCELLED"
    - Return cancelled sale
    - _Requirements: 5.3, 10.3_

  - [ ]\* 11.10 Write property test for sale cancellation reversal
    - **Property 20: Sale cancellation reversal**
    - **Validates: Requirements 5.3, 10.3**

- [x] 12. Implement stock movement API routes

  - [x] 12.1 Create GET /api/stock-movements endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Return stock movements ordered by date (newest first)
    - Include inventory item details
    - Support optional filtering by item ID
    - _Requirements: 10.5_

  - [ ]\* 12.2 Write property test for stock movement ordering
    - **Property 32: Stock movement ordering and details**
    - **Validates: Requirements 10.5**

- [x] 13. Implement analytics service with raw SQL

  - [x] 13.1 Create analytics service with SQL queries

    - Implement getSalesAnalytics() using raw SQL
    - Implement getTopSellingProducts() using raw SQL
    - Implement getSalesByDateRange() using raw SQL
    - Implement getPaymentMethodBreakdown() using raw SQL
    - Implement getInventoryAnalytics() using raw SQL
    - Implement getDashboardStats() using raw SQL
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 13.2 Create GET /api/analytics/sales endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Call getSalesAnalytics() with role-based filtering
    - Return total sales, revenue, average order value
    - Support optional date range query params
    - _Requirements: 7.1_

  - [ ]\* 13.3 Write property test for sales analytics accuracy

    - **Property 26: Sales analytics accuracy**
    - **Validates: Requirements 7.1**

  - [x] 13.4 Create GET /api/analytics/top-products endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Call getTopSellingProducts() with limit param
    - Return products ordered by quantity sold
    - _Requirements: 7.2_

  - [ ]\* 13.5 Write property test for top-selling products ranking

    - **Property 27: Top-selling products ranking**
    - **Validates: Requirements 7.2**

  - [x] 13.6 Create GET /api/analytics/sales-by-date endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Call getSalesByDateRange() with date params
    - Return sales grouped by day with totals
    - _Requirements: 7.3_

  - [ ]\* 13.7 Write property test for sales date range grouping

    - **Property 28: Sales date range grouping**
    - **Validates: Requirements 7.3**

  - [x] 13.8 Create GET /api/analytics/payment-methods endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Call getPaymentMethodBreakdown()
    - Return aggregated data by payment method
    - _Requirements: 7.4_

  - [ ]\* 13.9 Write property test for payment method aggregation

    - **Property 29: Payment method aggregation**
    - **Validates: Requirements 7.4**

  - [x] 13.10 Create GET /api/analytics/inventory endpoint (MANAGER+)

    - Use requireAuth and requireRoles middleware
    - Call getInventoryAnalytics()
    - Return total value, low stock items, category distribution
    - _Requirements: 7.5_

  - [ ]\* 13.11 Write property test for inventory analytics calculations

    - **Property 30: Inventory analytics calculations**
    - **Validates: Requirements 7.5**

  - [x] 13.12 Create GET /api/analytics/dashboard endpoint (MANAGER+)
    - Use requireAuth and requireRoles middleware
    - Call getDashboardStats() with role-based filtering
    - Return comprehensive dashboard statistics
    - _Requirements: 7.1, 7.5_

- [x] 14. Implement error handling utilities

  - [x] 14.1 Create error handling utilities

    - Create error response formatter
    - Create Prisma error handler for constraint violations
    - Create validation error handler for Zod errors
    - Create authentication error handler
    - Create authorization error handler
    - Create not found error handler
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]\* 14.2 Write property test for database constraint error handling

    - **Property 34: Database constraint error handling**
    - **Validates: Requirements 11.2**

  - [ ]\* 14.3 Write property test for resource not found handling

    - **Property 35: Resource not found handling**
    - **Validates: Requirements 11.3**

  - [ ]\* 14.4 Write property test for unauthorized access error handling

    - **Property 36: Unauthorized access error handling**
    - **Validates: Requirements 11.4**

  - [ ]\* 14.5 Write property test for internal error security
    - **Property 37: Internal error security**
    - **Validates: Requirements 11.5**

- [x] 15. Update TypeScript types to match Prisma schema

  - [x] 15.1 Update lib/types.ts to align with Prisma models
    - Update User type to match Prisma User model (roles array, shift enum)
    - Update InventoryItem type to match Prisma model (stock instead of quantity, category relation)
    - Update Sale type to match Prisma model (remove saleNumber, tax, discount fields)
    - Update SaleItem type to match Prisma model (remove discount field)
    - Add missing types: Customer, Category, StockMovement, Session
    - Export Prisma enums: UserRole, SaleStatus, Shift, PaymentMethod
    - _Requirements: All_

- [x] 16. Update frontend to use API routes

  - [x] 16.1 Update AuthProvider to use API routes

    - Replace localStorage with API calls to /api/auth/login
    - Update login to handle JWT cookies
    - Update logout to call /api/auth/logout
    - Add session validation using /api/auth/me
    - _Requirements: 1.1, 1.5_

  - [x] 16.2 Update lib/auth.ts to use API

    - Replace getCurrentUser() with API call to /api/auth/me
    - Keep permission helper functions (canViewAllData, etc.)
    - _Requirements: 1.3_

  - [x] 16.3 Create API client utilities
    - Create fetchWithAuth() wrapper for authenticated requests
    - Add error handling for API responses
    - Add request/response interceptors
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 17. Update dashboard pages to use real data

  - [x] 17.1 Update dashboard/page.tsx

    - Replace mock data with API call to /api/analytics/dashboard
    - Handle loading and error states
    - _Requirements: 7.1, 7.5_

  - [x] 17.2 Update dashboard/analytics/page.tsx

    - Replace mock analytics with API calls to /api/analytics/\*
    - Fetch sales analytics, top products, payment methods
    - Handle loading and error states
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 17.3 Update dashboard/inventory/page.tsx

    - Replace mock inventory with API call to /api/inventory
    - Implement create, update, delete operations
    - Add stock adjustment functionality
    - Handle loading and error states
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 17.4 Update dashboard/sales/page.tsx

    - Replace mock sales with API call to /api/sales
    - Implement role-based filtering
    - Handle loading and error states
    - _Requirements: 5.4_

  - [x] 17.5 Update dashboard/sales/new/page.tsx

    - Replace mock data with API calls
    - Fetch inventory from /api/inventory
    - Create sale using /api/sales
    - Complete sale using /api/sales/[id]/complete
    - Handle loading and error states
    - _Requirements: 5.1, 5.2_

  - [x] 17.6 Update dashboard/users/page.tsx
    - Replace mock users with API call to /api/users
    - Implement create, update, delete operations
    - Add role-based access control
    - Handle loading and error states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 18. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Add API documentation

  - [x] 19.1 Create API documentation file
    - Document all endpoints with request/response examples
    - Document authentication requirements
    - Document error responses
    - Document rate limits and constraints
    - _Requirements: All_

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
