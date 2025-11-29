"use client";

import { useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { SalesChart } from "@/components/analytics/sales-chart";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { PaymentMethodsChart } from "@/components/analytics/payment-methods-chart";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	ShoppingCart,
	AlertTriangle,
	Loader2,
} from "lucide-react";
import { canViewAllData } from "@/lib/auth";
import { formatNaira } from "@/lib/utils";
import {
	useGetDashboardStatsQuery,
	useGetSalesByDateQuery,
	useGetTopProductsQuery,
	useGetPaymentMethodsQuery,
	useGetInventoryAnalyticsQuery,
} from "@/lib/store/api";

export default function AnalyticsPage() {
	const { user } = useAuth();

	// Calculate date range for last 30 days
	const dateRange = useMemo(() => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		return {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
		};
	}, []);

	// Fetch all analytics data using RTK Query hooks
	const {
		data: dashboardStats,
		isLoading: isDashboardLoading,
		isError: isDashboardError,
		error: dashboardError,
	} = useGetDashboardStatsQuery();

	const {
		data: salesByDay = [],
		isLoading: isSalesLoading,
		isError: isSalesError,
		error: salesError,
	} = useGetSalesByDateQuery(dateRange);

	const {
		data: topProducts = [],
		isLoading: isProductsLoading,
		isError: isProductsError,
		error: productsError,
	} = useGetTopProductsQuery({ limit: 5 });

	const {
		data: paymentMethods = [],
		isLoading: isPaymentsLoading,
		isError: isPaymentsError,
		error: paymentsError,
	} = useGetPaymentMethodsQuery();

	const {
		data: inventoryAnalytics,
		isLoading: isInventoryLoading,
		isError: isInventoryError,
		error: inventoryError,
	} = useGetInventoryAnalyticsQuery();

	// Combine loading states
	const loading =
		isDashboardLoading ||
		isSalesLoading ||
		isProductsLoading ||
		isPaymentsLoading ||
		isInventoryLoading;

	// Combine error states
	const isError =
		isDashboardError ||
		isSalesError ||
		isProductsError ||
		isPaymentsError ||
		isInventoryError;

	// Get first error message
	const error = isError
		? (dashboardError as any)?.data?.error?.message ||
		  (salesError as any)?.data?.error?.message ||
		  (productsError as any)?.data?.error?.message ||
		  (paymentsError as any)?.data?.error?.message ||
		  (inventoryError as any)?.data?.error?.message ||
		  "Failed to load analytics data"
		: null;

	if (!user) return null;

	const canSeeAll = canViewAllData(user.roles);

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Analytics
						</CardTitle>
						<CardDescription className='text-red-700'>{error}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!dashboardStats || !inventoryAnalytics) {
		return null;
	}

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-brand-main-800'>
						Analytics Dashboard
					</h1>
					<p className='text-brand-main-600 mt-1'>
						{canSeeAll
							? "Store-wide analytics and insights"
							: "Your personal sales analytics"}
					</p>
				</div>
				<Badge
					variant='secondary'
					className='bg-brand-main-100 text-brand-main-800'>
					{canSeeAll ? "All Data" : "Personal Data"}
				</Badge>
			</div>

			{/* Key Metrics */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Revenue
						</CardTitle>
						<DollarSign className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{formatNaira(dashboardStats.totalRevenue)}
						</div>
						<p className='text-xs text-brand-main-600 flex items-center mt-1'>
							<TrendingUp className='h-3 w-3 mr-1' />
							Total sales revenue
						</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Sales
						</CardTitle>
						<ShoppingCart className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{dashboardStats.totalSales}
						</div>
						<p className='text-xs text-brand-main-600 flex items-center mt-1'>
							<TrendingUp className='h-3 w-3 mr-1' />
							Completed transactions
						</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Avg Order Value
						</CardTitle>
						<DollarSign className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{formatNaira(dashboardStats.averageOrderValue)}
						</div>
						<p className='text-xs text-brand-main-600 flex items-center mt-1'>
							<TrendingDown className='h-3 w-3 mr-1' />
							Per transaction
						</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Low Stock Items
						</CardTitle>
						<AlertTriangle className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{inventoryAnalytics.lowStockCount}
						</div>
						<p className='text-xs text-brand-main-600'>Items below 10 units</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts Section */}
			<div className='grid w-full h-[450px] lg:h-[550px]'>
				<Card className='border-brand-main-200 w-full flex flex-col h-full'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>Revenue Trend</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Daily revenue over the last 30 days
						</CardDescription>
					</CardHeader>
					<CardContent className='flex-1'>
						<RevenueChart data={salesByDay} />
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-4 md:grid-cols-2 h-[450px] lg:h-[550px]'>
				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>
							Payment Methods
						</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Sales distribution by payment type
						</CardDescription>
					</CardHeader>
					<CardContent className='p-3 flex-1'>
						<PaymentMethodsChart data={paymentMethods} />
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>Sales Trend</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Daily sales over the last 30 days
						</CardDescription>
					</CardHeader>
					<CardContent className='flex-1 '>
						<SalesChart data={salesByDay} />
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>Top Products</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Best selling items
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{topProducts.length > 0 ? (
								topProducts.map((product, index) => (
									<div
										key={product.productId}
										className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<div className='flex h-8 w-8 items-center justify-center rounded-full bg-brand-main-100 text-xs font-medium text-brand-main-800'>
												{index + 1}
											</div>
											<div>
												<p className='text-sm font-medium text-brand-main-800'>
													{product.productName}
												</p>
												<p className='text-xs text-brand-main-600'>
													{product.quantitySold} units sold
												</p>
											</div>
										</div>
										<div className='text-sm font-medium text-brand-main-800'>
											{formatNaira(product.revenue)}
										</div>
									</div>
								))
							) : (
								<p className='text-sm text-brand-main-600'>
									No product data available
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>Recent Sales</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Latest transactions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{dashboardStats.recentSales.length > 0 ? (
								dashboardStats.recentSales.map((sale) => (
									<div
										key={sale.id}
										className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-brand-main-800'>
												Sale #{sale.id.slice(0, 8)}
											</p>
											<p className='text-xs text-brand-main-600'>
												{new Date(sale.createdAt).toLocaleDateString()} •{" "}
												{sale.itemCount} items
											</p>
										</div>
										<div className='text-sm font-medium text-brand-main-800'>
											{formatNaira(sale.total)}
										</div>
									</div>
								))
							) : (
								<p className='text-sm text-brand-main-600'>No recent sales</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
