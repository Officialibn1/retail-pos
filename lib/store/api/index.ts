/**
 * RTK Query Base API Configuration
 *
 * This file configures the base API for all RTK Query endpoints.
 * It provides:
 * - Centralized API configuration with fetchBaseQuery
 * - Cookie-based authentication (credentials: 'include')
 * - Cache tag types for automatic invalidation
 * - Memory-only caching (no persistence)
 *
 * Requirements: 4.1, 4.3, 4.8
 */

import { PaymentMethod, SaleStatus } from "@/generated/prisma";
import { SaleWithDetails } from "@/lib/services/sale.service";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Cache tag types for automatic cache invalidation
 *
 * When a mutation invalidates a tag, all queries with that tag will refetch.
 * This ensures the UI always displays up-to-date information.
 *
 * Requirement 4.3: Cache responses with appropriate cache tags
 */
export const TAG_TYPES = [
	"Auth",
	"Inventory",
	"Sales",
	"Users",
	"Customers",
	"Categories",
	"ActivityLogs",
	"Analytics",
] as const;

export type TagType = (typeof TAG_TYPES)[number];

/**
 * Authentication API Types
 *
 * These types define the request and response structures for authentication endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// User data without password (safe for client-side)
export interface UserData {
	id: string;
	email: string;
	username: string;
	name: string;
	roles: string[];
	shift: string;
	createdAt: string;
	updatedAt: string;
}

// Login request body
export interface LoginRequest {
	email: string;
	password: string;
}

// Login response
export interface LoginResponse {
	user: UserData;
	message: string;
}

// Logout response
export interface LogoutResponse {
	message: string;
}

// API Error response structure
export interface ApiError {
	error: {
		message: string;
		code: string;
		details?: any;
	};
}

/**
 * Inventory API Types
 *
 * These types define the request and response structures for inventory endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Inventory item with category information
export interface InventoryItemWithCategory {
	id: string;
	name: string;
	description: string | null;
	price: number;
	stock: number;
	sku: string;
	barcode: string | null;
	categoryId: string;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
	category: {
		id: string;
		name: string;
	};
}

// Create inventory item request
export interface CreateInventoryItemRequest {
	name: string;
	description?: string | null;
	price: number | string;
	stock?: number;
	sku: string;
	barcode?: string | null;
	categoryId: string;
}

// Update inventory item request
export interface UpdateInventoryItemRequest {
	name?: string;
	description?: string | null;
	price?: number | string;
	stock?: number;
	sku?: string;
	barcode?: string | null;
	categoryId?: string;
}

// Adjust stock request
export interface AdjustStockRequest {
	quantity: number;
	reason:
		| "RESTOCK"
		| "DAMAGE"
		| "THEFT"
		| "ADJUSTMENT"
		| "RETURN"
		| "SALE"
		| "SALE_CANCELLED";
	notes?: string | null;
}

// Inventory item response (without category)
export interface InventoryItemResponse {
	id: string;
	name: string;
	description: string | null;
	price: number;
	stock: number;
	sku: string;
	barcode: string | null;
	categoryId: string;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

// Create inventory item response
export interface CreateInventoryItemResponse {
	message: string;
	item: InventoryItemResponse;
}

// Get inventory item response
export interface GetInventoryItemResponse {
	item: InventoryItemWithCategory;
}

// Update inventory item response
export interface UpdateInventoryItemResponse {
	message: string;
	item: InventoryItemResponse;
}

// Delete inventory item response
export interface DeleteInventoryItemResponse {
	message: string;
}

// Adjust stock response
export interface AdjustStockResponse {
	message: string;
	item: InventoryItemResponse;
}

/**
 * User Management API Types
 *
 * These types define the request and response structures for user management endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Create user request
export interface CreateUserRequest {
	email: string;
	username: string;
	name: string;
	password: string;
	roles?: string[];
	shift?: string;
}

// Update user request
export interface UpdateUserRequest {
	email?: string;
	username?: string;
	name?: string;
	password?: string;
	roles?: string[];
	shift?: string;
}

// User response (without password)
export interface UserResponse {
	id: string;
	email: string;
	username: string;
	name: string;
	roles: string[];
	shift: string;
	createdAt: string;
	updatedAt: string;
}

// Get users response
export interface GetUsersResponse {
	users: UserResponse[];
	count: number;
}

// Get user response
export interface GetUserResponse {
	user: UserResponse;
}

// Create user response
export interface CreateUserResponse {
	message: string;
	user: UserResponse;
}

// Update user response
export interface UpdateUserResponse {
	message: string;
	user: UserResponse;
}

// Delete user response
export interface DeleteUserResponse {
	message: string;
}

/**
 * Sales API Types
 *
 * These types define the request and response structures for sales endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Get sales query parameters
export interface GetSalesParams {
	status?: SaleStatus;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

// Sale item in a sale
export interface SaleItemData {
	id: string;
	quantity: number;
	price: number;
	inventoryItem: {
		id: string;
		name: string;
		sku: string;
	};
}

// Customer data in a sale
export interface SaleCustomerData {
	id: string;
	name: string | null;
	phone: string | null;
}

// User data in a sale
export interface SaleUserData {
	id: string;
	name: string;
	email: string;
}

// Sale without details (basic sale data)
export interface SaleData {
	id: string;
	total: number;
	status: SaleStatus;
	paymentMethod: PaymentMethod;
	amountPaid: number | null;
	changeGiven: number | null;
	completedAt: string | null;
	cancelledAt: string | null;
	createdAt: string;
	updatedAt: string;
	userId: string;
	customerId: string | null;
}

// Create sale request
export interface CreateSaleRequest {
	items: Array<{
		inventoryItemId: string;
		quantity: number;
		price: number | string;
	}>;
	customerId?: string | null;
	userId: string;
}

// Complete sale request
export interface CompleteSaleRequest {
	paymentMethod: PaymentMethod;
	amountPaid: number | string;
}

// Cancel sale request (no body required, but keeping for consistency)
export interface CancelSaleRequest {
	reason?: string;
}

/**
 * Customer API Types
 *
 * These types define the request and response structures for customer endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Customer data
export interface CustomerData {
	id: string;
	name: string | null;
	phone: string | null;
	email: string | null;
	createdAt: string;
	updatedAt: string;
}

// Customer with sales history
export interface CustomerWithSales extends CustomerData {
	sales: Array<{
		id: string;
		total: number;
		status: string;
		createdAt: string;
	}>;
	_count: {
		sales: number;
	};
}

// Create customer request
export interface CreateCustomerRequest {
	name?: string | null;
	phone?: string | null;
	email?: string | null;
}

// Update customer request
export interface UpdateCustomerRequest {
	name?: string | null;
	phone?: string | null;
	email?: string | null;
}

// Get customers response
export interface GetCustomersResponse {
	customers: CustomerWithSales[];
	count: number;
}

// Get customer response
export interface GetCustomerResponse {
	customer: CustomerWithSales;
}

// Create customer response
export interface CreateCustomerResponse {
	message: string;
	customer: CustomerData;
}

// Update customer response
export interface UpdateCustomerResponse {
	message: string;
	customer: CustomerData;
}

// Delete customer response
export interface DeleteCustomerResponse {
	message: string;
}

/**
 * Category API Types
 *
 * These types define the request and response structures for category endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Category data
export interface CategoryData {
	id: string;
	name: string;
}

// Category with item count
export interface CategoryWithCount extends CategoryData {
	_count: {
		items: number;
	};
}

// Category with items
export interface CategoryWithItems extends CategoryData {
	items: Array<{
		id: string;
		name: string;
		sku: string;
		stock: number;
	}>;
}

// Create category request
export interface CreateCategoryRequest {
	name: string;
}

// Update category request
export interface UpdateCategoryRequest {
	name: string;
}

// Get categories response
export interface GetCategoriesResponse {
	categories: CategoryWithCount[];
	count: number;
}

// Get category response
export interface GetCategoryResponse {
	category: CategoryWithItems;
}

// Create category response
export interface CreateCategoryResponse {
	message: string;
	category: CategoryData;
}

// Update category response
export interface UpdateCategoryResponse {
	message: string;
	category: CategoryData;
}

// Delete category response
export interface DeleteCategoryResponse {
	message: string;
}

/**
 * Analytics API Types
 *
 * These types define the request and response structures for analytics endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Dashboard statistics
export interface DashboardStats {
	totalSales: number;
	totalRevenue: number;
	averageOrderValue: number;
	totalProducts: number;
	lowStockCount: number;
	recentSales: Array<{
		id: string;
		total: number;
		status: string;
		createdAt: Date;
		customerName: string | null;
		itemCount: number;
	}>;
}

// Daily sales data
export interface DailySales {
	date: string;
	sales: number;
	revenue: number;
}

// Get sales by date query parameters
export interface GetSalesByDateParams {
	startDate?: string;
	endDate?: string;
}

// Top selling product data
export interface TopProduct {
	productId: string;
	productName: string;
	quantitySold: number;
	revenue: number;
}

// Get top products query parameters
export interface GetTopProductsParams {
	limit?: number;
}

// Payment method statistics
export interface PaymentMethodStats {
	method: string;
	count: number;
	revenue: number;
}

// Inventory analytics data
export interface InventoryAnalytics {
	totalProducts: number;
	totalValue: number;
	lowStockCount: number;
	lowStockItems: Array<{
		id: string;
		name: string;
		stock: number;
		price: number;
	}>;
	categoryDistribution: Array<{
		category: string;
		count: number;
		totalValue: number;
	}>;
}

/**
 * Activity Log API Types
 *
 * These types define the request and response structures for activity log endpoints.
 * Requirement 10.2: Specify request and response types for all endpoints
 */

// Activity log with user information
export interface ActivityLogWithUser {
	id: string;
	userId: string;
	action: string;
	details: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

// Get activity logs query parameters
export interface GetActivityLogsParams {
	limit?: number;
}

/**
 * Base API configuration using RTK Query
 *
 * Features:
 * - fetchBaseQuery for making HTTP requests
 * - credentials: 'include' for cookie-based authentication
 * - Cache tag types for automatic invalidation
 * - Memory-only caching (cache is cleared on page reload)
 *
 * Requirements:
 * - 4.1: Use RTK Query endpoints for all data fetching
 * - 4.3: Cache responses in memory with appropriate tags
 * - 4.8: Start with empty cache on initialization
 */
export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: "/",
		credentials: "include", // Include cookies for JWT authentication
		prepareHeaders: (headers) => {
			// Ensure Content-Type is set for requests with body
			if (!headers.has("Content-Type")) {
				headers.set("Content-Type", "application/json");
			}
			return headers;
		},
	}),
	tagTypes: TAG_TYPES,
	// Endpoints will be injected in subsequent tasks
	// This allows for code splitting and organization by feature
	endpoints: (builder) => ({
		/**
		 * Validate Session Query
		 *
		 * Validates the current authentication session by fetching user data.
		 * This endpoint is called on application initialization to restore auth state.
		 *
		 * Requirements:
		 * - 5.1: Create queries for session validation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Auth']
		 * - Tagged with 'Auth' so it can be invalidated on login/logout
		 */
		validateSession: builder.query<UserData, void>({
			query: () => "/api/auth/me",
			providesTags: ["Auth"],
		}),

		/**
		 * Login Mutation
		 *
		 * Authenticates a user with email and password.
		 * On success, sets an HTTP-only cookie with the JWT token.
		 *
		 * Requirements:
		 * - 5.1: Create mutations for login
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Auth']
		 * - Invalidates 'Auth' tag to trigger session validation refetch
		 */
		login: builder.mutation<LoginResponse, LoginRequest>({
			query: (credentials) => ({
				url: "/api/auth/login",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["Auth"],
		}),

		/**
		 * Logout Mutation
		 *
		 * Logs out the current user by invalidating their session.
		 * Clears the HTTP-only authentication cookie.
		 *
		 * Requirements:
		 * - 5.1: Create mutations for logout
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Auth']
		 * - Invalidates 'Auth' tag to clear cached user data
		 */
		logout: builder.mutation<LogoutResponse, void>({
			query: () => ({
				url: "/api/auth/logout",
				method: "POST",
			}),
			invalidatesTags: ["Auth"],
		}),

		/**
		 * Get Inventory Query
		 *
		 * Fetches all non-deleted inventory items with category information.
		 * Results are cached with 'Inventory' tag for automatic invalidation.
		 *
		 * Requirements:
		 * - 5.2: Create queries for fetching inventory
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Inventory']
		 * - Tagged with 'Inventory' so it can be invalidated on mutations
		 */
		getInventory: builder.query<InventoryItemWithCategory[], void>({
			query: () => "/api/inventory",
			providesTags: ["Inventory"],
		}),

		/**
		 * Get Inventory Item Query
		 *
		 * Fetches a single inventory item by ID with category information.
		 * Returns null if item is not found or has been deleted.
		 *
		 * Requirements:
		 * - 5.2: Create queries for fetching inventory
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Inventory']
		 * - Tagged with 'Inventory' so it can be invalidated on mutations
		 */
		getInventoryItem: builder.query<GetInventoryItemResponse, string>({
			query: (id) => `/api/inventory/${id}`,
			providesTags: ["Inventory"],
		}),

		/**
		 * Create Inventory Item Mutation
		 *
		 * Creates a new inventory item with the provided data.
		 * Validates SKU uniqueness and all required fields.
		 *
		 * Requirements:
		 * - 5.2: Create mutations for inventory management
		 * - 6.2: Invalidate inventory cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Inventory']
		 * - Invalidates 'Inventory' tag to trigger refetch of inventory lists
		 */
		createInventoryItem: builder.mutation<
			CreateInventoryItemResponse,
			CreateInventoryItemRequest
		>({
			query: (data) => ({
				url: "/api/inventory",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Inventory"],
		}),

		/**
		 * Update Inventory Item Mutation
		 *
		 * Updates an existing inventory item with the provided data.
		 * Validates SKU uniqueness if SKU is being changed.
		 *
		 * Requirements:
		 * - 5.2: Create mutations for inventory management
		 * - 6.2: Invalidate inventory cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Inventory']
		 * - Invalidates 'Inventory' tag to trigger refetch of inventory data
		 */
		updateInventoryItem: builder.mutation<
			UpdateInventoryItemResponse,
			{ id: string; data: UpdateInventoryItemRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/inventory/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Inventory"],
		}),

		/**
		 * Delete Inventory Item Mutation
		 *
		 * Soft deletes an inventory item by setting its deletedAt timestamp.
		 * The item will no longer appear in inventory lists.
		 *
		 * Requirements:
		 * - 5.2: Create mutations for inventory management
		 * - 6.2: Invalidate inventory cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Inventory']
		 * - Invalidates 'Inventory' tag to trigger refetch of inventory lists
		 */
		deleteInventoryItem: builder.mutation<DeleteInventoryItemResponse, string>({
			query: (id) => ({
				url: `/api/inventory/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Inventory"],
		}),

		/**
		 * Adjust Stock Mutation
		 *
		 * Adjusts the stock quantity for an inventory item.
		 * Creates a stock movement record for audit purposes.
		 * Validates that stock doesn't go negative.
		 *
		 * Requirements:
		 * - 5.2: Create mutations for stock adjustments
		 * - 6.2: Invalidate inventory cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Inventory']
		 * - Invalidates 'Inventory' tag to trigger refetch of inventory data
		 */
		adjustStock: builder.mutation<
			AdjustStockResponse,
			{ id: string; data: AdjustStockRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/inventory/${id}/adjust-stock`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Inventory"],
		}),

		/**
		 * Get Sales Query
		 *
		 * Fetches all sales with role-based filtering.
		 * CASHIER sees only their sales, MANAGER+ sees all sales.
		 * Returns sales with items, customer, and user information.
		 * Supports optional filtering by status, date range, and pagination.
		 *
		 * Requirements:
		 * - 5.3: Create queries for fetching sales
		 * - 10.2: Specify TypeScript types for request/response
		 * - 1.1: Support filtering by status (e.g., PENDING)
		 * - 1.4: Support date range filtering
		 *
		 * Cache Tags: ['Sales']
		 * - Tagged with 'Sales' so it can be invalidated on mutations
		 */
		getSales: builder.query<SaleWithDetails[], GetSalesParams | void>({
			query: (params) => ({
				url: "/api/sales",
				method: "GET",
				params: params || undefined,
			}),
			providesTags: ["Sales"],
		}),

		/**
		 * Get Sale Query
		 *
		 * Fetches a single sale by ID with role-based access control.
		 * CASHIER can only see their own sales.
		 * Returns sale with items, customer, and user information.
		 *
		 * Requirements:
		 * - 5.3: Create queries for fetching sales
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Sales']
		 * - Tagged with 'Sales' so it can be invalidated on mutations
		 */
		getSale: builder.query<SaleWithDetails, string>({
			query: (id) => `/api/sales/${id}`,
			providesTags: ["Sales"],
		}),

		/**
		 * Create Sale Mutation
		 *
		 * Creates a new sale with PENDING status.
		 * Validates inventory availability for all items.
		 * Does not reduce stock until sale is completed.
		 *
		 * Requirements:
		 * - 5.3: Create mutations for creating sales
		 * - 6.1: Invalidate sales cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Sales']
		 * - Invalidates 'Sales' tag to trigger refetch of sales lists
		 */
		createSale: builder.mutation<SaleData, CreateSaleRequest>({
			query: (data) => ({
				url: "/api/sales",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales"],
		}),

		/**
		 * Complete Sale Mutation
		 *
		 * Completes a sale with payment details.
		 * Updates status to COMPLETED, reduces inventory stock, creates stock movements.
		 * Calculates change given based on amount paid and total.
		 *
		 * Requirements:
		 * - 5.3: Create mutations for completing sales
		 * - 6.1: Invalidate sales and inventory cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Sales', 'Inventory']
		 * - Invalidates 'Sales' tag to trigger refetch of sales data
		 * - Invalidates 'Inventory' tag to trigger refetch of inventory (stock reduced)
		 */
		completeSale: builder.mutation<
			SaleData,
			{ id: string; data: CompleteSaleRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/sales/${id}/complete`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales", "Inventory"],
		}),

		/**
		 * Cancel Sale Mutation
		 *
		 * Cancels a sale and restores inventory stock if it was completed.
		 * Updates status to CANCELLED, restores inventory stock, creates stock movements.
		 * Can cancel both PENDING and COMPLETED sales.
		 *
		 * Requirements:
		 * - 5.3: Create mutations for canceling sales
		 * - 6.1: Invalidate sales and inventory cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Sales', 'Inventory']
		 * - Invalidates 'Sales' tag to trigger refetch of sales data
		 * - Invalidates 'Inventory' tag to trigger refetch of inventory (stock restored)
		 */
		cancelSale: builder.mutation<SaleData, string>({
			query: (id) => ({
				url: `/api/sales/${id}/cancel`,
				method: "POST",
			}),
			invalidatesTags: ["Sales", "Inventory"],
		}),

		/**
		 * Get Users Query
		 *
		 * Fetches all users in the system.
		 * Requires SUPERADMIN role for access.
		 * Returns users without password information.
		 *
		 * Requirements:
		 * - 5.4: Create queries for fetching users
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Users']
		 * - Tagged with 'Users' so it can be invalidated on mutations
		 */
		getUsers: builder.query<GetUsersResponse, void>({
			query: () => "/api/users",
			providesTags: ["Users"],
		}),

		/**
		 * Get User Query
		 *
		 * Fetches a single user by ID.
		 * Requires SUPERADMIN role for access.
		 * Returns user without password information.
		 *
		 * Requirements:
		 * - 5.4: Create queries for fetching users
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Users']
		 * - Tagged with 'Users' so it can be invalidated on mutations
		 */
		getUser: builder.query<GetUserResponse, string>({
			query: (id) => `/api/users/${id}`,
			providesTags: ["Users"],
		}),

		/**
		 * Create User Mutation
		 *
		 * Creates a new user with the provided data.
		 * Requires SUPERADMIN role for access.
		 * Validates email and username uniqueness.
		 * Hashes password before storage.
		 *
		 * Requirements:
		 * - 5.4: Create mutations for user management
		 * - 6.3: Invalidate users cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Users']
		 * - Invalidates 'Users' tag to trigger refetch of users lists
		 */
		createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
			query: (data) => ({
				url: "/api/users",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Users"],
		}),

		/**
		 * Update User Mutation
		 *
		 * Updates an existing user with the provided data.
		 * Requires SUPERADMIN role for access.
		 * Validates email and username uniqueness if being changed.
		 * Hashes password if being updated.
		 *
		 * Requirements:
		 * - 5.4: Create mutations for user management
		 * - 6.3: Invalidate users cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Users']
		 * - Invalidates 'Users' tag to trigger refetch of users data
		 */
		updateUser: builder.mutation<
			UpdateUserResponse,
			{ id: string; data: UpdateUserRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/users/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Users"],
		}),

		/**
		 * Delete User Mutation
		 *
		 * Deletes a user from the system.
		 * Requires SUPERADMIN role for access.
		 * Cascade deletes associated sessions.
		 *
		 * Requirements:
		 * - 5.4: Create mutations for user management
		 * - 6.3: Invalidate users cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Users']
		 * - Invalidates 'Users' tag to trigger refetch of users lists
		 */
		deleteUser: builder.mutation<DeleteUserResponse, string>({
			query: (id) => ({
				url: `/api/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Users"],
		}),

		/**
		 * Get Customers Query
		 *
		 * Fetches all customers with sales history.
		 * Returns customers with total sales count and amount.
		 *
		 * Requirements:
		 * - 5.6: Create queries for fetching customers
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Customers']
		 * - Tagged with 'Customers' so it can be invalidated on mutations
		 */
		getCustomers: builder.query<GetCustomersResponse, void>({
			query: () => "/api/customers",
			providesTags: ["Customers"],
		}),

		/**
		 * Get Customer Query
		 *
		 * Fetches a single customer by ID with all associated sales.
		 * Returns customer with detailed sales history.
		 *
		 * Requirements:
		 * - 5.6: Create queries for fetching customers
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Customers']
		 * - Tagged with 'Customers' so it can be invalidated on mutations
		 */
		getCustomer: builder.query<GetCustomerResponse, string>({
			query: (id) => `/api/customers/${id}`,
			providesTags: ["Customers"],
		}),

		/**
		 * Create Customer Mutation
		 *
		 * Creates a new customer with the provided data.
		 * Validates that at least one of name, phone, or email is provided.
		 * Validates phone uniqueness if provided.
		 *
		 * Requirements:
		 * - 5.6: Create mutations for customer management
		 * - 6.5: Invalidate customers cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Customers']
		 * - Invalidates 'Customers' tag to trigger refetch of customers lists
		 */
		createCustomer: builder.mutation<
			CreateCustomerResponse,
			CreateCustomerRequest
		>({
			query: (data) => ({
				url: "/api/customers",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Customers"],
		}),

		/**
		 * Update Customer Mutation
		 *
		 * Updates an existing customer with the provided data.
		 * Validates phone uniqueness if being changed.
		 *
		 * Requirements:
		 * - 5.6: Create mutations for customer management
		 * - 6.5: Invalidate customers cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Customers']
		 * - Invalidates 'Customers' tag to trigger refetch of customers data
		 */
		updateCustomer: builder.mutation<
			UpdateCustomerResponse,
			{ id: string; data: UpdateCustomerRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/customers/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Customers"],
		}),

		/**
		 * Delete Customer Mutation
		 *
		 * Deletes a customer from the system.
		 * Only allowed if customer has no associated sales.
		 *
		 * Requirements:
		 * - 5.6: Create mutations for customer management
		 * - 6.5: Invalidate customers cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Customers']
		 * - Invalidates 'Customers' tag to trigger refetch of customers lists
		 */
		deleteCustomer: builder.mutation<DeleteCustomerResponse, string>({
			query: (id) => ({
				url: `/api/customers/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Customers"],
		}),

		/**
		 * Get Categories Query
		 *
		 * Fetches all categories with item counts.
		 * Returns categories with count of inventory items in each category.
		 *
		 * Requirements:
		 * - 5.7: Create queries for fetching categories
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Categories']
		 * - Tagged with 'Categories' so it can be invalidated on mutations
		 */
		getCategories: builder.query<GetCategoriesResponse, void>({
			query: () => "/api/categories",
			providesTags: ["Categories"],
		}),

		/**
		 * Get Category Query
		 *
		 * Fetches a single category by ID with all inventory items.
		 * Returns category with detailed inventory item list.
		 *
		 * Requirements:
		 * - 5.7: Create queries for fetching categories
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Categories']
		 * - Tagged with 'Categories' so it can be invalidated on mutations
		 */
		getCategory: builder.query<GetCategoryResponse, string>({
			query: (id) => `/api/categories/${id}`,
			providesTags: ["Categories"],
		}),

		/**
		 * Create Category Mutation
		 *
		 * Creates a new category with the provided data.
		 * Requires MANAGER+ role for access.
		 * Validates category name uniqueness.
		 *
		 * Requirements:
		 * - 5.7: Create mutations for category management
		 * - 6.4: Invalidate categories cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Categories']
		 * - Invalidates 'Categories' tag to trigger refetch of categories lists
		 */
		createCategory: builder.mutation<
			CreateCategoryResponse,
			CreateCategoryRequest
		>({
			query: (data) => ({
				url: "/api/categories",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Categories"],
		}),

		/**
		 * Update Category Mutation
		 *
		 * Updates an existing category with the provided data.
		 * Requires MANAGER+ role for access.
		 * Validates category name uniqueness if being changed.
		 *
		 * Requirements:
		 * - 5.7: Create mutations for category management
		 * - 6.4: Invalidate categories cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Categories']
		 * - Invalidates 'Categories' tag to trigger refetch of categories data
		 */
		updateCategory: builder.mutation<
			UpdateCategoryResponse,
			{ id: string; data: UpdateCategoryRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/categories/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Categories"],
		}),

		/**
		 * Delete Category Mutation
		 *
		 * Deletes a category from the system.
		 * Requires MANAGER+ role for access.
		 * Only allowed if category has no associated inventory items.
		 *
		 * Requirements:
		 * - 5.7: Create mutations for category management
		 * - 6.4: Invalidate categories cache on mutation
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Invalidation: ['Categories']
		 * - Invalidates 'Categories' tag to trigger refetch of categories lists
		 */
		deleteCategory: builder.mutation<DeleteCategoryResponse, string>({
			query: (id) => ({
				url: `/api/categories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Categories"],
		}),

		/**
		 * Get Dashboard Stats Query
		 *
		 * Fetches comprehensive dashboard statistics including sales, revenue, and inventory metrics.
		 * Requires MANAGER+ role for access.
		 * Applies role-based filtering (CASHIER sees only their data).
		 *
		 * Requirements:
		 * - 5.5: Create queries for analytics endpoints
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Analytics']
		 * - Tagged with 'Analytics' so it can be invalidated when data changes
		 */
		getDashboardStats: builder.query<DashboardStats, void>({
			query: () => "/api/analytics/dashboard",
			providesTags: ["Analytics"],
		}),

		/**
		 * Get Sales By Date Query
		 *
		 * Fetches sales data grouped by date within a specified date range.
		 * Requires MANAGER+ role for access.
		 * Applies role-based filtering (CASHIER sees only their data).
		 *
		 * Requirements:
		 * - 5.5: Create queries for analytics endpoints
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Analytics']
		 * - Tagged with 'Analytics' so it can be invalidated when data changes
		 */
		getSalesByDate: builder.query<DailySales[], GetSalesByDateParams | void>({
			query: (params) => {
				const searchParams = new URLSearchParams();
				if (params && "startDate" in params && params.startDate) {
					searchParams.append("startDate", params.startDate);
				}
				if (params && "endDate" in params && params.endDate) {
					searchParams.append("endDate", params.endDate);
				}
				const queryString = searchParams.toString();
				return `/api/analytics/sales-by-date${
					queryString ? `?${queryString}` : ""
				}`;
			},
			providesTags: ["Analytics"],
		}),

		/**
		 * Get Top Products Query
		 *
		 * Fetches top selling products ordered by quantity sold.
		 * Requires MANAGER+ role for access.
		 * Applies role-based filtering (CASHIER sees only their data).
		 *
		 * Requirements:
		 * - 5.5: Create queries for analytics endpoints
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Analytics']
		 * - Tagged with 'Analytics' so it can be invalidated when data changes
		 */
		getTopProducts: builder.query<TopProduct[], GetTopProductsParams | void>({
			query: (params) => {
				const searchParams = new URLSearchParams();
				if (params && "limit" in params && params.limit) {
					searchParams.append("limit", params.limit.toString());
				}
				const queryString = searchParams.toString();
				return `/api/analytics/top-products${
					queryString ? `?${queryString}` : ""
				}`;
			},
			providesTags: ["Analytics"],
		}),

		/**
		 * Get Payment Methods Query
		 *
		 * Fetches aggregated sales data by payment method.
		 * Requires MANAGER+ role for access.
		 * Applies role-based filtering (CASHIER sees only their data).
		 *
		 * Requirements:
		 * - 5.5: Create queries for analytics endpoints
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Analytics']
		 * - Tagged with 'Analytics' so it can be invalidated when data changes
		 */
		getPaymentMethods: builder.query<PaymentMethodStats[], void>({
			query: () => "/api/analytics/payment-methods",
			providesTags: ["Analytics"],
		}),

		/**
		 * Get Inventory Analytics Query
		 *
		 * Fetches inventory analytics including total value, low stock items, and category distribution.
		 * Requires MANAGER+ role for access.
		 *
		 * Requirements:
		 * - 5.5: Create queries for analytics endpoints
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['Analytics']
		 * - Tagged with 'Analytics' so it can be invalidated when data changes
		 */
		getInventoryAnalytics: builder.query<InventoryAnalytics, void>({
			query: () => "/api/analytics/inventory",
			providesTags: ["Analytics"],
		}),

		/**
		 * Get Activity Logs Query
		 *
		 * Fetches activity logs with pagination support.
		 * Requires MANAGER+ role for access.
		 * Applies role-based filtering (CASHIER sees only their logs).
		 *
		 * Requirements:
		 * - 5.8: Create queries for activity log endpoints with pagination
		 * - 10.2: Specify TypeScript types for request/response
		 *
		 * Cache Tags: ['ActivityLogs']
		 * - Tagged with 'ActivityLogs' so it can be invalidated when new logs are created
		 */
		getActivityLogs: builder.query<
			ActivityLogWithUser[],
			GetActivityLogsParams | void
		>({
			query: (params) => {
				const searchParams = new URLSearchParams();
				if (params && "limit" in params && params.limit) {
					searchParams.append("limit", params.limit.toString());
				}
				const queryString = searchParams.toString();
				return `/api/activity-logs${queryString ? `?${queryString}` : ""}`;
			},
			providesTags: ["ActivityLogs"],
		}),
	}),
});

/**
 * RTK Query Hooks Export
 *
 * These hooks are auto-generated by RTK Query based on endpoint definitions.
 * All hooks are fully typed with TypeScript for type-safe API calls.
 *
 * Query Hooks (useXxxQuery):
 * - Automatically fetch data when component mounts
 * - Return { data, error, isLoading, isSuccess, isError, refetch }
 * - Automatically cache and deduplicate requests
 * - Automatically refetch when cache is invalidated
 *
 * Mutation Hooks (useXxxMutation):
 * - Return [trigger, { data, error, isLoading, isSuccess, isError, reset }]
 * - Call trigger(args) to execute the mutation
 * - Automatically invalidate cache tags on success
 *
 * Requirements:
 * - 10.2: All endpoints have proper TypeScript types
 * - 10.3: Typed hooks provide automatic type inference
 * - 10.5: Enforce correct argument types based on endpoint definitions
 * - 10.6: Provide typed error objects from RTK Query
 */
export const {
	useValidateSessionQuery,
	useLoginMutation,
	useLogoutMutation,
	useGetInventoryQuery,
	useGetInventoryItemQuery,
	useCreateInventoryItemMutation,
	useUpdateInventoryItemMutation,
	useDeleteInventoryItemMutation,
	useAdjustStockMutation,
	useGetSalesQuery,
	useGetSaleQuery,
	useCreateSaleMutation,
	useCompleteSaleMutation,
	useCancelSaleMutation,
	useGetUsersQuery,
	useGetUserQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useGetCustomersQuery,
	useGetCustomerQuery,
	useCreateCustomerMutation,
	useUpdateCustomerMutation,
	useDeleteCustomerMutation,
	useGetCategoriesQuery,
	useGetCategoryQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,
	useGetDashboardStatsQuery,
	useGetSalesByDateQuery,
	useGetTopProductsQuery,
	useGetPaymentMethodsQuery,
	useGetInventoryAnalyticsQuery,
	useGetActivityLogsQuery,
} = api;
