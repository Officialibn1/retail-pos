// Import Prisma namespace and enums
import {
	Prisma,
	UserRole,
	UserStatus,
	SaleStatus,
	Shift,
	PaymentMethod,
	User,
} from "@/generated/prisma/client";

// Re-export Prisma enums for convenience
export { UserRole, UserStatus, SaleStatus, Shift, PaymentMethod };
export type DateStyle = Intl.DateTimeFormatOptions["dateStyle"];
export type TimeStyle = Intl.DateTimeFormatOptions["timeStyle"];

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

export interface LoginResponse {
	user: User;
	message: string;
}

export interface LogoutResponse {
	message: string;
}

export interface ApiError {
	error: {
		message: string;
		code: string;
		details?: any;
	};
}

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
	dailySales: Array<{
		date: string;
		sales: number;
		revenue: number;
	}>;
}

// ============================================================================
// Advanced Analytics Types
// ============================================================================

// Common Parameters
export interface DateRangeParams {
	startDate: string; // ISO 8601
	endDate: string; // ISO 8601
}

export interface PaginationParams {
	limit?: number;
	offset?: number;
}

// Top Products Analytics
export interface TopProductsParams extends DateRangeParams {
	categoryId?: string;
	groupBy?: "day" | "week" | "month" | "year";
	sortBy: "revenue" | "quantity";
	limit?: number;
}

export interface TopProductsResult {
	products: Array<{
		productId: string;
		productName: string;
		sku: string;
		categoryName: string;
		unitsSold: number;
		totalRevenue: number;
		averageSellingPrice: number;
	}>;
	trendData?: Array<{
		date: string;
		revenue: number;
		quantity: number;
	}>;
}

// Category Revenue Analytics
export interface CategoryRevenueParams extends DateRangeParams {}

export interface CategoryRevenueResult {
	categories: Array<{
		categoryId: string;
		categoryName: string;
		totalSalesCount: number;
		totalRevenue: number;
		percentageOfTotal: number;
	}>;
	totalRevenue: number;
}

// Sales Trends Analytics
export interface SalesTrendParams extends DateRangeParams {
	interval?: "hourly" | "daily" | "weekly";
}

export interface SalesTrendResult {
	trends: Array<{
		date: string;
		totalRevenue: number;
		transactionCount: number;
		averageTransactionValue: number;
		totalDiscounts: number;
		totalTax: number;
	}>;
	kpis: {
		totalGrossRevenue: number;
		totalDiscounts: number;
		totalTax: number;
		averageOrderValue: number;
	};
}

// Payment Method Analytics
export interface PaymentBreakdownParams extends DateRangeParams {}

export interface PaymentBreakdownResult {
	paymentMethods: Array<{
		method: PaymentMethod;
		transactionCount: number;
		totalAmount: number;
		percentageOfTotal: number;
	}>;
	totalAmount: number;
}

// Cashier Performance Analytics
export interface CashierPerformanceParams extends DateRangeParams {
	userId?: string;
}

export interface CashierPerformanceResult {
	cashiers: Array<{
		userId: string;
		userName: string;
		roles: UserRole[];
		totalRevenue: number;
		transactionCount: number;
		averageTransactionValue: number;
		shiftInfo?: {
			totalHours: number;
			revenuePerHour: number;
		};
	}>;
}

// Inventory Value Analytics
export interface InventoryValueResult {
	totalValue: number;
	totalProducts: number;
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
		total_value: number;
	}>;
}

// Top Customers Analytics
export interface TopCustomersParams extends DateRangeParams {
	sortBy: "revenue" | "frequency";
	limit?: number;
}

export interface TopCustomersResult {
	customers: Array<{
		customerId: string;
		customerName: string | undefined | null;
		customerPhone: string;
		customerEmail: string | undefined | null;
		totalSpent: number;
		totalVisits: number;
		averageTransactionValue: number;
		lastVisit: string;
	}>;
}

// Customer Trends Analytics
export interface CustomerTrendsParams extends DateRangeParams {
	interval: "week" | "month";
	customerIds?: string[];
}

export interface CustomerTrendsResult {
	customers: Array<{
		customerId: string;
		customerName: string;
		trends: Array<{
			period: string;
			revenue: number;
			growthPercentage: number;
		}>;
		status: "Trending Up" | "Slipping" | "At Risk";
		lastVisit: string;
	}>;
}

// ============================================================================
// Expense Types
// ============================================================================

export interface ExpenseRecordedBy {
	id: string;
	name: string;
	email: string;
}

export interface ExpenseRecord {
	id: string;
	title: string;
	amount: number;
	category: string;
	description: string | null;
	date: string;
	recordedById: string;
	createdAt: string;
	updatedAt: string;
	recordedBy: ExpenseRecordedBy;
}

export interface GetExpensesResponse {
	expenses: ExpenseRecord[];
	count: number;
}

export interface GetExpenseResponse {
	expense: ExpenseRecord;
}

export interface CreateExpenseResponse {
	message: string;
	expense: ExpenseRecord;
}

export interface UpdateExpenseResponse {
	message: string;
	expense: ExpenseRecord;
}

export interface DeleteExpenseResponse {
	message: string;
}

export interface ExpenseSearchParams {
	searchTerm?: string;
	category?: string;
	startDate?: string;
	endDate?: string;
}
