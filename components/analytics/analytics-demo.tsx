"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import {
	useAnalyticsDashboardWithRefresh,
	useRefreshPreferences,
	REFRESH_INTERVALS,
} from "@/hooks/use-analytics";
import { subDays } from "date-fns";

/**
 * Demo component showing how to use the new analytics hooks
 * This demonstrates the enhanced data fetching with real-time refresh capabilities
 */
export function AnalyticsDemo() {
	// Date range state (last 30 days by default)
	const [dateRange] = useState({
		startDate: subDays(new Date(), 30).toISOString(),
		endDate: new Date().toISOString(),
	});

	// Refresh preferences
	const refreshPrefs = useRefreshPreferences();

	// Use the enhanced analytics dashboard hook with refresh capabilities
	const dashboard = useAnalyticsDashboardWithRefresh(dateRange, {
		enabled: refreshPrefs.preferences.enabled,
		interval: refreshPrefs.preferences.interval,
		onRefresh: () => {
			console.log("Analytics data refreshed successfully");
		},
		onError: (error) => {
			console.error("Analytics refresh failed:", error);
		},
	});

	// Handle refresh interval change
	const handleIntervalChange = (value: string) => {
		const interval = parseInt(value);
		refreshPrefs.setRefreshInterval(interval);
	};

	// Get refresh interval label
	const getIntervalLabel = (interval: number) => {
		const entry = Object.entries(REFRESH_INTERVALS).find(
			([, value]) => value === interval,
		);
		return entry ? entry[0].replace(/_/g, " ").toLowerCase() : "custom";
	};

	return (
		<div className='space-y-6'>
			{/* Refresh Controls */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<RefreshCw className='h-5 w-5' />
						Real-time Refresh Demo
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center justify-between'>
						<div className='space-y-2'>
							<Label htmlFor='auto-refresh'>Auto Refresh</Label>
							<div className='flex items-center space-x-2'>
								<Switch
									id='auto-refresh'
									checked={refreshPrefs.preferences.enabled}
									onCheckedChange={(checked) => {
										if (checked) {
											refreshPrefs.enableAutoRefresh();
										} else {
											refreshPrefs.disableAutoRefresh();
										}
									}}
								/>
								<span className='text-sm text-muted-foreground'>
									{refreshPrefs.preferences.enabled ? "Enabled" : "Disabled"}
								</span>
							</div>
						</div>

						<div className='space-y-2'>
							<Label>Refresh Interval</Label>
							<Select
								value={refreshPrefs.preferences.interval.toString()}
								onValueChange={handleIntervalChange}
								disabled={!refreshPrefs.preferences.enabled}>
								<SelectTrigger className='w-48'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										value={REFRESH_INTERVALS.EVERY_10_SECONDS.toString()}>
										Every 10 seconds
									</SelectItem>
									<SelectItem
										value={REFRESH_INTERVALS.EVERY_30_SECONDS.toString()}>
										Every 30 seconds
									</SelectItem>
									<SelectItem value={REFRESH_INTERVALS.EVERY_MINUTE.toString()}>
										Every minute
									</SelectItem>
									<SelectItem
										value={REFRESH_INTERVALS.EVERY_5_MINUTES.toString()}>
										Every 5 minutes
									</SelectItem>
									<SelectItem
										value={REFRESH_INTERVALS.EVERY_15_MINUTES.toString()}>
										Every 15 minutes
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label>Manual Actions</Label>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={dashboard.refresh.manualRefresh}
									disabled={dashboard.refresh.isRefreshing}>
									{dashboard.refresh.isRefreshing ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<RefreshCw className='h-4 w-4' />
									)}
									Refresh
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={dashboard.refresh.smartRefresh}
									disabled={dashboard.refresh.isRefreshing}>
									Smart Refresh
								</Button>
							</div>
						</div>
					</div>

					{/* Refresh Status */}
					<div className='flex items-center justify-between text-sm text-muted-foreground'>
						<div className='flex items-center gap-4'>
							<span>Last refresh: {dashboard.refresh.formatLastRefresh()}</span>
							<span>Refresh count: {dashboard.refresh.refreshCount}</span>
							{dashboard.refresh.isAutoRefreshActive && (
								<Badge
									variant='secondary'
									className='text-xs'>
									Auto-refresh active (
									{getIntervalLabel(refreshPrefs.preferences.interval)})
								</Badge>
							)}
						</div>
						{dashboard.refresh.isRefreshing && (
							<div className='flex items-center gap-2'>
								<Loader2 className='h-4 w-4 animate-spin' />
								<span>Refreshing...</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Analytics Data Display */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{/* Top Products */}
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Top Products</CardTitle>
					</CardHeader>
					<CardContent>
						{dashboard.queries.topProducts.isLoading ? (
							<div className='flex items-center justify-center h-16'>
								<Loader2 className='h-6 w-6 animate-spin' />
							</div>
						) : dashboard.queries.topProducts.isError ? (
							<div className='flex items-center gap-2 text-red-600'>
								<AlertCircle className='h-4 w-4' />
								<span className='text-sm'>
									{dashboard.queries.topProducts.error?.message ||
										"Error loading data"}
								</span>
							</div>
						) : (
							<div className='space-y-2'>
								{dashboard.data.topProducts?.products
									.slice(0, 3)
									.map((product, index) => (
										<div
											key={product.productId}
											className='flex justify-between text-sm'>
											<span className='truncate'>
												{index + 1}. {product.productName}
											</span>
											<span className='font-medium'>
												{formatNaira(product.totalRevenue)}
											</span>
										</div>
									)) || (
									<span className='text-sm text-muted-foreground'>No data</span>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Category Revenue */}
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>
							Category Revenue
						</CardTitle>
					</CardHeader>
					<CardContent>
						{dashboard.queries.categoryRevenue.isLoading ? (
							<div className='flex items-center justify-center h-16'>
								<Loader2 className='h-6 w-6 animate-spin' />
							</div>
						) : dashboard.queries.categoryRevenue.isError ? (
							<div className='flex items-center gap-2 text-red-600'>
								<AlertCircle className='h-4 w-4' />
								<span className='text-sm'>Error loading data</span>
							</div>
						) : (
							<div className='space-y-2'>
								{dashboard.data.categoryRevenue?.categories
									.slice(0, 3)
									.map((category) => (
										<div
											key={category.categoryId}
											className='flex justify-between text-sm'>
											<span className='truncate'>{category.categoryName}</span>
											<span className='font-medium'>
												{category.percentageOfTotal.toFixed(1)}%
											</span>
										</div>
									)) || (
									<span className='text-sm text-muted-foreground'>No data</span>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Sales Trends KPIs */}
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Sales KPIs</CardTitle>
					</CardHeader>
					<CardContent>
						{dashboard.queries.salesTrends.isLoading ? (
							<div className='flex items-center justify-center h-16'>
								<Loader2 className='h-6 w-6 animate-spin' />
							</div>
						) : dashboard.queries.salesTrends.isError ? (
							<div className='flex items-center gap-2 text-red-600'>
								<AlertCircle className='h-4 w-4' />
								<span className='text-sm'>Error loading data</span>
							</div>
						) : (
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span>Total Revenue:</span>
									<span className='font-medium'>
										{formatNaira(
											dashboard.data.salesTrends?.kpis.totalGrossRevenue || 0,
										)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Avg Order:</span>
									<span className='font-medium'>
										{formatNaira(
											dashboard.data.salesTrends?.kpis.averageOrderValue || 0,
										)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Total Discounts:</span>
									<span className='font-medium'>
										{formatNaira(
											dashboard.data.salesTrends?.kpis.totalDiscounts || 0,
										)}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Inventory Value */}
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Inventory</CardTitle>
					</CardHeader>
					<CardContent>
						{dashboard.queries.inventoryValue.isLoading ? (
							<div className='flex items-center justify-center h-16'>
								<Loader2 className='h-6 w-6 animate-spin' />
							</div>
						) : dashboard.queries.inventoryValue.isError ? (
							<div className='flex items-center gap-2 text-red-600'>
								<AlertCircle className='h-4 w-4' />
								<span className='text-sm'>Error loading data</span>
							</div>
						) : (
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span>Total Value:</span>
									<span className='font-medium'>
										{formatNaira(
											dashboard.data.inventoryValue?.totalEstimatedValue || 0,
										)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Total Products:</span>
									<span className='font-medium'>
										{dashboard.data.inventoryValue?.totalProducts || 0}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Low Stock:</span>
									<span className='font-medium text-orange-600'>
										{dashboard.data.inventoryValue?.lowStockItems.length || 0}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Error Summary */}
			{dashboard.isError && dashboard.errors.length > 0 && (
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800 flex items-center gap-2'>
							<AlertCircle className='h-5 w-5' />
							Analytics Errors
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							{dashboard.errors.map((error, index) => (
								<div
									key={index}
									className='text-sm text-red-700'>
									• {error?.message || "Unknown error"}
									{error?.retryable && (
										<Button
											variant='link'
											size='sm'
											className='h-auto p-0 ml-2 text-red-600'
											onClick={dashboard.retryAll}>
											Retry
										</Button>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
