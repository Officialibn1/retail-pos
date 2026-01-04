import { PaymentMethod, SaleStatus } from "@/generated/prisma";
import { CategoryWithCount } from "@/lib/services/category.service";
import { SaleWithDetails } from "@/lib/services/sale.service";
import { CompleteSaleInput, CreateSaleInput } from "@/lib/validations";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

// Get sales query parameters
export interface GetSalesParams {
	status?: SaleStatus;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

export interface SearchParams {
	searchTerm?: string;
	category?: string;
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

// Cancel sale request (no body required, but keeping for consistency)
export interface CancelSaleRequest {
	reason?: string;
}

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

// Category data
export interface CategoryData {
	id: string;
	name: string;
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

export interface GetActivityLogsParams {
	limit?: number;
}

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
	endpoints: (builder) => ({
		validateSession: builder.query<UserData, void>({
			query: () => "/api/auth/me",
			providesTags: ["Auth"],
		}),

		login: builder.mutation<LoginResponse, LoginRequest>({
			query: (credentials) => ({
				url: "/api/auth/login",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["Auth"],
		}),

		logout: builder.mutation<LogoutResponse, void>({
			query: () => ({
				url: "/api/auth/logout",
				method: "POST",
			}),
			invalidatesTags: ["Auth"],
		}),

		getInventory: builder.query<
			InventoryItemWithCategory[],
			SearchParams | void
		>({
			query: (searchTerm) => ({
				url: "/api/inventory",
				params: {
					searchTerm: searchTerm ? searchTerm.searchTerm : "",
					category: searchTerm ? searchTerm.category : "",
				},
			}),
			providesTags: ["Inventory"],
		}),

		getInventoryItem: builder.query<GetInventoryItemResponse, string>({
			query: (id) => `/api/inventory/${id}`,
			providesTags: ["Inventory"],
		}),

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

		deleteInventoryItem: builder.mutation<DeleteInventoryItemResponse, string>({
			query: (id) => ({
				url: `/api/inventory/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Inventory"],
		}),

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

		getSales: builder.query<SaleWithDetails[], GetSalesParams | void>({
			query: (params) => ({
				url: "/api/sales",
				method: "GET",
				params: params || undefined,
			}),
			providesTags: ["Sales"],
		}),

		getSale: builder.query<SaleWithDetails, string>({
			query: (id) => `/api/sales/${id}`,
			providesTags: ["Sales"],
		}),

		createSale: builder.mutation<SaleData, CreateSaleInput>({
			query: (data) => ({
				url: "/api/sales",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales"],
		}),

		completeSale: builder.mutation<
			SaleData,
			{ id: string; data: CompleteSaleInput }
		>({
			query: ({ id, data }) => ({
				url: `/api/sales/${id}/complete`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales", "Inventory"],
		}),

		cancelSale: builder.mutation<SaleData, string>({
			query: (id) => ({
				url: `/api/sales/${id}/cancel`,
				method: "POST",
			}),
			invalidatesTags: ["Sales", "Inventory"],
		}),

		getUsers: builder.query<GetUsersResponse, void>({
			query: () => "/api/users",
			providesTags: ["Users"],
		}),

		getUser: builder.query<GetUserResponse, string>({
			query: (id) => `/api/users/${id}`,
			providesTags: ["Users"],
		}),

		createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
			query: (data) => ({
				url: "/api/users",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Users"],
		}),

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

		deleteUser: builder.mutation<DeleteUserResponse, string>({
			query: (id) => ({
				url: `/api/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Users"],
		}),

		getCustomers: builder.query<GetCustomersResponse, void>({
			query: () => "/api/customers",
			providesTags: ["Customers"],
		}),

		getCustomer: builder.query<GetCustomerResponse, string>({
			query: (id) => `/api/customers/${id}`,
			providesTags: ["Customers"],
		}),

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

		deleteCustomer: builder.mutation<DeleteCustomerResponse, string>({
			query: (id) => ({
				url: `/api/customers/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Customers"],
		}),

		getCategories: builder.query<GetCategoriesResponse, void>({
			query: () => "/api/categories",
			providesTags: ["Categories"],
		}),

		getCategory: builder.query<GetCategoryResponse, string>({
			query: (id) => `/api/categories/${id}`,
			providesTags: ["Categories"],
		}),

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

		deleteCategory: builder.mutation<DeleteCategoryResponse, string>({
			query: (id) => ({
				url: `/api/categories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Categories"],
		}),

		getDashboardStats: builder.query<DashboardStats, void>({
			query: () => "/api/analytics/dashboard",
			providesTags: ["Analytics"],
		}),

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

		getPaymentMethods: builder.query<PaymentMethodStats[], void>({
			query: () => "/api/analytics/payment-methods",
			providesTags: ["Analytics"],
		}),

		getInventoryAnalytics: builder.query<InventoryAnalytics, void>({
			query: () => "/api/analytics/inventory",
			providesTags: ["Analytics"],
		}),

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
