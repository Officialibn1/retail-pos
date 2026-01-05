import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { DashboardStats, InventoryAnalytics } from "../types";

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
export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
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
		LIMIT 10
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
