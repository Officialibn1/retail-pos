import { prisma } from "@/lib/prisma";
import { PaymentMethod, UserRole } from "@/generated/prisma/client";
import {
	DashboardStats,
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
} from "../types";
import { canViewAllData } from "../auth";

/**
 * Sales analytics data
 */
export interface SalesAnalytics {
	totalSales: number;
	totalRevenue: number;
	averageOrderValue: number;
}

/**
 * Top selling product data
 */
export interface TopProduct {
	productId: string;
	productName: string;
	quantitySold: number;
	revenue: number;
}

/**
 * Daily sales data
 */
export interface DailySales {
	date: string;
	sales: number;
	revenue: number;
}

/**
 * Payment method statistics
 */
export interface PaymentMethodStats {
	method: string;
	count: number;
	revenue: number;
}

/**
 * Get sales analytics using raw SQL
 * @param userId - Optional user ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @returns Sales analytics data
 */
export async function getSalesAnalytics(
	userId?: string,
	userRoles?: UserRole[],
): Promise<SalesAnalytics> {
	// Determine if user can see all data
	const canSeeAll =
		!userId ||
		!userRoles ||
		userRoles.includes(UserRole.MANAGER) ||
		userRoles.includes(UserRole.ADMIN) ||
		userRoles.includes(UserRole.SUPERADMIN);

	// Build WHERE clause for role-based filtering
	const whereClause = canSeeAll ? "" : `WHERE s."userId" = '${userId}'`;

	const query = `
		SELECT 
			COUNT(*)::int as total_sales,
			COALESCE(SUM(s.total), 0)::numeric as total_revenue,
			COALESCE(AVG(s.total), 0)::numeric as average_order_value
		FROM sales s
		WHERE s.status = 'COMPLETED'
		${whereClause ? "AND " + whereClause.replace("WHERE ", "") : ""}
	`;

	const result = await prisma.$queryRawUnsafe<
		Array<{
			total_sales: number;
			total_revenue: number;
			average_order_value: number;
		}>
	>(query);

	const data = result[0] || {
		total_sales: 0,
		total_revenue: 0,
		average_order_value: 0,
	};

	return {
		totalSales: data.total_sales,
		totalRevenue: Number(data.total_revenue),
		averageOrderValue: Number(data.average_order_value),
	};
}

/**
 * Get top selling products using raw SQL
 * @param limit - Number of top products to return (default: 5)
 * @param userId - Optional user ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @returns Array of top selling products
 */
export async function getTopSellingProducts(
	limit: number = 5,
	userId?: string,
	userRoles?: UserRole[],
): Promise<TopProduct[]> {
	// Determine if user can see all data
	const canSeeAll =
		!userId ||
		!userRoles ||
		userRoles.includes(UserRole.MANAGER) ||
		userRoles.includes(UserRole.ADMIN) ||
		userRoles.includes(UserRole.SUPERADMIN);

	// Build WHERE clause for role-based filtering
	const whereClause = canSeeAll ? "" : `AND s."userId" = '${userId}'`;

	const query = `
		SELECT 
			ii.id as product_id,
			ii.name as product_name,
			SUM(si.quantity)::int as quantity_sold,
			SUM(si.quantity * si.price)::numeric as revenue
		FROM sale_items si
		INNER JOIN inventory_items ii ON si."inventoryItemId" = ii.id
		INNER JOIN sales s ON si."saleId" = s.id
		WHERE s.status = 'COMPLETED'
		${whereClause}
		GROUP BY ii.id, ii.name
		ORDER BY quantity_sold DESC
		LIMIT ${limit}
	`;

	const result = await prisma.$queryRawUnsafe<
		Array<{
			product_id: string;
			product_name: string;
			quantity_sold: number;
			revenue: number;
		}>
	>(query);

	return result.map((row) => ({
		productId: row.product_id,
		productName: row.product_name,
		quantitySold: row.quantity_sold,
		revenue: Number(row.revenue),
	}));
}

/**
 * Get sales by date range using raw SQL
 * @param startDate - Start date for range
 * @param endDate - End date for range
 * @param userId - Optional user ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @returns Array of daily sales data
 */
export async function getSalesByDateRange(
	startDate: Date,
	endDate: Date,
	userId?: string,
	userRoles?: UserRole[],
): Promise<DailySales[]> {
	// Determine if user can see all data
	const canSeeAll =
		!userId ||
		!userRoles ||
		userRoles.includes(UserRole.MANAGER) ||
		userRoles.includes(UserRole.ADMIN) ||
		userRoles.includes(UserRole.SUPERADMIN);

	// Build WHERE clause for role-based filtering
	const whereClause = canSeeAll ? "" : `AND s."userId" = '${userId}'`;

	const query = `
		SELECT 
			DATE(s."createdAt") as date,
			COUNT(*)::int as sales,
			COALESCE(SUM(s.total), 0)::numeric as revenue
		FROM sales s
		WHERE s.status = 'COMPLETED'
		AND s."createdAt" >= $1
		AND s."createdAt" <= $2
		${whereClause}
		GROUP BY DATE(s."createdAt")
		ORDER BY date ASC
	`;

	const result = await prisma.$queryRawUnsafe<
		Array<{
			date: Date;
			sales: number;
			revenue: number;
		}>
	>(query, startDate, endDate);

	return result.map((row) => ({
		date: row.date.toISOString().split("T")[0],
		sales: row.sales,
		revenue: Number(row.revenue),
	}));
}

/**
 * Get payment method breakdown using raw SQL
 * @param userId - Optional user ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @returns Array of payment method statistics
 */
export async function getPaymentMethodBreakdown(
	userId?: string,
	userRoles?: UserRole[],
): Promise<PaymentMethodStats[]> {
	// Determine if user can see all data
	const canSeeAll =
		!userId ||
		!userRoles ||
		userRoles.includes(UserRole.MANAGER) ||
		userRoles.includes(UserRole.ADMIN) ||
		userRoles.includes(UserRole.SUPERADMIN);

	// Build WHERE clause for role-based filtering
	const whereClause = canSeeAll ? "" : `AND s."userId" = '${userId}'`;

	const query = `
		SELECT 
			s."paymentMethod" as method,
			COUNT(*)::int as count,
			COALESCE(SUM(s.total), 0)::numeric as revenue
		FROM sales s
		WHERE s.status = 'COMPLETED'
		AND s."paymentMethod" IS NOT NULL
		${whereClause}
		GROUP BY s."paymentMethod"
		ORDER BY revenue DESC
	`;

	const result = await prisma.$queryRawUnsafe<
		Array<{
			method: string;
			count: number;
			revenue: number;
		}>
	>(query);

	return result.map((row) => ({
		method: row.method,
		count: row.count,
		revenue: Number(row.revenue),
	}));
}

/**
 * Get inventory analytics using raw SQL
 * @returns Inventory analytics data
 */
export async function getInventoryAnalytics(): Promise<InventoryValueResult> {
	// Get total products and value
	const summaryQuery = `
		SELECT 
			COUNT(*)::int as total_products,
			COALESCE(SUM(ii.price * ii.stock), 0)::numeric as total_value,
			COUNT(CASE WHEN ii.stock < 10 THEN 1 END)::int as low_stock_count
		FROM inventory_items ii
		WHERE ii."deletedAt" IS NULL
	`;

	const summaryResult = await prisma.$queryRawUnsafe<
		Array<{
			total_products: number;
			total_value: number;
			low_stock_count: number;
		}>
	>(summaryQuery);

	const summary = summaryResult[0] || {
		total_products: 0,
		total_value: 0,
		low_stock_count: 0,
	};

	// Get low stock items
	const lowStockQuery = `
		SELECT 
			ii.id,
			ii.name,
			ii.stock,
			ii.price::numeric
		FROM inventory_items ii
		WHERE ii."deletedAt" IS NULL
		AND ii.stock < 10
		ORDER BY ii.stock ASC
	`;

	const lowStockItems = await prisma.$queryRawUnsafe<
		Array<{
			id: string;
			name: string;
			stock: number;
			price: number;
		}>
	>(lowStockQuery);

	// Get category distribution
	const categoryQuery = `
		SELECT 
			c.name as category,
			COUNT(ii.id)::int as count,
			COALESCE(SUM(ii.price * ii.stock), 0)::numeric as total_value
		FROM inventory_item_categories c
		LEFT JOIN inventory_items ii ON c.id = ii."categoryId" AND ii."deletedAt" IS NULL
		GROUP BY c.id, c.name
		ORDER BY count DESC
	`;

	const categoryDistribution = await prisma.$queryRawUnsafe<
		Array<{
			category: string;
			count: number;
			total_value: number;
		}>
	>(categoryQuery);

	return {
		totalProducts: summary.total_products,
		totalValue: Number(summary.total_value),
		lowStockCount: summary.low_stock_count,
		lowStockItems: lowStockItems.map((item) => ({
			...item,
			price: Number(item.price),
		})),
		categoryDistribution: categoryDistribution.map((cat) => ({
			...cat,
			totalValue: Number(cat.total_value),
		})),
	};
}

/**
 * Get dashboard statistics using raw SQL
 * @param userId - Optional user ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @returns Dashboard statistics
 */
export async function getDashboardStats(
	userId?: string,
	userRoles?: UserRole[],
): Promise<DashboardStats> {
	// Get sales analytics
	const salesAnalytics = await getSalesAnalytics(userId, userRoles);

	// Get inventory summary
	// FIX: changed ii.deleted_at to ii."deletedAt"
	const inventoryResult = await prisma.$queryRaw<
		Array<{
			total_products: number;
			low_stock_count: number;
		}>
	>`
    SELECT 
      COUNT(*)::int as total_products,
      COUNT(CASE WHEN ii.stock < 10 THEN 1 END)::int as low_stock_count
    FROM inventory_items ii
    WHERE ii."deletedAt" IS NULL
  `;

	const inventory = inventoryResult[0] || {
		total_products: 0,
		low_stock_count: 0,
	};

	// Determine if user can see all sales
	const canSeeAll =
		!userId ||
		!userRoles ||
		userRoles.includes(UserRole.MANAGER) ||
		userRoles.includes(UserRole.ADMIN) ||
		userRoles.includes(UserRole.SUPERADMIN);

	// Get recent sales with proper parameterization
	// FIX: Added quotes to camelCase columns ("createdAt", "customerId", "saleId")
	// FIX: Aliased columns (as created_at) to match your TypeScript interface
	const recentSales = canSeeAll
		? await prisma.$queryRaw<
				Array<{
					id: string;
					total: number;
					status: string;
					created_at: Date;
					customer_name: string | null;
					item_count: number;
				}>
			>`
        SELECT 
          s.id,
          s.total::numeric,
          s.status,
          s."createdAt" as created_at,
          c.name as customer_name,
          COUNT(si.id)::int as item_count
        FROM sales s
        LEFT JOIN customers c ON s."customerId" = c.id
        LEFT JOIN sale_items si ON s.id = si."saleId"
        GROUP BY s.id, s.total, s.status, s."createdAt", c.name
        ORDER BY s."createdAt" DESC
        LIMIT 5
      `
		: await prisma.$queryRaw<
				Array<{
					id: string;
					total: number;
					status: string;
					created_at: Date;
					customer_name: string | null;
					item_count: number;
				}>
			>`
        SELECT 
          s.id,
          s.total::numeric,
          s.status,
          s."createdAt" as created_at,
          c.name as customer_name,
          COUNT(si.id)::int as item_count
        FROM sales s
        LEFT JOIN customers c ON s."customerId" = c.id
        LEFT JOIN sale_items si ON s.id = si."saleId"
        WHERE s."userId" = ${userId}
        GROUP BY s.id, s.total, s.status, s."createdAt", c.name
        ORDER BY s."createdAt" DESC
        LIMIT 5
      `;

	return {
		totalSales: salesAnalytics.totalSales,
		totalRevenue: salesAnalytics.totalRevenue,
		averageOrderValue: salesAnalytics.averageOrderValue,
		totalProducts: inventory.total_products,
		lowStockCount: inventory.low_stock_count,
		recentSales: recentSales.map((sale) => ({
			id: sale.id,
			total: Number(sale.total),
			status: sale.status,
			createdAt: sale.created_at,
			customerName: sale.customer_name,
			itemCount: sale.item_count,
		})),
	};
}

// ============================================================================
// Enhanced Analytics Service
// ============================================================================

/**
 * Enhanced Analytics Service Interface
 * Defines all analytics methods for the advanced dashboard
 */
export interface AnalyticsService {
	// Product Analytics
	getTopPerformingProducts(
		params: TopProductsParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<TopProductsResult>;

	// Revenue Analytics
	getRevenueSummaryByCategory(
		params: CategoryRevenueParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<CategoryRevenueResult>;

	// Sales Trends
	getSalesTrends(
		params: SalesTrendParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<SalesTrendResult>;

	// Payment Analytics
	getPaymentMethodBreakdown(
		params: PaymentBreakdownParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<PaymentBreakdownResult>;

	// Staff Performance
	getCashierPerformance(
		params: CashierPerformanceParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<CashierPerformanceResult>;

	// Inventory Analytics
	getInventoryValue(): Promise<InventoryValueResult>;

	// Customer Analytics
	getTopCustomers(
		params: TopCustomersParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<TopCustomersResult>;

	getCustomerTrends(
		params: CustomerTrendsParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<CustomerTrendsResult>;
}

/**
 * Base Analytics Service Class
 * Provides common functionality and role-based access control
 */
export class BaseAnalyticsService implements AnalyticsService {
	/**
	 * Check if user can access all data based on role
	 */
	protected canAccessAllData(userId?: string, userRoles?: UserRole[]): boolean {
		return canViewAllData(userRoles || []);
	}

	/**
	 * Build role-based WHERE clause for SQL queries
	 */
	protected buildRoleBasedWhereClause(
		userId?: string,
		userRoles?: UserRole[],
	): string {
		if (this.canAccessAllData(userId, userRoles)) {
			return "";
		}
		return userId ? `AND s."userId" = '${userId}'` : "";
	}

	/**
	 * Validate date range parameters
	 */
	protected validateDateRange(
		startDate: string,
		endDate: string,
	): { start: Date; end: Date } {
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			throw new Error("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)");
		}

		if (start > end) {
			throw new Error("Start date must be before or equal to end date");
		}

		return { start, end };
	}

	/**
	 * Validate limit parameter
	 */
	protected validateLimit(limit?: number): number {
		if (limit !== undefined) {
			if (limit < 1 || limit > 1000) {
				throw new Error("Limit must be between 1 and 1000");
			}
		}
		return limit || 10;
	}

	/**
	 * Get top performing products with filtering and trend analysis
	 * Implements requirements 1.1-1.10
	 */
	async getTopPerformingProducts(
		params: TopProductsParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<TopProductsResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);
		const limit = this.validateLimit(params.limit);

		// Validate sortBy parameter
		if (!["revenue", "quantity"].includes(params.sortBy)) {
			throw new Error("sortBy must be 'revenue' or 'quantity'");
		}

		// Validate groupBy parameter if provided
		if (
			params.groupBy &&
			!["day", "week", "month", "year"].includes(params.groupBy)
		) {
			throw new Error("groupBy must be 'day', 'week', 'month', or 'year'");
		}

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Build category filter
		const categoryFilter = params.categoryId
			? `AND ii."categoryId" = '${params.categoryId}'`
			: "";

		// Build ORDER BY clause based on sortBy parameter
		const orderByClause =
			params.sortBy === "revenue"
				? "ORDER BY total_revenue DESC"
				: "ORDER BY units_sold DESC";

		// Main query for top performing products
		const productsQuery = `
			SELECT 
				ii.id as product_id,
				ii.name as product_name,
				ii.sku,
				c.name as category_name,
				SUM(si.quantity)::int as units_sold,
				SUM(si.quantity * si.price)::numeric as total_revenue,
				(SUM(si.quantity * si.price) / SUM(si.quantity))::numeric as average_selling_price
			FROM sale_items si
			INNER JOIN inventory_items ii ON si."inventoryItemId" = ii.id
			INNER JOIN inventory_item_categories c ON ii."categoryId" = c.id
			INNER JOIN sales s ON si."saleId" = s.id
			WHERE s.status = 'COMPLETED'
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${categoryFilter}
			${roleWhereClause}
			GROUP BY ii.id, ii.name, ii.sku, c.name
			${orderByClause}
			LIMIT ${limit}
		`;

		const products = await prisma.$queryRawUnsafe<
			Array<{
				product_id: string;
				product_name: string;
				sku: string;
				category_name: string;
				units_sold: number;
				total_revenue: number;
				average_selling_price: number;
			}>
		>(productsQuery, start, end);

		const result: TopProductsResult = {
			products: products.map((p) => ({
				productId: p.product_id,
				productName: p.product_name,
				sku: p.sku,
				categoryName: p.category_name,
				unitsSold: p.units_sold,
				totalRevenue: Number(p.total_revenue),
				averageSellingPrice: Number(p.average_selling_price),
			})),
		};

		// Generate trend data if groupBy is specified
		if (params.groupBy && products.length > 0) {
			const productIds = products.map((p) => p.product_id);
			const trendData = await this.generateTrendData(
				productIds,
				start,
				end,
				params.groupBy,
				userId,
				userRoles,
			);
			result.trendData = trendData;
		}

		return result;
	}

	/**
	 * Generate trend data for products over time intervals
	 * Helper method for getTopPerformingProducts
	 */
	private async generateTrendData(
		productIds: string[],
		startDate: Date,
		endDate: Date,
		groupBy: "day" | "week" | "month" | "year",
		userId?: string,
		userRoles?: UserRole[],
	): Promise<Array<{ date: string; revenue: number; quantity: number }>> {
		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Build product filter
		const productFilter =
			productIds.length > 0
				? `AND si."inventoryItemId" = ANY(ARRAY[${productIds.map((id) => `'${id}'`).join(",")}])`
				: "";

		// Build date truncation based on groupBy parameter
		let dateTrunc: string;
		let dateFormat: string;

		switch (groupBy) {
			case "day":
				dateTrunc = "DATE_TRUNC('day', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD";
				break;
			case "week":
				dateTrunc = "DATE_TRUNC('week', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD";
				break;
			case "month":
				dateTrunc = "DATE_TRUNC('month', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD";
				break;
			case "year":
				dateTrunc = "DATE_TRUNC('year', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD";
				break;
			default:
				throw new Error(`Invalid groupBy parameter: ${groupBy}`);
		}

		const trendQuery = `
			SELECT 
				TO_CHAR(${dateTrunc}, '${dateFormat}') as date,
				SUM(si.quantity * si.price)::numeric as revenue,
				SUM(si.quantity)::int as quantity
			FROM sale_items si
			INNER JOIN sales s ON si."saleId" = s.id
			WHERE s.status = 'COMPLETED'
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${productFilter}
			${roleWhereClause}
			GROUP BY ${dateTrunc}
			ORDER BY ${dateTrunc} ASC
		`;

		const trendResults = await prisma.$queryRawUnsafe<
			Array<{
				date: string;
				revenue: number;
				quantity: number;
			}>
		>(trendQuery, startDate, endDate);

		return trendResults.map((row) => ({
			date: row.date,
			revenue: Number(row.revenue),
			quantity: row.quantity,
		}));
	}

	/**
	 * Get revenue summary by category with percentage contributions
	 * Implements requirements 2.1-2.6
	 */
	async getRevenueSummaryByCategory(
		params: CategoryRevenueParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<CategoryRevenueResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Get revenue summary by category with consistent filtering
		const categoryRevenueQuery = `
			SELECT 
				c.id as category_id,
				c.name as category_name,
				COUNT(DISTINCT s.id)::int as total_sales_count,
				COALESCE(SUM(si.quantity * si.price), 0)::numeric as total_revenue
			FROM inventory_item_categories c
			INNER JOIN inventory_items ii ON c.id = ii."categoryId"
			INNER JOIN sale_items si ON ii.id = si."inventoryItemId"
			INNER JOIN sales s ON si."saleId" = s.id
			WHERE s.status = 'COMPLETED'
				AND s."createdAt" >= $1 
				AND s."createdAt" <= $2
				${roleWhereClause}
			GROUP BY c.id, c.name
			HAVING COALESCE(SUM(si.quantity * si.price), 0) > 0
			ORDER BY total_revenue DESC
		`;

		const categoryResults = await prisma.$queryRawUnsafe<
			Array<{
				category_id: string;
				category_name: string;
				total_sales_count: number;
				total_revenue: number;
			}>
		>(categoryRevenueQuery, start, end);

		// Calculate total revenue from the sum of all categories
		const totalRevenue = categoryResults.reduce(
			(sum, category) => sum + Number(category.total_revenue),
			0,
		);

		// Calculate percentage contributions
		const categories = categoryResults.map((category) => {
			const categoryRevenue = Number(category.total_revenue);
			const percentageOfTotal =
				totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0;

			return {
				categoryId: category.category_id,
				categoryName: category.category_name,
				totalSalesCount: category.total_sales_count,
				totalRevenue: categoryRevenue,
				percentageOfTotal: Math.round(percentageOfTotal * 100) / 100, // Round to 2 decimal places
			};
		});

		return {
			categories,
			totalRevenue,
		};
	}

	/**
	 * Get sales trends with KPI calculations and time-based aggregation
	 * Implements requirements 3.1-3.10
	 */
	async getSalesTrends(
		params: SalesTrendParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<SalesTrendResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);

		// Validate interval parameter
		const interval = params.interval || "daily";
		if (!["hourly", "daily", "weekly"].includes(interval)) {
			throw new Error("interval must be 'hourly', 'daily', or 'weekly'");
		}

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Build date truncation and format based on interval parameter
		let dateTrunc: string;
		let dateFormat: string;

		switch (interval) {
			case "hourly":
				dateTrunc = "DATE_TRUNC('hour', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD HH24:00:00";
				break;
			case "daily":
				dateTrunc = "DATE_TRUNC('day', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD";
				break;
			case "weekly":
				dateTrunc = "DATE_TRUNC('week', s.\"createdAt\")";
				dateFormat = "YYYY-MM-DD";
				break;
			default:
				throw new Error(`Invalid interval parameter: ${interval}`);
		}

		// Query for sales trends with time-based aggregation
		const trendsQuery = `
			SELECT 
				TO_CHAR(${dateTrunc}, '${dateFormat}') as date,
				COALESCE(SUM(s.total), 0)::numeric as total_revenue,
				COUNT(s.id)::int as transaction_count,
				COALESCE(AVG(s.total), 0)::numeric as average_transaction_value,
				COALESCE(SUM(s."discountAmount"), 0)::numeric as total_discounts,
				COALESCE(SUM(s."taxAmount"), 0)::numeric as total_tax
			FROM sales s
			WHERE s.status = 'COMPLETED'
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${roleWhereClause}
			GROUP BY ${dateTrunc}
			ORDER BY ${dateTrunc} ASC
		`;

		const trendsResults = await prisma.$queryRawUnsafe<
			Array<{
				date: string;
				total_revenue: number;
				transaction_count: number;
				average_transaction_value: number;
				total_discounts: number;
				total_tax: number;
			}>
		>(trendsQuery, start, end);

		// Query for overall KPIs across the entire date range
		const kpisQuery = `
			SELECT 
				COALESCE(SUM(s.total), 0)::numeric as total_gross_revenue,
				COALESCE(SUM(s."discountAmount"), 0)::numeric as total_discounts,
				COALESCE(SUM(s."taxAmount"), 0)::numeric as total_tax,
				COALESCE(AVG(s.total), 0)::numeric as average_order_value
			FROM sales s
			WHERE s.status = 'COMPLETED'
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${roleWhereClause}
		`;

		const kpisResults = await prisma.$queryRawUnsafe<
			Array<{
				total_gross_revenue: number;
				total_discounts: number;
				total_tax: number;
				average_order_value: number;
			}>
		>(kpisQuery, start, end);

		const kpisData = kpisResults[0] || {
			total_gross_revenue: 0,
			total_discounts: 0,
			total_tax: 0,
			average_order_value: 0,
		};

		// Transform results
		const trends = trendsResults.map((row) => ({
			date: row.date,
			totalRevenue: Number(row.total_revenue),
			transactionCount: row.transaction_count,
			averageTransactionValue: Number(row.average_transaction_value),
			totalDiscounts: Number(row.total_discounts),
			totalTax: Number(row.total_tax),
		}));

		const kpis = {
			totalGrossRevenue: Number(kpisData.total_gross_revenue),
			totalDiscounts: Number(kpisData.total_discounts),
			totalTax: Number(kpisData.total_tax),
			averageOrderValue: Number(kpisData.average_order_value),
		};

		return {
			trends,
			kpis,
		};
	}

	/**
	 * Get payment method breakdown with transaction counts and amounts
	 * Implements requirements 4.1-4.5
	 */
	async getPaymentMethodBreakdown(
		params: PaymentBreakdownParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<PaymentBreakdownResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// First, get total amount across all payment methods for percentage calculation
		const totalAmountQuery = `
			SELECT 
				COALESCE(SUM(s."amountPaid"), 0)::numeric as total_amount
			FROM sales s
			WHERE s.status = 'COMPLETED'
			AND s."paymentMethod" IS NOT NULL
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${roleWhereClause}
		`;

		const totalAmountResult = await prisma.$queryRawUnsafe<
			Array<{ total_amount: number }>
		>(totalAmountQuery, start, end);

		const totalAmount = Number(totalAmountResult[0]?.total_amount || 0);

		// Get payment method breakdown
		const paymentBreakdownQuery = `
			SELECT 
				s."paymentMethod" as method,
				COUNT(*)::int as transaction_count,
				COALESCE(SUM(s."amountPaid"), 0)::numeric as total_amount
			FROM sales s
			WHERE s.status = 'COMPLETED'
			AND s."paymentMethod" IS NOT NULL
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${roleWhereClause}
			GROUP BY s."paymentMethod"
			ORDER BY total_amount DESC
		`;

		const paymentResults = await prisma.$queryRawUnsafe<
			Array<{
				method: string;
				transaction_count: number;
				total_amount: number;
			}>
		>(paymentBreakdownQuery, start, end);

		// Calculate percentage contributions
		const paymentMethods = paymentResults.map((payment) => {
			const paymentAmount = Number(payment.total_amount);
			const percentageOfTotal =
				totalAmount > 0 ? (paymentAmount / totalAmount) * 100 : 0;

			return {
				method: payment.method as PaymentMethod,
				transactionCount: payment.transaction_count,
				totalAmount: paymentAmount,
				percentageOfTotal: Math.round(percentageOfTotal * 100) / 100, // Round to 2 decimal places
			};
		});

		return {
			paymentMethods,
			totalAmount,
		};
	}

	/**
	 * Get cashier performance metrics with user filtering and shift information
	 * Implements requirements 5.1-5.8
	 */
	async getCashierPerformance(
		params: CashierPerformanceParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<CashierPerformanceResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Build user filter if specific userId is requested
		const userFilter = params.userId
			? `AND s."userId" = '${params.userId}'`
			: "";

		// Get cashier performance data using ANY operator for array comparison
		const cashierPerformanceQuery = `
			SELECT 
				u.id as user_id,
				u.name as user_name,
				u.email as user_email,
				array_to_json(u.roles) as user_roles,
				COALESCE(SUM(s.total), 0)::numeric as total_revenue,
				COUNT(s.id)::int as transaction_count,
				COALESCE(AVG(s.total), 0)::numeric as average_transaction_value
			FROM users u
			LEFT JOIN sales s ON u.id = s."userId" 
				AND s.status = 'COMPLETED'
				AND s."createdAt" >= $1
				AND s."createdAt" <= $2
				${userFilter}
				${roleWhereClause.replace("AND s.", "AND s.")}
			WHERE (
				'CASHIER' = ANY(u.roles) OR 
				'MANAGER' = ANY(u.roles) OR 
				'ADMIN' = ANY(u.roles) OR 
				'SUPERADMIN' = ANY(u.roles)
			)
			GROUP BY u.id, u.name, u.email, u.roles
			ORDER BY total_revenue DESC
		`;

		const cashierResults = await prisma.$queryRawUnsafe<
			Array<{
				user_id: string;
				user_name: string;
				user_email: string;
				user_roles: UserRole[] | string; // Can be string from PostgreSQL JSON
				total_revenue: number;
				transaction_count: number;
				average_transaction_value: number;
			}>
		>(cashierPerformanceQuery, start, end);

		// Filter results to only include users with transactions if no specific user is requested
		const filteredResults = params.userId
			? cashierResults
			: cashierResults.filter((cashier) => cashier.transaction_count > 0);

		// Calculate shift information (simplified - assumes 8-hour shifts)
		// In a real implementation, this would query actual shift data
		const cashiers = filteredResults.map((cashier) => {
			const totalRevenue = Number(cashier.total_revenue);
			const averageTransactionValue = Number(cashier.average_transaction_value);

			// Parse roles from JSON string if needed
			let roles: UserRole[];
			if (typeof cashier.user_roles === "string") {
				try {
					roles = JSON.parse(cashier.user_roles);
				} catch (error) {
					console.error("Failed to parse user roles:", cashier.user_roles);
					roles = [];
				}
			} else {
				roles = cashier.user_roles;
			}

			// Calculate estimated shift hours based on transaction count
			// This is a simplified calculation - in practice, you'd have actual shift data
			const estimatedShifts = Math.ceil(cashier.transaction_count / 20); // Assume 20 transactions per shift
			const totalHours = estimatedShifts * 8; // 8 hours per shift
			const revenuePerHour = totalHours > 0 ? totalRevenue / totalHours : 0;

			return {
				userId: cashier.user_id,
				userName: cashier.user_name,
				roles,
				totalRevenue,
				transactionCount: cashier.transaction_count,
				averageTransactionValue,
				shiftInfo: {
					totalHours,
					revenuePerHour: Math.round(revenuePerHour * 100) / 100, // Round to 2 decimal places
				},
			};
		});

		return {
			cashiers,
		};
	}

	/**
	 * Get inventory value and analytics
	 * Implements requirements 6.1-6.5
	 */
	async getInventoryValue(): Promise<InventoryValueResult> {
		// Get total products and value
		const summaryQuery = `
			SELECT 
				COUNT(*)::int as total_products,
				COALESCE(SUM(ii.price * ii.stock), 0)::numeric as total_value,
				COUNT(CASE WHEN ii.stock < 10 THEN 1 END)::int as low_stock_count
			FROM inventory_items ii
			WHERE ii."deletedAt" IS NULL
		`;

		const summaryResult = await prisma.$queryRawUnsafe<
			Array<{
				total_products: number;
				total_value: number;
				low_stock_count: number;
			}>
		>(summaryQuery);

		const summary = summaryResult[0] || {
			total_products: 0,
			total_value: 0,
			low_stock_count: 0,
		};

		// Get low stock items (stock < 10)
		const lowStockQuery = `
			SELECT 
				ii.id,
				ii.name,
				ii.stock,
				ii.price::numeric
			FROM inventory_items ii
			WHERE ii."deletedAt" IS NULL
			AND ii.stock < 10
			ORDER BY ii.stock ASC
			LIMIT 20
		`;

		const lowStockItems = await prisma.$queryRawUnsafe<
			Array<{
				id: string;
				name: string;
				stock: number;
				price: number;
			}>
		>(lowStockQuery);

		// Get category distribution
		const categoryQuery = `
			SELECT 
				c.name as category,
				COUNT(ii.id)::int as count,
				COALESCE(SUM(ii.price * ii.stock), 0)::numeric as total_value
			FROM inventory_item_categories c
			LEFT JOIN inventory_items ii ON c.id = ii."categoryId" AND ii."deletedAt" IS NULL
			GROUP BY c.id, c.name
			ORDER BY count DESC
		`;

		const categoryDistribution = await prisma.$queryRawUnsafe<
			Array<{
				category: string;
				count: number;
				total_value: number;
			}>
		>(categoryQuery);

		return {
			totalValue: Number(summary.total_value),
			totalProducts: summary.total_products,
			lowStockCount: summary.low_stock_count,
			lowStockItems: lowStockItems.map((item) => ({
				id: item.id,
				name: item.name,
				stock: item.stock,
				price: Number(item.price),
			})),
			categoryDistribution: categoryDistribution.map((cat) => ({
				category: cat.category,
				count: cat.count,
				total_value: Number(cat.total_value),
			})),
		};
	}

	/**
	 * Get top customers with sorting options and customer metrics
	 * Implements requirements 7.1-7.10
	 */
	async getTopCustomers(
		params: TopCustomersParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<TopCustomersResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);
		const limit = this.validateLimit(params.limit);

		// Validate sortBy parameter
		if (!["revenue", "frequency"].includes(params.sortBy)) {
			throw new Error("sortBy must be 'revenue' or 'frequency'");
		}

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Build ORDER BY clause based on sortBy parameter
		const orderByClause =
			params.sortBy === "revenue"
				? "ORDER BY total_spent DESC"
				: "ORDER BY total_visits DESC";

		// Get top customers with spending and visit metrics
		const topCustomersQuery = `
			SELECT 
				c.id as customer_id,
				c.name as customer_name,
				c.phone as customer_phone,
				c.email as customer_email,
				COALESCE(SUM(s.total), 0)::numeric as total_spent,
				COUNT(s.id)::int as total_visits,
				COALESCE(AVG(s.total), 0)::numeric as average_transaction_value,
				MAX(s."createdAt") as last_visit
			FROM customers c
			INNER JOIN sales s ON c.id = s."customerId"
			WHERE s.status = 'COMPLETED'
			AND s."createdAt" >= $1
			AND s."createdAt" <= $2
			${roleWhereClause}
			GROUP BY c.id, c.name, c.phone, c.email
			${orderByClause}
			LIMIT ${limit}
		`;

		const customerResults = await prisma.$queryRawUnsafe<
			Array<{
				customer_id: string;
				customer_name: string | undefined | null;
				customer_phone: string;
				customer_email: string | undefined | null;
				total_spent: number;
				total_visits: number;
				average_transaction_value: number;
				last_visit: Date;
			}>
		>(topCustomersQuery, start, end);

		// Transform results
		const customers = customerResults.map((customer) => ({
			customerId: customer.customer_id,
			customerName: customer.customer_name,
			customerPhone: customer.customer_phone,
			customerEmail: customer.customer_email,
			totalSpent: Number(customer.total_spent),
			totalVisits: customer.total_visits,
			averageTransactionValue: Number(customer.average_transaction_value),
			lastVisit: customer.last_visit.toISOString(),
		}));

		return {
			customers,
		};
	}

	/**
	 * Get customer purchase trend analysis with growth classification
	 * Implements requirements 8.1-8.11
	 */
	async getCustomerTrends(
		params: CustomerTrendsParams,
		userId?: string,
		userRoles?: UserRole[],
	): Promise<CustomerTrendsResult> {
		// Validate parameters
		const { start, end } = this.validateDateRange(
			params.startDate,
			params.endDate,
		);

		// Validate interval parameter
		if (!["week", "month"].includes(params.interval)) {
			throw new Error("interval must be 'week' or 'month'");
		}

		// Build role-based access control
		const roleWhereClause = this.buildRoleBasedWhereClause(userId, userRoles);

		// Determine customer IDs to analyze
		let customerIds = params.customerIds;
		if (!customerIds || customerIds.length === 0) {
			// Default to analyzing top 20 customers by revenue from current year
			const currentYear = new Date().getFullYear();
			const yearStart = new Date(currentYear, 0, 1);
			const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

			const topCustomersQuery = `
				SELECT c.id
				FROM customers c
				INNER JOIN sales s ON c.id = s."customerId"
				WHERE s.status = 'COMPLETED'
				AND s."createdAt" >= $1
				AND s."createdAt" <= $2
				${roleWhereClause}
				GROUP BY c.id
				ORDER BY SUM(s.total) DESC
				LIMIT 20
			`;

			const topCustomersResult = await prisma.$queryRawUnsafe<
				Array<{ id: string }>
			>(topCustomersQuery, yearStart, yearEnd);

			customerIds = topCustomersResult.map((customer) => customer.id);
		}

		if (customerIds.length === 0) {
			return { customers: [] };
		}

		// Build date truncation based on interval parameter
		const dateTrunc =
			params.interval === "week"
				? "DATE_TRUNC('week', s.\"createdAt\")"
				: "DATE_TRUNC('month', s.\"createdAt\")";

		const dateFormat = "YYYY-MM-DD";

		// Get customer trends data
		const trendsQuery = `
			SELECT 
				c.id as customer_id,
				c.name as customer_name,
				TO_CHAR(${dateTrunc}, '${dateFormat}') as period,
				COALESCE(SUM(s.total), 0)::numeric as revenue,
				MAX(s."createdAt") as last_visit
			FROM customers c
			LEFT JOIN sales s ON c.id = s."customerId" 
				AND s.status = 'COMPLETED'
				AND s."createdAt" >= $1
				AND s."createdAt" <= $2
				${roleWhereClause}
			WHERE c.id = ANY(ARRAY[${customerIds.map((id) => `'${id}'`).join(",")}])
			GROUP BY c.id, c.name, ${dateTrunc}
			ORDER BY c.id, ${dateTrunc}
		`;

		const trendsResults = await prisma.$queryRawUnsafe<
			Array<{
				customer_id: string;
				customer_name: string;
				period: string;
				revenue: number;
				last_visit: Date | null;
			}>
		>(trendsQuery, start, end);

		// Group results by customer and calculate growth percentages
		const customerMap = new Map<
			string,
			{
				customerId: string;
				customerName: string;
				trends: Array<{
					period: string;
					revenue: number;
					growthPercentage: number;
				}>;
				lastVisit: string;
			}
		>();

		trendsResults.forEach((row) => {
			if (!customerMap.has(row.customer_id)) {
				customerMap.set(row.customer_id, {
					customerId: row.customer_id,
					customerName: row.customer_name,
					trends: [],
					lastVisit: row.last_visit?.toISOString() || "",
				});
			}

			const customer = customerMap.get(row.customer_id)!;
			customer.trends.push({
				period: row.period,
				revenue: Number(row.revenue),
				growthPercentage: 0, // Will be calculated below
			});

			// Update last visit if this is more recent
			if (row.last_visit && row.last_visit.toISOString() > customer.lastVisit) {
				customer.lastVisit = row.last_visit.toISOString();
			}
		});

		// Calculate growth percentages and customer status
		const customers = Array.from(customerMap.values()).map((customer) => {
			// Sort trends by period
			customer.trends.sort((a, b) => a.period.localeCompare(b.period));

			// Calculate growth percentages
			for (let i = 1; i < customer.trends.length; i++) {
				const current = customer.trends[i].revenue;
				const previous = customer.trends[i - 1].revenue;

				if (previous > 0) {
					customer.trends[i].growthPercentage =
						Math.round(((current - previous) / previous) * 100 * 100) / 100; // Round to 2 decimal places
				}
			}

			// Determine customer status based on latest growth and activity
			let status: "Trending Up" | "Slipping" | "At Risk" = "Slipping";

			if (customer.trends.length >= 2) {
				const latestGrowth =
					customer.trends[customer.trends.length - 1].growthPercentage;
				const lastVisitDate = new Date(customer.lastVisit);
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

				if (latestGrowth > 0) {
					status = "Trending Up";
				} else if (latestGrowth <= -50 || lastVisitDate < thirtyDaysAgo) {
					status = "At Risk";
				} else if (latestGrowth < -20) {
					status = "Slipping";
				}
			}

			return {
				...customer,
				status,
			};
		});

		return {
			customers,
		};
	}
}

/**
 * Enhanced Analytics Service Instance
 * Singleton instance for use throughout the application
 */
export const enhancedAnalyticsService = new BaseAnalyticsService();
