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
	DashboardStats,
	GetSalesParams,
	InventoryAnalytics,
	LoginResponse,
	LogoutResponse,
	SearchParams,
} from "@/lib/types";
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
			invalidatesTags: ["Inventory"],
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
			InventoryItemResponse,
			{ id: string; data: AdjustStockInput }
		>({
			query: ({ id, data }) => ({
				url: `/api/inventory/${id}/adjust-stock`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Inventory"],
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
			invalidatesTags: ["Sales", "Inventory"],
		}),

		cancelSale: builder.mutation<Sale, string>({
			query: (id) => ({
				url: `/api/sales/${id}/cancel`,
				method: "POST",
			}),
			invalidatesTags: ["Sales", "Inventory"],
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
			ActivityLogSearchParams | void
		>({
			query: (params) => ({
				url: "/api/activity-logs",
				params: params || undefined,
			}),
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
