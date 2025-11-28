# POS System API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limits & Constraints](#rate-limits--constraints)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Inventory](#inventory-endpoints)
   - [Categories](#category-endpoints)
   - [Sales](#sales-endpoints)
   - [Customers](#customer-endpoints)
   - [Stock Movements](#stock-movement-endpoints)
   - [Analytics](#analytics-endpoints)

---

## Overview

The POS System API is a RESTful API built with Next.js 14 App Router, providing comprehensive retail management capabilities including sales processing, inventory management, user management, and analytics.

**Base URL**: `http://localhost:3000/api` (development)

**Content Type**: All requests and responses use `application/json`

**Currency**: Nigerian Naira (₦)

---

## Authentication

### Authentication Method

The API uses JWT (JSON Web Token) authentication with HTTP-only cookies.

### How Authentication Works

1. **Login**: Send credentials to `/api/auth/login` to receive a JWT token
2. **Token Storage**: The JWT is automatically stored in an HTTP-only cookie named `auth-token`
3. **Authenticated Requests**: Include the cookie in subsequent requests (browsers handle this automatically)
4. **Token Expiration**: Tokens expire after 24 hours
5. **Logout**: Call `/api/auth/logout` to invalidate the session

### Cookie Configuration

```
Name: auth-token
HttpOnly: true
Secure: true (production only)
SameSite: Strict
Max-Age: 86400 (24 hours)
```

### Role-Based Access Control

The system supports four user roles with different permission levels:

| Role           | Permissions                                     |
| -------------- | ----------------------------------------------- |
| **SUPERADMIN** | Full system access, user management             |
| **ADMIN**      | Administrative access                           |
| **MANAGER**    | View all data, manage inventory, view analytics |
| **CASHIER**    | Basic sales and checkout operations             |

---

## Error Handling

### Error Response Format

All API errors follow a consistent JSON format:

```json
{
	"error": {
		"message": "Human-readable error message",
		"code": "ERROR_CODE",
		"details": {} // Optional additional context
	}
}
```

### HTTP Status Codes

| Status Code | Description           | Example                                     |
| ----------- | --------------------- | ------------------------------------------- |
| `200`       | Success               | Resource retrieved successfully             |
| `201`       | Created               | Resource created successfully               |
| `400`       | Bad Request           | Invalid input data, validation errors       |
| `401`       | Unauthorized          | Missing or invalid authentication token     |
| `403`       | Forbidden             | Insufficient permissions for the operation  |
| `404`       | Not Found             | Resource does not exist                     |
| `409`       | Conflict              | Unique constraint violation, duplicate data |
| `500`       | Internal Server Error | Unexpected server error                     |

### Common Error Codes

```json
// Validation Error (400)
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}

// Authentication Error (401)
{
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}

// Authorization Error (403)
{
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN"
  }
}

// Not Found Error (404)
{
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND"
  }
}

// Conflict Error (409)
{
  "error": {
    "message": "Email already exists",
    "code": "DUPLICATE_EMAIL"
  }
}
```

---

## Rate Limits & Constraints

### Request Limits

- **Request Size**: Maximum 10MB per request
- **Rate Limiting**: Not currently implemented (planned for future release)

### Data Constraints

| Field         | Constraint                                |
| ------------- | ----------------------------------------- |
| Email         | Must be unique, valid email format        |
| Username      | Must be unique, 3-50 characters           |
| Password      | Minimum 8 characters                      |
| SKU           | Must be unique per inventory item         |
| Phone         | Must be unique per customer (if provided) |
| Category Name | Must be unique                            |

### Business Rules

- **Soft Delete**: Inventory items are soft-deleted (marked with `deletedAt` timestamp)
- **Cascade Delete**: Deleting a user removes all their sessions
- **Reference Protection**: Cannot delete categories or customers with associated records
- **Stock Validation**: Sales require sufficient inventory stock
- **Role Filtering**: CASHIER users only see their own sales

---

## API Endpoints

## Authentication Endpoints

### POST /api/auth/login

Authenticate a user and create a session.

**Authentication**: None required

**Request Body**:

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

**Success Response** (200):

```json
{
	"user": {
		"id": "cm4h1234567890abcdef",
		"email": "user@example.com",
		"username": "johndoe",
		"fullName": "John Doe",
		"roles": ["CASHIER"],
		"shift": "MORNING",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T10:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Invalid credentials

**Example**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

---

### POST /api/auth/logout

Logout the current user and invalidate their session.

**Authentication**: Required

**Request Body**: None

**Success Response** (200):

```json
{
	"message": "Logged out successfully"
}
```

**Error Responses**:

- `401`: Not authenticated

**Example**:

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

### GET /api/auth/me

Get the current authenticated user's information.

**Authentication**: Required

**Request Body**: None

**Success Response** (200):

```json
{
	"user": {
		"id": "cm4h1234567890abcdef",
		"email": "user@example.com",
		"username": "johndoe",
		"fullName": "John Doe",
		"roles": ["CASHIER"],
		"shift": "MORNING",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T10:00:00.000Z"
	}
}
```

**Error Responses**:

- `401`: Not authenticated

**Example**:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

### POST /api/auth/request-reset

Request a password reset token.

**Authentication**: None required

**Request Body**:

```json
{
	"email": "user@example.com"
}
```

**Success Response** (200):

```json
{
	"message": "Password reset email sent"
}
```

**Error Responses**:

- `400`: Invalid email format
- `404`: User not found

**Example**:

```bash
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

### POST /api/auth/reset-password

Reset password using a valid reset token.

**Authentication**: None required

**Request Body**:

```json
{
	"token": "reset-token-string",
	"password": "newpassword123"
}
```

**Success Response** (200):

```json
{
	"message": "Password reset successfully"
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Invalid or expired token

**Example**:

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123","password":"newpassword123"}'
```

---

## User Endpoints

### GET /api/users

List all users in the system.

**Authentication**: Required (SUPERADMIN only)

**Request Body**: None

**Success Response** (200):

```json
{
	"users": [
		{
			"id": "cm4h1234567890abcdef",
			"email": "user@example.com",
			"username": "johndoe",
			"fullName": "John Doe",
			"roles": ["CASHIER"],
			"shift": "MORNING",
			"createdAt": "2024-11-27T10:00:00.000Z",
			"updatedAt": "2024-11-27T10:00:00.000Z"
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/users \
  -b cookies.txt
```

---

### POST /api/users

Create a new user.

**Authentication**: Required (SUPERADMIN only)

**Request Body**:

```json
{
	"email": "newuser@example.com",
	"username": "newuser",
	"fullName": "New User",
	"password": "password123",
	"roles": ["CASHIER"],
	"shift": "MORNING"
}
```

**Success Response** (201):

```json
{
	"user": {
		"id": "cm4h9876543210fedcba",
		"email": "newuser@example.com",
		"username": "newuser",
		"fullName": "New User",
		"roles": ["CASHIER"],
		"shift": "MORNING",
		"createdAt": "2024-11-27T11:00:00.000Z",
		"updatedAt": "2024-11-27T11:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `409`: Email or username already exists

**Example**:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"email":"newuser@example.com","username":"newuser","fullName":"New User","password":"password123","roles":["CASHIER"],"shift":"MORNING"}'
```

---

### GET /api/users/[id]

Get a specific user by ID.

**Authentication**: Required (SUPERADMIN only)

**URL Parameters**:

- `id` (string): User ID

**Success Response** (200):

```json
{
	"user": {
		"id": "cm4h1234567890abcdef",
		"email": "user@example.com",
		"username": "johndoe",
		"fullName": "John Doe",
		"roles": ["CASHIER"],
		"shift": "MORNING",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T10:00:00.000Z"
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found

**Example**:

```bash
curl -X GET http://localhost:3000/api/users/cm4h1234567890abcdef \
  -b cookies.txt
```

---

### PUT /api/users/[id]

Update a user's information.

**Authentication**: Required (SUPERADMIN only)

**URL Parameters**:

- `id` (string): User ID

**Request Body** (all fields optional):

```json
{
	"email": "updated@example.com",
	"username": "updateduser",
	"fullName": "Updated Name",
	"password": "newpassword123",
	"roles": ["MANAGER"],
	"shift": "EVENING"
}
```

**Success Response** (200):

```json
{
	"user": {
		"id": "cm4h1234567890abcdef",
		"email": "updated@example.com",
		"username": "updateduser",
		"fullName": "Updated Name",
		"roles": ["MANAGER"],
		"shift": "EVENING",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found
- `409`: Email or username already exists

**Example**:

```bash
curl -X PUT http://localhost:3000/api/users/cm4h1234567890abcdef \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"fullName":"Updated Name","roles":["MANAGER"]}'
```

---

### DELETE /api/users/[id]

Delete a user and all their sessions.

**Authentication**: Required (SUPERADMIN only)

**URL Parameters**:

- `id` (string): User ID

**Success Response** (200):

```json
{
	"message": "User deleted successfully"
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/users/cm4h1234567890abcdef \
  -b cookies.txt
```

---

## Inventory Endpoints

### GET /api/inventory

List all non-deleted inventory items.

**Authentication**: Required

**Query Parameters** (optional):

- `categoryId` (string): Filter by category ID
- `lowStock` (boolean): Filter items with stock below reorder level

**Success Response** (200):

```json
{
	"items": [
		{
			"id": "cm4i1234567890abcdef",
			"name": "Product Name",
			"description": "Product description",
			"sku": "SKU-001",
			"barcode": "1234567890123",
			"price": 1500.0,
			"cost": 1000.0,
			"stock": 50,
			"reorderLevel": 10,
			"categoryId": "cm4c1234567890abcdef",
			"category": {
				"id": "cm4c1234567890abcdef",
				"name": "Electronics",
				"description": "Electronic items"
			},
			"createdAt": "2024-11-27T10:00:00.000Z",
			"updatedAt": "2024-11-27T10:00:00.000Z",
			"deletedAt": null
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated

**Example**:

```bash
curl -X GET http://localhost:3000/api/inventory \
  -b cookies.txt

# With filters
curl -X GET "http://localhost:3000/api/inventory?categoryId=cm4c1234567890abcdef&lowStock=true" \
  -b cookies.txt
```

---

### POST /api/inventory

Create a new inventory item.

**Authentication**: Required (MANAGER+ only)

**Request Body**:

```json
{
	"name": "New Product",
	"description": "Product description",
	"sku": "SKU-002",
	"barcode": "9876543210987",
	"price": 2000.0,
	"cost": 1500.0,
	"stock": 100,
	"reorderLevel": 20,
	"categoryId": "cm4c1234567890abcdef"
}
```

**Success Response** (201):

```json
{
	"item": {
		"id": "cm4i9876543210fedcba",
		"name": "New Product",
		"description": "Product description",
		"sku": "SKU-002",
		"barcode": "9876543210987",
		"price": 2000.0,
		"cost": 1500.0,
		"stock": 100,
		"reorderLevel": 20,
		"categoryId": "cm4c1234567890abcdef",
		"createdAt": "2024-11-27T11:00:00.000Z",
		"updatedAt": "2024-11-27T11:00:00.000Z",
		"deletedAt": null
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `409`: SKU already exists

**Example**:

```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"New Product","sku":"SKU-002","price":2000,"cost":1500,"stock":100,"reorderLevel":20,"categoryId":"cm4c1234567890abcdef"}'
```

---

### GET /api/inventory/[id]

Get a specific inventory item by ID.

**Authentication**: Required

**URL Parameters**:

- `id` (string): Inventory item ID

**Success Response** (200):

```json
{
	"item": {
		"id": "cm4i1234567890abcdef",
		"name": "Product Name",
		"description": "Product description",
		"sku": "SKU-001",
		"barcode": "1234567890123",
		"price": 1500.0,
		"cost": 1000.0,
		"stock": 50,
		"reorderLevel": 10,
		"categoryId": "cm4c1234567890abcdef",
		"category": {
			"id": "cm4c1234567890abcdef",
			"name": "Electronics",
			"description": "Electronic items"
		},
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T10:00:00.000Z",
		"deletedAt": null
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `404`: Item not found or deleted

**Example**:

```bash
curl -X GET http://localhost:3000/api/inventory/cm4i1234567890abcdef \
  -b cookies.txt
```

---

### PUT /api/inventory/[id]

Update an inventory item.

**Authentication**: Required (MANAGER+ only)

**URL Parameters**:

- `id` (string): Inventory item ID

**Request Body** (all fields optional):

```json
{
	"name": "Updated Product Name",
	"description": "Updated description",
	"price": 1800.0,
	"cost": 1200.0,
	"stock": 75,
	"reorderLevel": 15,
	"categoryId": "cm4c9876543210fedcba"
}
```

**Success Response** (200):

```json
{
	"item": {
		"id": "cm4i1234567890abcdef",
		"name": "Updated Product Name",
		"description": "Updated description",
		"sku": "SKU-001",
		"barcode": "1234567890123",
		"price": 1800.0,
		"cost": 1200.0,
		"stock": 75,
		"reorderLevel": 15,
		"categoryId": "cm4c9876543210fedcba",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z",
		"deletedAt": null
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Item not found

**Example**:

```bash
curl -X PUT http://localhost:3000/api/inventory/cm4i1234567890abcdef \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Updated Product Name","price":1800}'
```

---

### DELETE /api/inventory/[id]

Soft delete an inventory item (sets deletedAt timestamp).

**Authentication**: Required (MANAGER+ only)

**URL Parameters**:

- `id` (string): Inventory item ID

**Success Response** (200):

```json
{
	"message": "Inventory item deleted successfully"
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Item not found

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/inventory/cm4i1234567890abcdef \
  -b cookies.txt
```

---

### POST /api/inventory/[id]/adjust-stock

Manually adjust inventory stock quantity.

**Authentication**: Required (MANAGER+ only)

**URL Parameters**:

- `id` (string): Inventory item ID

**Request Body**:

```json
{
	"quantity": 10,
	"reason": "RESTOCK",
	"notes": "Received new shipment"
}
```

**Reason Values**:

- `RESTOCK`: Adding new stock
- `DAMAGE`: Removing damaged items
- `LOSS`: Removing lost items
- `ADJUSTMENT`: Manual correction
- `RETURN`: Customer return

**Success Response** (200):

```json
{
	"item": {
		"id": "cm4i1234567890abcdef",
		"name": "Product Name",
		"stock": 60,
		"updatedAt": "2024-11-27T12:00:00.000Z"
	},
	"movement": {
		"id": "cm4m1234567890abcdef",
		"inventoryItemId": "cm4i1234567890abcdef",
		"quantity": 10,
		"reason": "RESTOCK",
		"notes": "Received new shipment",
		"createdAt": "2024-11-27T12:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Item not found

**Example**:

```bash
curl -X POST http://localhost:3000/api/inventory/cm4i1234567890abcdef/adjust-stock \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"quantity":10,"reason":"RESTOCK","notes":"Received new shipment"}'
```

---

## Category Endpoints

### GET /api/categories

List all categories with item counts.

**Authentication**: Required

**Success Response** (200):

```json
{
	"categories": [
		{
			"id": "cm4c1234567890abcdef",
			"name": "Electronics",
			"description": "Electronic items",
			"createdAt": "2024-11-27T10:00:00.000Z",
			"updatedAt": "2024-11-27T10:00:00.000Z",
			"_count": {
				"items": 15
			}
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated

**Example**:

```bash
curl -X GET http://localhost:3000/api/categories \
  -b cookies.txt
```

---

### POST /api/categories

Create a new category.

**Authentication**: Required (MANAGER+ only)

**Request Body**:

```json
{
	"name": "Clothing",
	"description": "Apparel and accessories"
}
```

**Success Response** (201):

```json
{
	"category": {
		"id": "cm4c9876543210fedcba",
		"name": "Clothing",
		"description": "Apparel and accessories",
		"createdAt": "2024-11-27T11:00:00.000Z",
		"updatedAt": "2024-11-27T11:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `409`: Category name already exists

**Example**:

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Clothing","description":"Apparel and accessories"}'
```

---

### GET /api/categories/[id]

Get a specific category with all its inventory items.

**Authentication**: Required

**URL Parameters**:

- `id` (string): Category ID

**Success Response** (200):

```json
{
	"category": {
		"id": "cm4c1234567890abcdef",
		"name": "Electronics",
		"description": "Electronic items",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T10:00:00.000Z",
		"items": [
			{
				"id": "cm4i1234567890abcdef",
				"name": "Product Name",
				"sku": "SKU-001",
				"price": 1500.0,
				"stock": 50
			}
		]
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `404`: Category not found

**Example**:

```bash
curl -X GET http://localhost:3000/api/categories/cm4c1234567890abcdef \
  -b cookies.txt
```

---

### PUT /api/categories/[id]

Update a category.

**Authentication**: Required (MANAGER+ only)

**URL Parameters**:

- `id` (string): Category ID

**Request Body** (all fields optional):

```json
{
	"name": "Updated Category Name",
	"description": "Updated description"
}
```

**Success Response** (200):

```json
{
	"category": {
		"id": "cm4c1234567890abcdef",
		"name": "Updated Category Name",
		"description": "Updated description",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Category not found
- `409`: Category name already exists

**Example**:

```bash
curl -X PUT http://localhost:3000/api/categories/cm4c1234567890abcdef \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Updated Category Name"}'
```

---

### DELETE /api/categories/[id]

Delete a category (only if no inventory items reference it).

**Authentication**: Required (MANAGER+ only)

**URL Parameters**:

- `id` (string): Category ID

**Success Response** (200):

```json
{
	"message": "Category deleted successfully"
}
```

**Error Responses**:

- `400`: Category has associated inventory items
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Category not found

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/categories/cm4c1234567890abcdef \
  -b cookies.txt
```

---

## Sales Endpoints

### GET /api/sales

List sales (filtered by user role).

**Authentication**: Required

**Query Parameters** (optional):

- `status` (string): Filter by status (PENDING, COMPLETED, CANCELLED)
- `customerId` (string): Filter by customer ID
- `startDate` (ISO date): Filter sales from this date
- `endDate` (ISO date): Filter sales until this date

**Role-Based Filtering**:

- CASHIER: Only sees their own sales
- MANAGER/ADMIN/SUPERADMIN: Sees all sales

**Success Response** (200):

```json
{
	"sales": [
		{
			"id": "cm4s1234567890abcdef",
			"userId": "cm4h1234567890abcdef",
			"customerId": "cm4cu123456789abcdef",
			"status": "COMPLETED",
			"total": 5000.0,
			"paymentMethod": "CASH",
			"amountPaid": 5000.0,
			"changeGiven": 0.0,
			"completedAt": "2024-11-27T12:00:00.000Z",
			"createdAt": "2024-11-27T11:55:00.000Z",
			"updatedAt": "2024-11-27T12:00:00.000Z",
			"user": {
				"id": "cm4h1234567890abcdef",
				"fullName": "John Doe"
			},
			"customer": {
				"id": "cm4cu123456789abcdef",
				"name": "Jane Smith",
				"phone": "+2348012345678"
			},
			"items": [
				{
					"id": "cm4si123456789abcdef",
					"inventoryItemId": "cm4i1234567890abcdef",
					"quantity": 2,
					"price": 1500.0,
					"inventoryItem": {
						"name": "Product Name",
						"sku": "SKU-001"
					}
				}
			]
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated

**Example**:

```bash
curl -X GET http://localhost:3000/api/sales \
  -b cookies.txt

# With filters
curl -X GET "http://localhost:3000/api/sales?status=COMPLETED&startDate=2024-11-01" \
  -b cookies.txt
```

---

### POST /api/sales

Create a new sale with PENDING status.

**Authentication**: Required

**Request Body**:

```json
{
	"customerId": "cm4cu123456789abcdef",
	"items": [
		{
			"inventoryItemId": "cm4i1234567890abcdef",
			"quantity": 2,
			"price": 1500.0
		},
		{
			"inventoryItemId": "cm4i9876543210fedcba",
			"quantity": 1,
			"price": 2000.0
		}
	]
}
```

**Success Response** (201):

```json
{
	"sale": {
		"id": "cm4s9876543210fedcba",
		"userId": "cm4h1234567890abcdef",
		"customerId": "cm4cu123456789abcdef",
		"status": "PENDING",
		"total": 5000.0,
		"paymentMethod": null,
		"amountPaid": null,
		"changeGiven": null,
		"completedAt": null,
		"createdAt": "2024-11-27T12:00:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z",
		"items": [
			{
				"id": "cm4si987654321fedcba",
				"inventoryItemId": "cm4i1234567890abcdef",
				"quantity": 2,
				"price": 1500.0
			}
		]
	}
}
```

**Error Responses**:

- `400`: Invalid input data, insufficient stock
- `401`: Not authenticated

**Example**:

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"customerId":"cm4cu123456789abcdef","items":[{"inventoryItemId":"cm4i1234567890abcdef","quantity":2,"price":1500}]}'
```

---

### GET /api/sales/[id]

Get a specific sale by ID.

**Authentication**: Required

**URL Parameters**:

- `id` (string): Sale ID

**Role-Based Access**:

- CASHIER: Can only view their own sales
- MANAGER/ADMIN/SUPERADMIN: Can view all sales

**Success Response** (200):

```json
{
	"sale": {
		"id": "cm4s1234567890abcdef",
		"userId": "cm4h1234567890abcdef",
		"customerId": "cm4cu123456789abcdef",
		"status": "COMPLETED",
		"total": 5000.0,
		"paymentMethod": "CASH",
		"amountPaid": 5000.0,
		"changeGiven": 0.0,
		"completedAt": "2024-11-27T12:00:00.000Z",
		"createdAt": "2024-11-27T11:55:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z",
		"user": {
			"id": "cm4h1234567890abcdef",
			"fullName": "John Doe"
		},
		"customer": {
			"id": "cm4cu123456789abcdef",
			"name": "Jane Smith",
			"phone": "+2348012345678"
		},
		"items": [
			{
				"id": "cm4si123456789abcdef",
				"inventoryItemId": "cm4i1234567890abcdef",
				"quantity": 2,
				"price": 1500.0,
				"inventoryItem": {
					"name": "Product Name",
					"sku": "SKU-001"
				}
			}
		]
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions (CASHIER viewing another user's sale)
- `404`: Sale not found

**Example**:

```bash
curl -X GET http://localhost:3000/api/sales/cm4s1234567890abcdef \
  -b cookies.txt
```

---

### POST /api/sales/[id]/complete

Complete a pending sale (process payment and reduce inventory).

**Authentication**: Required

**URL Parameters**:

- `id` (string): Sale ID

**Request Body**:

```json
{
	"paymentMethod": "CASH",
	"amountPaid": 5000.0
}
```

**Payment Methods**:

- `CASH`
- `CARD`
- `TRANSFER`
- `MOBILE_MONEY`

**Success Response** (200):

```json
{
	"sale": {
		"id": "cm4s1234567890abcdef",
		"userId": "cm4h1234567890abcdef",
		"customerId": "cm4cu123456789abcdef",
		"status": "COMPLETED",
		"total": 5000.0,
		"paymentMethod": "CASH",
		"amountPaid": 5000.0,
		"changeGiven": 0.0,
		"completedAt": "2024-11-27T12:00:00.000Z",
		"createdAt": "2024-11-27T11:55:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data, sale already completed, insufficient stock
- `401`: Not authenticated
- `404`: Sale not found

**Example**:

```bash
curl -X POST http://localhost:3000/api/sales/cm4s1234567890abcdef/complete \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"paymentMethod":"CASH","amountPaid":5000}'
```

---

### POST /api/sales/[id]/cancel

Cancel a sale and restore inventory stock.

**Authentication**: Required

**URL Parameters**:

- `id` (string): Sale ID

**Request Body**: None

**Success Response** (200):

```json
{
	"sale": {
		"id": "cm4s1234567890abcdef",
		"userId": "cm4h1234567890abcdef",
		"customerId": "cm4cu123456789abcdef",
		"status": "CANCELLED",
		"total": 5000.0,
		"paymentMethod": "CASH",
		"amountPaid": 5000.0,
		"changeGiven": 0.0,
		"completedAt": "2024-11-27T12:00:00.000Z",
		"createdAt": "2024-11-27T11:55:00.000Z",
		"updatedAt": "2024-11-27T12:05:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Sale already cancelled
- `401`: Not authenticated
- `404`: Sale not found

**Example**:

```bash
curl -X POST http://localhost:3000/api/sales/cm4s1234567890abcdef/cancel \
  -b cookies.txt
```

---

## Customer Endpoints

### GET /api/customers

List all customers with their sales history.

**Authentication**: Required

**Success Response** (200):

```json
{
	"customers": [
		{
			"id": "cm4cu123456789abcdef",
			"name": "Jane Smith",
			"email": "jane@example.com",
			"phone": "+2348012345678",
			"address": "123 Main St, Lagos",
			"createdAt": "2024-11-27T10:00:00.000Z",
			"updatedAt": "2024-11-27T10:00:00.000Z",
			"sales": [
				{
					"id": "cm4s1234567890abcdef",
					"total": 5000.0,
					"status": "COMPLETED",
					"completedAt": "2024-11-27T12:00:00.000Z"
				}
			]
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated

**Example**:

```bash
curl -X GET http://localhost:3000/api/customers \
  -b cookies.txt
```

---

### POST /api/customers

Create a new customer.

**Authentication**: Required

**Request Body**:

```json
{
	"name": "John Customer",
	"email": "john@example.com",
	"phone": "+2348098765432",
	"address": "456 Market St, Abuja"
}
```

**Success Response** (201):

```json
{
	"customer": {
		"id": "cm4cu987654321fedcba",
		"name": "John Customer",
		"email": "john@example.com",
		"phone": "+2348098765432",
		"address": "456 Market St, Abuja",
		"createdAt": "2024-11-27T12:00:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `409`: Phone number already exists

**Example**:

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"John Customer","email":"john@example.com","phone":"+2348098765432"}'
```

---

### GET /api/customers/[id]

Get a specific customer with all their sales.

**Authentication**: Required

**URL Parameters**:

- `id` (string): Customer ID

**Success Response** (200):

```json
{
	"customer": {
		"id": "cm4cu123456789abcdef",
		"name": "Jane Smith",
		"email": "jane@example.com",
		"phone": "+2348012345678",
		"address": "123 Main St, Lagos",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T10:00:00.000Z",
		"sales": [
			{
				"id": "cm4s1234567890abcdef",
				"total": 5000.0,
				"status": "COMPLETED",
				"completedAt": "2024-11-27T12:00:00.000Z",
				"items": [
					{
						"id": "cm4si123456789abcdef",
						"quantity": 2,
						"price": 1500.0,
						"inventoryItem": {
							"name": "Product Name"
						}
					}
				]
			}
		]
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `404`: Customer not found

**Example**:

```bash
curl -X GET http://localhost:3000/api/customers/cm4cu123456789abcdef \
  -b cookies.txt
```

---

### PUT /api/customers/[id]

Update a customer's information.

**Authentication**: Required

**URL Parameters**:

- `id` (string): Customer ID

**Request Body** (all fields optional):

```json
{
	"name": "Updated Name",
	"email": "updated@example.com",
	"phone": "+2348011111111",
	"address": "New address"
}
```

**Success Response** (200):

```json
{
	"customer": {
		"id": "cm4cu123456789abcdef",
		"name": "Updated Name",
		"email": "updated@example.com",
		"phone": "+2348011111111",
		"address": "New address",
		"createdAt": "2024-11-27T10:00:00.000Z",
		"updatedAt": "2024-11-27T12:00:00.000Z"
	}
}
```

**Error Responses**:

- `400`: Invalid input data
- `401`: Not authenticated
- `404`: Customer not found
- `409`: Phone number already exists

**Example**:

```bash
curl -X PUT http://localhost:3000/api/customers/cm4cu123456789abcdef \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Updated Name","phone":"+2348011111111"}'
```

---

### DELETE /api/customers/[id]

Delete a customer (only if no sales reference them).

**Authentication**: Required

**URL Parameters**:

- `id` (string): Customer ID

**Success Response** (200):

```json
{
	"message": "Customer deleted successfully"
}
```

**Error Responses**:

- `400`: Customer has associated sales
- `401`: Not authenticated
- `404`: Customer not found

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/customers/cm4cu123456789abcdef \
  -b cookies.txt
```

---

## Stock Movement Endpoints

### GET /api/stock-movements

List all stock movements with inventory item details.

**Authentication**: Required (MANAGER+ only)

**Query Parameters** (optional):

- `inventoryItemId` (string): Filter by inventory item ID
- `reason` (string): Filter by reason (SALE, SALE_CANCELLED, RESTOCK, DAMAGE, LOSS, ADJUSTMENT, RETURN)
- `startDate` (ISO date): Filter movements from this date
- `endDate` (ISO date): Filter movements until this date

**Success Response** (200):

```json
{
	"movements": [
		{
			"id": "cm4m1234567890abcdef",
			"inventoryItemId": "cm4i1234567890abcdef",
			"quantity": -2,
			"reason": "SALE",
			"notes": "Sale #cm4s1234567890abcdef",
			"createdAt": "2024-11-27T12:00:00.000Z",
			"inventoryItem": {
				"id": "cm4i1234567890abcdef",
				"name": "Product Name",
				"sku": "SKU-001",
				"stock": 48
			}
		},
		{
			"id": "cm4m9876543210fedcba",
			"inventoryItemId": "cm4i1234567890abcdef",
			"quantity": 10,
			"reason": "RESTOCK",
			"notes": "Received new shipment",
			"createdAt": "2024-11-27T11:00:00.000Z",
			"inventoryItem": {
				"id": "cm4i1234567890abcdef",
				"name": "Product Name",
				"sku": "SKU-001",
				"stock": 48
			}
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/stock-movements \
  -b cookies.txt

# With filters
curl -X GET "http://localhost:3000/api/stock-movements?inventoryItemId=cm4i1234567890abcdef&reason=SALE" \
  -b cookies.txt
```

---

## Analytics Endpoints

### GET /api/analytics/sales

Get sales analytics (total sales, revenue, average order value).

**Authentication**: Required (MANAGER+ only)

**Query Parameters** (optional):

- `startDate` (ISO date): Filter from this date
- `endDate` (ISO date): Filter until this date

**Role-Based Filtering**:

- CASHIER: Only their own sales (if they somehow access this endpoint)
- MANAGER/ADMIN/SUPERADMIN: All sales

**Success Response** (200):

```json
{
	"analytics": {
		"totalSales": 150,
		"totalRevenue": 750000.0,
		"averageOrderValue": 5000.0,
		"completedSales": 145,
		"pendingSales": 3,
		"cancelledSales": 2
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/analytics/sales \
  -b cookies.txt

# With date range
curl -X GET "http://localhost:3000/api/analytics/sales?startDate=2024-11-01&endDate=2024-11-30" \
  -b cookies.txt
```

---

### GET /api/analytics/top-products

Get top-selling products by quantity sold.

**Authentication**: Required (MANAGER+ only)

**Query Parameters** (optional):

- `limit` (number): Number of products to return (default: 5)
- `startDate` (ISO date): Filter from this date
- `endDate` (ISO date): Filter until this date

**Success Response** (200):

```json
{
	"products": [
		{
			"id": "cm4i1234567890abcdef",
			"name": "Product Name",
			"sku": "SKU-001",
			"totalQuantitySold": 250,
			"totalRevenue": 375000.0,
			"salesCount": 125
		},
		{
			"id": "cm4i9876543210fedcba",
			"name": "Another Product",
			"sku": "SKU-002",
			"totalQuantitySold": 180,
			"totalRevenue": 360000.0,
			"salesCount": 90
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/analytics/top-products \
  -b cookies.txt

# With limit
curl -X GET "http://localhost:3000/api/analytics/top-products?limit=10" \
  -b cookies.txt
```

---

### GET /api/analytics/sales-by-date

Get sales grouped by date with daily totals.

**Authentication**: Required (MANAGER+ only)

**Query Parameters** (optional):

- `startDate` (ISO date): Filter from this date (default: 30 days ago)
- `endDate` (ISO date): Filter until this date (default: today)

**Success Response** (200):

```json
{
	"salesByDate": [
		{
			"date": "2024-11-27",
			"salesCount": 15,
			"totalRevenue": 75000.0,
			"averageOrderValue": 5000.0
		},
		{
			"date": "2024-11-26",
			"salesCount": 12,
			"totalRevenue": 60000.0,
			"averageOrderValue": 5000.0
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/analytics/sales-by-date \
  -b cookies.txt

# With date range
curl -X GET "http://localhost:3000/api/analytics/sales-by-date?startDate=2024-11-01&endDate=2024-11-30" \
  -b cookies.txt
```

---

### GET /api/analytics/payment-methods

Get sales breakdown by payment method.

**Authentication**: Required (MANAGER+ only)

**Query Parameters** (optional):

- `startDate` (ISO date): Filter from this date
- `endDate` (ISO date): Filter until this date

**Success Response** (200):

```json
{
	"paymentMethods": [
		{
			"paymentMethod": "CASH",
			"salesCount": 80,
			"totalRevenue": 400000.0,
			"percentage": 53.33
		},
		{
			"paymentMethod": "CARD",
			"salesCount": 45,
			"totalRevenue": 225000.0,
			"percentage": 30.0
		},
		{
			"paymentMethod": "TRANSFER",
			"salesCount": 20,
			"totalRevenue": 100000.0,
			"percentage": 13.33
		},
		{
			"paymentMethod": "MOBILE_MONEY",
			"salesCount": 5,
			"totalRevenue": 25000.0,
			"percentage": 3.33
		}
	]
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/analytics/payment-methods \
  -b cookies.txt
```

---

### GET /api/analytics/inventory

Get inventory analytics (total value, low stock items, category distribution).

**Authentication**: Required (MANAGER+ only)

**Success Response** (200):

```json
{
	"analytics": {
		"totalItems": 150,
		"totalValue": 2250000.0,
		"lowStockItems": 12,
		"outOfStockItems": 3,
		"categoryDistribution": [
			{
				"categoryId": "cm4c1234567890abcdef",
				"categoryName": "Electronics",
				"itemCount": 45,
				"totalValue": 900000.0
			},
			{
				"categoryId": "cm4c9876543210fedcba",
				"categoryName": "Clothing",
				"itemCount": 60,
				"totalValue": 750000.0
			}
		],
		"lowStockItemsList": [
			{
				"id": "cm4i1234567890abcdef",
				"name": "Product Name",
				"sku": "SKU-001",
				"stock": 5,
				"reorderLevel": 10
			}
		]
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/analytics/inventory \
  -b cookies.txt
```

---

### GET /api/analytics/dashboard

Get comprehensive dashboard statistics.

**Authentication**: Required (MANAGER+ only)

**Query Parameters** (optional):

- `startDate` (ISO date): Filter from this date
- `endDate` (ISO date): Filter until this date

**Success Response** (200):

```json
{
	"dashboard": {
		"sales": {
			"totalSales": 150,
			"totalRevenue": 750000.0,
			"averageOrderValue": 5000.0,
			"completedSales": 145,
			"pendingSales": 3,
			"cancelledSales": 2
		},
		"inventory": {
			"totalItems": 150,
			"totalValue": 2250000.0,
			"lowStockItems": 12,
			"outOfStockItems": 3
		},
		"recentSales": [
			{
				"id": "cm4s1234567890abcdef",
				"total": 5000.0,
				"status": "COMPLETED",
				"completedAt": "2024-11-27T12:00:00.000Z",
				"customer": {
					"name": "Jane Smith"
				}
			}
		],
		"topProducts": [
			{
				"id": "cm4i1234567890abcdef",
				"name": "Product Name",
				"totalQuantitySold": 250,
				"totalRevenue": 375000.0
			}
		]
	}
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Insufficient permissions

**Example**:

```bash
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -b cookies.txt
```

---

## Appendix

### Data Types

#### User Roles

```typescript
enum UserRole {
	SUPERADMIN = "SUPERADMIN",
	ADMIN = "ADMIN",
	MANAGER = "MANAGER",
	CASHIER = "CASHIER",
}
```

#### Shift Types

```typescript
enum Shift {
	MORNING = "MORNING",
	AFTERNOON = "AFTERNOON",
	EVENING = "EVENING",
}
```

#### Sale Status

```typescript
enum SaleStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}
```

#### Payment Methods

```typescript
enum PaymentMethod {
	CASH = "CASH",
	CARD = "CARD",
	TRANSFER = "TRANSFER",
	MOBILE_MONEY = "MOBILE_MONEY",
}
```

#### Stock Movement Reasons

```typescript
enum StockMovementReason {
	SALE = "SALE",
	SALE_CANCELLED = "SALE_CANCELLED",
	RESTOCK = "RESTOCK",
	DAMAGE = "DAMAGE",
	LOSS = "LOSS",
	ADJUSTMENT = "ADJUSTMENT",
	RETURN = "RETURN",
}
```

### Common Request Headers

```
Content-Type: application/json
Cookie: auth-token=<jwt-token>
```

### Common Response Headers

```
Content-Type: application/json
Set-Cookie: auth-token=<jwt-token>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

### Testing with cURL

Save authentication cookie:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

Use saved cookie for authenticated requests:

```bash
curl -X GET http://localhost:3000/api/users \
  -b cookies.txt
```

### Testing with Postman

1. **Login**: Send POST request to `/api/auth/login` with credentials
2. **Cookie Management**: Postman automatically handles cookies
3. **Subsequent Requests**: Cookies are included automatically in requests to the same domain

### Security Best Practices

1. **Always use HTTPS in production** to protect JWT tokens in transit
2. **Never expose JWT tokens** in URLs or localStorage
3. **Validate all input data** on the server side
4. **Use strong passwords** (minimum 8 characters)
5. **Implement rate limiting** to prevent brute force attacks (planned)
6. **Log security events** for audit trails
7. **Keep dependencies updated** to patch security vulnerabilities

---

**Last Updated**: November 27, 2024  
**API Version**: 1.0.0  
**Contact**: For support, please contact your system administrator
