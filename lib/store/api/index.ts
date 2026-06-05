import { Customer, InventoryItem, Sale, User } from "@/generated/prisma";
import {
	ActivityLogWithUser,
	CategoryWithCount,
	CategoryWithItems,
	InventoryItemWithCategory,
	UserWithoutPassword,
} from "@/lib/prisma-extended-types";
import { CustomerWithSales } from "@/lib/services/customer.service";
import { SaleWithDetails } from "@/lib/services/sale.service";

import {
	AdjustStockInput,
	CompleteSaleInput,
	CreateCustomerInput,
	CreateInventoryItemInput,
	CreateSaleInput,
	CreateUserInput,
	LoginInput,
	UpdateCustomerInput,
	UpdateInventoryItemInput,
	UpdateUserInput,
} from "@/lib/validations";
import {
	DashboardStats,
	LoginResponse,
	LogoutResponse,
	SearchParams,
	TopProductsParams,
	TopProductsResult,
	CategoryRevenueParams,
	CategoryRevenueResult,
	SalesTrendParams,
	SalesTrendResult,
	PaymentBreakdownParams,
	PaymentBreakdownResult,
	CashierPerformanceParams,
	CashierPerformanceResult,
	InventoryValueResult,
	TopCustomersParams,
	TopCustomersResult,
	CustomerTrendsParams,
	CustomerTrendsResult,
} from "@/lib/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const TAG_TYPES = [
	"Auth",
	"Inventory",
	"Sales",
	"Returns",
	"Users",
	"Customers",
	"Categories",
	"ActivityLogs",
	"Analytics",
	"StoreSettings",
	"CashDrawer",
	"Notifications",
] as const;

export interface StoreSettings {
	name: string;
	address: string;
	phone: string;
	email: string;
	taxRate: number;
	primaryColor: string;
	secondaryColor: string;
	logoUrl: string;
}

export interface GetStoreSettingsResponse {
	settings: StoreSettings;
}

export interface UpdateStoreSettingsRequest {
	name?: string;
	address?: string;
	phone?: string;
	email?: string;
	taxRate?: number;
	primaryColor?: string;
	secondaryColor?: string;
	logoUrl?: string;
}

export type TagType = (typeof TAG_TYPES)[number];

export interface InventoryItemResponse {
	message: string;
	item: InventoryItem;
}

// Get inventory item response
export interface GetInventoryItemResponse {
	item: InventoryItemWithCategory;
}

// Delete inventory item response
export interface DeleteInventoryItemResponse {
	message: string;
}

// Get users response
export interface GetUsersResponse {
	users: UserWithoutPassword[];
	count: number;
}

// Get user response
export interface GetUserResponse {
	user: UserWithoutPassword;
}

// Create user response
export interface CreateUserResponse {
	message: string;
	user: UserWithoutPassword;
}

// Update user response
export interface UpdateUserResponse {
	message: string;
	user: UserWithoutPassword;
}

// Delete user response
export interface DeleteUserResponse {
	message: string;
}

// Customer data in a sale
export interface SaleCustomerData {
	id: string;
	name: string | null;
	phone: string | null;
}

// User data in a sale
export interface SaleUser {
	id: string;
	name: string;
	email: string;
}

// Cancel sale request (no body required, but keeping for consistency)
export interface CancelSaleRequest {
	reason?: string;
}

// Return item
export interface ReturnItemRequest {
	inventoryItemId: string;
	quantity: number;
}

// Create return request
export interface CreateReturnRequest {
	items: ReturnItemRequest[];
	reason: string;
	refundMethod: string;
}

// Sale return item in response
export interface SaleReturnItemResponse {
	id: string;
	quantity: number;
	price: number;
	inventoryItem: {
		id: string;
		name: string;
		sku: string;
	};
}

// Sale return response
export interface CreateReturnResponse {
	id: string;
	saleId: string;
	reason: string;
	refundAmount: number;
	refundMethod: string;
	createdAt: string;
	processedById: string;
	items: SaleReturnItemResponse[];
	processedBy: {
		id: string;
		name: string;
		email: string;
	};
}

// Customer search parameters
export interface CustomerSearchParams {
	searchTerm?: string;
}

// Category search parameters
export interface CategorySearchParams {
	searchTerm?: string;
}

// User search parameters
export interface UserSearchParams {
	searchTerm?: string;
	role?: string;
}

// Sale search parameters
export interface SaleSearchParams {
	searchTerm?: string;
	status?: string;
	paymentMethod?: string;
	startDate?: string;
	endDate?: string;
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
	customer: Customer;
}

// Update customer response
export interface UpdateCustomerResponse {
	message: string;
	customer: Customer;
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

// Activity log search parameters
export interface ActivityLogSearchParams {
	searchTerm?: string;
	action?: string;
	limit?: number;
}

// Returns list search parameters
export interface ReturnSearchParams {
	searchTerm?: string;
	refundMethod?: string;
	startDate?: string;
	endDate?: string;
}

// Return list item (matches ReturnWithDetails from return.service)
export interface ReturnWithDetails {
	id: string;
	saleId: string;
	reason: string;
	refundAmount: number;
	refundMethod: string;
	createdAt: string;
	processedBy: {
		id: string;
		name: string;
		email: string;
	};
	sale: {
		id: string;
		customer: {
			id: string;
			name: string | null;
			phone: string;
		} | null;
	};
	items: SaleReturnItemResponse[];
}

// Low-stock notification types
export interface LowStockItem {
	id: string;
	name: string;
	sku: string;
	stock: number;
	reorderLevel: number;
	category: string;
}

export interface LowStockNotificationsResponse {
	items: LowStockItem[];
	count: number;
}

// Cash Drawer / Shift Session types
export interface CashDrawerSessionUser {
	id: string;
	name: string;
	email: string;
}

export interface CashDrawerSession {
	id: string;
	userId: string;
	openingFloat: number;
	declaredClose: number | null;
	expectedClose: number | null;
	variance: number | null;
	openedAt: string;
	closedAt: string | null;
	notes: string | null;
	user: CashDrawerSessionUser;
}

export interface OpenShiftRequest {
	openingFloat: number;
	notes?: string;
}

export interface CloseShiftRequest {
	declaredClose: number;
	notes?: string;
}

export interface OpenShiftResponse {
	message: string;
	session: CashDrawerSession;
}

export interface CloseShiftResponse {
	message: string;
	session: CashDrawerSession;
}

export interface GetActiveSessionResponse {
	session: CashDrawerSession | null;
}

export interface GetSessionsResponse {
	sessions: CashDrawerSession[];
}export const api = createApi({
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
		validateSession: builder.query<User, void>({
			query: () => "/api/auth/me",
			providesTags: ["Auth"],
		}),

		login: builder.mutation<LoginResponse, LoginInput>({
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
			InventoryItemResponse,
			CreateInventoryItemInput
		>({
			query: (data) => ({
				url: "/api/inventory",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Inventory", "Notifications"],
		}),

		updateInventoryItem: builder.mutation<
			InventoryItemResponse,
			{ id: string; data: UpdateInventoryItemInput }
		>({
			query: ({ id, data }) => ({
				url: `/api/inventory/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Inventory", "Notifications"],
		}),

		deleteInventoryItem: builder.mutation<DeleteInventoryItemResponse, string>({
			query: (id) => ({
				url: `/api/inventory/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Inventory", "Notifications"],
		}),

		adjustStock: builder.mutation<
			InventoryItemResponse,
			{ id: string; data: AdjustStockInput }
		>({
			query: ({ id, data }) => ({
				url: `/api/inventory/${id}/adjust-stock`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Inventory", "Notifications"],
		}),

		getSales: builder.query<SaleWithDetails[], SaleSearchParams | void>({
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

		createSale: builder.mutation<Sale, CreateSaleInput>({
			query: (data) => ({
				url: "/api/sales",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales", "Inventory"],
		}),

		completeSale: builder.mutation<
			Sale,
			{ id: string; data: CompleteSaleInput }
		>({
			query: ({ id, data }) => ({
				url: `/api/sales/${id}/complete`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales", "Inventory", "Notifications"],
		}),

		cancelSale: builder.mutation<Sale, string>({
			query: (id) => ({
				url: `/api/sales/${id}/cancel`,
				method: "POST",
			}),
			invalidatesTags: ["Sales", "Inventory"],
		}),

		createReturn: builder.mutation<
			CreateReturnResponse,
			{ id: string; data: CreateReturnRequest }
		>({
			query: ({ id, data }) => ({
				url: `/api/sales/${id}/return`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Sales", "Inventory", "Returns"],
		}),

		getReturns: builder.query<ReturnWithDetails[], ReturnSearchParams | void>({
			query: (params) => ({
				url: "/api/returns",
				method: "GET",
				params: params || undefined,
			}),
			providesTags: ["Returns"],
		}),

		getUsers: builder.query<GetUsersResponse, UserSearchParams | void>({
			query: (params) => ({
				url: "/api/users",
				params: params || undefined,
			}),
			providesTags: ["Users"],
		}),

		getUser: builder.query<GetUserResponse, string>({
			query: (id) => `/api/users/${id}`,
			providesTags: ["Users"],
		}),

		createUser: builder.mutation<CreateUserResponse, CreateUserInput>({
			query: (data) => ({
				url: "/api/users",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Users"],
		}),

		updateUser: builder.mutation<
			UpdateUserResponse,
			{ id: string; data: UpdateUserInput }
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

		updateUserStatus: builder.mutation<
			{ message: string; userId: string; status: string },
			{ userId: string; status: string }
		>({
			query: ({ userId, status }) => ({
				url: `/api/users/${userId}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: ["Users"],
		}),

		getCustomers: builder.query<
			GetCustomersResponse,
			CustomerSearchParams | void
		>({
			query: (params) => ({
				url: "/api/customers",
				params: params || undefined,
			}),
			providesTags: ["Customers"],
		}),

		getCustomer: builder.query<GetCustomerResponse, string>({
			query: (id) => `/api/customers/${id}`,
			providesTags: ["Customers"],
		}),

		createCustomer: builder.mutation<
			CreateCustomerResponse,
			CreateCustomerInput
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
			{ id: string; data: UpdateCustomerInput }
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

		getCategories: builder.query<
			GetCategoriesResponse,
			CategorySearchParams | void
		>({
			query: (params) => ({
				url: "/api/categories",
				params: params || undefined,
			}),
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
			providesTags: [{ type: "Analytics", id: "dashboard-stats" }],
		}),

		getSalesByDate: builder.query<DailySales[], GetSalesByDateParams | void>({
			query: (params) => ({
				url: "/api/analytics/sales-by-date",
				params: params || undefined,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `sales-by-date-${JSON.stringify(arg || {})}` },
			],
		}),

		getTopProducts: builder.query<TopProduct[], GetTopProductsParams | void>({
			query: (params) => ({
				url: "/api/analytics/top-products",
				params: params || undefined,
			}),
			providesTags: (result, error, arg) => [
				{
					type: "Analytics",
					id: `top-products-legacy-${JSON.stringify(arg || {})}`,
				},
			],
		}),

		getPaymentMethods: builder.query<PaymentMethodStats[], void>({
			query: () => "/api/analytics/payment-methods",
			providesTags: [{ type: "Analytics", id: "payment-methods" }],
		}),

		getInventoryAnalytics: builder.query<InventoryValueResult, void>({
			query: () => "/api/analytics/inventory",
			providesTags: [{ type: "Analytics", id: "inventory-analytics" }],
		}),

		getActivityLogs: builder.query<
			ActivityLogWithUser[],
			ActivityLogSearchParams | void
		>({
			query: (params) => ({
				url: "/api/activity-logs",
				params: params || undefined,
			}),
			providesTags: ["ActivityLogs"],
		}),

		// Enhanced Analytics Endpoints
		getTopPerformingProducts: builder.query<
			TopProductsResult,
			TopProductsParams
		>({
			query: (params) => ({
				url: "/api/analytics/products/top-performing",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `top-products-${JSON.stringify(arg)}` },
			],
		}),

		getCategoryRevenue: builder.query<
			CategoryRevenueResult,
			CategoryRevenueParams
		>({
			query: (params) => ({
				url: "/api/analytics/revenue/by-category",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `category-revenue-${JSON.stringify(arg)}` },
			],
		}),

		getSalesTrends: builder.query<SalesTrendResult, SalesTrendParams>({
			query: (params) => ({
				url: "/api/analytics/sales/trends",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `sales-trends-${JSON.stringify(arg)}` },
			],
		}),

		getPaymentBreakdown: builder.query<
			PaymentBreakdownResult,
			PaymentBreakdownParams
		>({
			query: (params) => ({
				url: "/api/analytics/payments/breakdown",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `payment-breakdown-${JSON.stringify(arg)}` },
			],
		}),

		getCashierPerformance: builder.query<
			CashierPerformanceResult,
			CashierPerformanceParams
		>({
			query: (params) => ({
				url: "/api/analytics/cashiers/performance",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `cashier-performance-${JSON.stringify(arg)}` },
			],
		}),

		getInventoryValue: builder.query<InventoryValueResult, void>({
			query: () => "/api/analytics/inventory/value",
			providesTags: [{ type: "Analytics", id: "inventory-value" }],
		}),

		getTopCustomers: builder.query<TopCustomersResult, TopCustomersParams>({
			query: (params) => ({
				url: "/api/analytics/customers/top",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `top-customers-${JSON.stringify(arg)}` },
			],
		}),

		getCustomerTrends: builder.query<
			CustomerTrendsResult,
			CustomerTrendsParams
		>({
			query: (params) => ({
				url: "/api/analytics/customers/trends",
				params: params,
			}),
			providesTags: (result, error, arg) => [
				{ type: "Analytics", id: `customer-trends-${JSON.stringify(arg)}` },
			],
		}),

		// Low-stock notifications
		getLowStockNotifications: builder.query<LowStockNotificationsResponse, void>({
			query: () => "/api/notifications/low-stock",
			providesTags: ["Notifications"],
		}),

		// Cash Drawer / Shift endpoints
		getActiveSession: builder.query<GetActiveSessionResponse, void>({
			query: () => "/api/cash-drawer/active",
			providesTags: ["CashDrawer"],
		}),

		getCashDrawerSessions: builder.query<GetSessionsResponse, { userId?: string; limit?: number } | void>({
			query: (params) => ({
				url: "/api/cash-drawer",
				params: params || undefined,
			}),
			providesTags: ["CashDrawer"],
		}),

		openShift: builder.mutation<OpenShiftResponse, OpenShiftRequest>({
			query: (data) => ({
				url: "/api/cash-drawer",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["CashDrawer"],
		}),

		closeShift: builder.mutation<CloseShiftResponse, { id: string; data: CloseShiftRequest }>({
			query: ({ id, data }) => ({
				url: `/api/cash-drawer/${id}/close`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["CashDrawer"],
		}),

		// Database backup mutation - returns a file blob
		createBackup: builder.mutation<Blob, void>({
			queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBQ) => {
				const result = await fetchWithBQ({
					url: "/api/backup",
					method: "POST",
					responseHandler: (response) => response.blob(),
				});

				if (result.error) {
					return { error: result.error };
				}

				return { data: result.data as Blob };
			},
		}),

		getStoreSettings: builder.query<GetStoreSettingsResponse, void>({
			query: () => "/api/settings/store",
			providesTags: ["StoreSettings"],
		}),

		updateStoreSettings: builder.mutation<
			GetStoreSettingsResponse,
			UpdateStoreSettingsRequest
		>({
			query: (data) => ({
				url: "/api/settings/store",
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["StoreSettings"],
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
	useCreateReturnMutation,
	useGetReturnsQuery,
	useGetUsersQuery,
	useGetUserQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useUpdateUserStatusMutation,
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
	// Enhanced Analytics Hooks
	useGetTopPerformingProductsQuery,
	useGetCategoryRevenueQuery,
	useGetSalesTrendsQuery,
	useGetPaymentBreakdownQuery,
	useGetCashierPerformanceQuery,
	useGetInventoryValueQuery,
	useGetTopCustomersQuery,
	useGetCustomerTrendsQuery,
	// Backup
	useCreateBackupMutation,
	// Store Settings
	useGetStoreSettingsQuery,
	useUpdateStoreSettingsMutation,
	// Cash Drawer
	useGetActiveSessionQuery,
	useGetCashDrawerSessionsQuery,
	useOpenShiftMutation,
	useCloseShiftMutation,
	// Notifications
	useGetLowStockNotificationsQuery,
} = api;
