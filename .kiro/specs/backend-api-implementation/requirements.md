# Requirements Document

## Introduction

This document specifies the requirements for implementing a complete backend API system for a Retail Point of Sale (POS) application. The system SHALL provide secure authentication, comprehensive CRUD operations for all entities, role-based access control, and analytics capabilities using raw SQL queries. The backend SHALL replace the current mock data implementation with a fully functional database-backed API using PostgreSQL, Prisma ORM, and JWT-based authentication.

## Glossary

- **POS System**: The Point of Sale application that manages retail operations including sales, inventory, and user management
- **JWT**: JSON Web Token, a secure method for transmitting information between parties as a JSON object
- **Session**: An authenticated user's active connection to the system, tracked via JWT tokens stored in HTTP-only cookies
- **Prisma Client**: The auto-generated database client for type-safe database access
- **API Route**: A Next.js server-side endpoint that handles HTTP requests
- **Role-Based Access Control (RBAC)**: A security mechanism that restricts system access based on user roles
- **Raw SQL Query**: Direct SQL statements executed through Prisma for complex analytics operations
- **Soft Delete**: Marking records as deleted without physically removing them from the database
- **Stock Movement**: A record of inventory quantity changes with reason and timestamp
- **Sale Transaction**: A complete purchase record including items, payment, and customer information
- **Analytics Dashboard**: A reporting interface displaying aggregated sales and inventory metrics

## Requirements

### Requirement 1: User Authentication

**User Story:** As a system user, I want to securely log in with my credentials, so that I can access the POS system with appropriate permissions.

#### Acceptance Criteria

1. WHEN a user submits valid credentials THEN the system SHALL verify the password using bcrypt hashing and generate a JWT token
2. WHEN a JWT token is generated THEN the system SHALL store it in an HTTP-only cookie with secure flags and create a session record in the database
3. WHEN a user accesses a protected route THEN the system SHALL validate the JWT token from the cookie and verify the session exists in the database
4. WHEN a JWT token expires THEN the system SHALL reject the request and return an unauthorized status
5. WHEN a user logs out THEN the system SHALL invalidate the session in the database and clear the authentication cookie

### Requirement 2: User Management

**User Story:** As a SUPERADMIN, I want to manage user accounts, so that I can control who has access to the system and their permission levels.

#### Acceptance Criteria

1. WHEN a SUPERADMIN creates a user THEN the system SHALL create a random password and hash it using bcrypt and store the user with default CASHIER role if a role is not provided, then sends the new user an email using nodemailer with his informtions, Name, Email, Username, Password, Role, and Shift
2. WHEN a SUPERADMIN retrieves users THEN the system SHALL return all users excluding password hashes
3. WHEN a SUPERADMIN updates a user THEN the system SHALL validate the changes and update the user record
4. WHEN a SUPERADMIN deletes a user THEN the system SHALL remove the user and cascade delete all related sessions
5. WHEN a non-SUPERADMIN attempts user management operations THEN the system SHALL reject the request with a forbidden status

### Requirement 3: Inventory Management

**User Story:** As a MANAGER, I want to manage inventory items, so that I can maintain accurate product information and stock levels.

#### Acceptance Criteria

1. WHEN a MANAGER creates an inventory item THEN the system SHALL validate required fields and ensure SKU uniqueness
2. WHEN a MANAGER retrieves inventory items THEN the system SHALL return only non-deleted items with category information
3. WHEN a MANAGER updates an inventory item THEN the system SHALL validate the changes and update the item record
4. WHEN a MANAGER deletes an inventory item THEN the system SHALL perform a soft delete by setting the deletedAt timestamp
5. WHEN a MANAGER adjusts stock quantity THEN the system SHALL create a stock movement record with reason and update the inventory item stock

### Requirement 4: Category Management

**User Story:** As a MANAGER, I want to manage product categories, so that I can organize inventory items logically.

#### Acceptance Criteria

1. WHEN a MANAGER creates a category THEN the system SHALL ensure the category name is unique
2. WHEN a MANAGER retrieves categories THEN the system SHALL return all categories with item counts
3. WHEN a MANAGER updates a category THEN the system SHALL validate the name uniqueness and update the record
4. WHEN a MANAGER deletes a category THEN the system SHALL prevent deletion if inventory items reference it
5. WHEN retrieving a category THEN the system SHALL include all associated inventory items

### Requirement 5: Sales Processing

**User Story:** As a CASHIER, I want to process sales transactions, so that I can complete customer purchases and track revenue.

#### Acceptance Criteria

1. WHEN a CASHIER creates a sale THEN the system SHALL validate inventory availability and create sale records with PENDING status
2. WHEN a CASHIER completes a sale THEN the system SHALL update the status to COMPLETED, record payment details, reduce inventory stock, and create stock movement records
3. WHEN a CASHIER cancels a sale THEN the system SHALL update the status to CANCELLED, restore inventory stock, and create reversal stock movement records
4. WHEN a CASHIER retrieves sales THEN the system SHALL return sales filtered by user role permissions with related items and customer information
5. WHEN completing a sale with insufficient stock THEN the system SHALL reject the transaction and return an error

### Requirement 6: Customer Management

**User Story:** As a CASHIER, I want to manage customer information, so that I can associate sales with customers and track purchase history.

#### Acceptance Criteria

1. WHEN a CASHIER creates a customer THEN the system SHALL validate phone uniqueness if provided
2. WHEN a CASHIER retrieves customers THEN the system SHALL return all customers with their sales history
3. WHEN a CASHIER updates a customer THEN the system SHALL validate the changes and update the record
4. WHEN a CASHIER deletes a customer THEN the system SHALL prevent deletion if sales reference the customer
5. WHEN retrieving a customer THEN the system SHALL include all associated sales

### Requirement 7: Analytics and Reporting

**User Story:** As a MANAGER, I want to view comprehensive analytics, so that I can make informed business decisions based on sales and inventory data.

#### Acceptance Criteria

1. WHEN a MANAGER requests sales analytics THEN the system SHALL execute raw SQL queries to calculate total sales, revenue, and average order value
2. WHEN a MANAGER requests top-selling products THEN the system SHALL execute raw SQL queries to aggregate sales by product and return the top 5
3. WHEN a MANAGER requests sales by date range THEN the system SHALL execute raw SQL queries to group sales by day with totals
4. WHEN a MANAGER requests payment method breakdown THEN the system SHALL execute raw SQL queries to aggregate sales by payment method
5. WHEN a MANAGER requests inventory analytics THEN the system SHALL execute raw SQL queries to calculate total value, low stock items, and category distribution

### Requirement 8: Role-Based Access Control

**User Story:** As a system administrator, I want role-based access control enforced, so that users can only perform actions appropriate to their role.

#### Acceptance Criteria

1. WHEN a user accesses an endpoint THEN the system SHALL verify the user's role against required permissions
2. WHEN a CASHIER attempts to access MANAGER-only endpoints THEN the system SHALL reject the request with a forbidden status
3. WHEN a MANAGER attempts to access SUPERADMIN-only endpoints THEN the system SHALL reject the request with a forbidden status
4. WHEN a user's role includes required permissions THEN the system SHALL allow the request to proceed
5. WHEN checking data visibility THEN the system SHALL filter results based on role permissions

### Requirement 9: Session Management

**User Story:** As a system user, I want my sessions to be securely managed, so that my authentication remains valid and secure.

#### Acceptance Criteria

1. WHEN a user logs in THEN the system SHALL create a session record with a unique token and expiration timestamp
2. WHEN validating a request THEN the system SHALL verify the session exists and has not expired
3. WHEN a session expires THEN the system SHALL reject requests using that session
4. WHEN a user logs out THEN the system SHALL delete the session record from the database
5. WHEN a user is deleted THEN the system SHALL cascade delete all associated sessions

### Requirement 10: Stock Movement Tracking

**User Story:** As a MANAGER, I want to track all stock movements, so that I can audit inventory changes and understand stock flow.

#### Acceptance Criteria

1. WHEN inventory stock changes THEN the system SHALL create a stock movement record with quantity, reason, and timestamp
2. WHEN a sale is completed THEN the system SHALL create stock movement records for each item with reason "SALE"
3. WHEN a sale is cancelled THEN the system SHALL create stock movement records for each item with reason "SALE_CANCELLED"
4. WHEN a MANAGER manually adjusts stock THEN the system SHALL create a stock movement record with the provided reason
5. WHEN retrieving stock movements THEN the system SHALL return movements ordered by creation date with inventory item details

### Requirement 11: Data Validation and Error Handling

**User Story:** As a developer, I want comprehensive data validation and error handling, so that the API provides clear feedback and maintains data integrity.

#### Acceptance Criteria

1. WHEN invalid data is submitted THEN the system SHALL validate using Zod schemas and return detailed error messages
2. WHEN a database constraint is violated THEN the system SHALL catch the error and return a user-friendly message
3. WHEN a resource is not found THEN the system SHALL return a 404 status with a descriptive message
4. WHEN an unauthorized action is attempted THEN the system SHALL return a 401 or 403 status with a clear reason
5. WHEN an unexpected error occurs THEN the system SHALL log the error and return a generic 500 status without exposing internal details

### Requirement 12: Password Management

**User Story:** As a user, I want to securely reset my password, so that I can regain access if I forget my credentials.

#### Acceptance Criteria

1. WHEN a user requests a password reset THEN the system SHALL generate a unique token and store it with an expiration timestamp
2. WHEN a user submits a reset token THEN the system SHALL verify the token exists and has not expired
3. WHEN a valid reset token is provided with a new password THEN the system SHALL hash the password and update the user record
4. WHEN a reset token is used THEN the system SHALL delete the token to prevent reuse
5. WHEN a reset token expires THEN the system SHALL reject password reset attempts using that token
