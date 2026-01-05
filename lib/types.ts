// Import Prisma namespace and enums
import {
	Prisma,
	UserRole,
	SaleStatus,
	Shift,
	PaymentMethod,
	User,
} from "@/generated/prisma/client";

// Re-export Prisma enums for convenience
export { UserRole, SaleStatus, Shift, PaymentMethod };
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
