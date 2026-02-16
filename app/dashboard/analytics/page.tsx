"use client";

import { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import {
	CalendarIcon,
	Download,
	BarChart3,
	TrendingUpIcon,
	CreditCard,
	Users,
	Package,
	RefreshCw,
	Settings,
} from "lucide-react";
import { canViewAllData } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
	useAnalyticsDashboardWithRefresh,
	useRefreshPreferences,
	REFRESH_INTERVALS,
} from "@/hooks/use-analytics";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

// Import report components
import {
	OverviewMetrics,
	RevenueTrendReport,
	SalesTrendReport,
	PaymentMethodsReport,
	TopProductsReport,
	RecentSalesReport,
	EnhancedTopProductsReport,
	EnhancedSalesTrendsReport,
	EnhancedPaymentMethodsReport,
	CustomerAnalyticsReport,
	CategoryRevenueReport,
} from "@/components/analytics/reports";
import { toast } from "sonner";

// Date range presets
const DATE_PRESETS = [
	{ label: "Today", days: 0 },
	{ label: "Last 7 days", days: 7 },
	{ label: "Last 30 days", days: 30 },
	{ label: "Last 90 days", days: 90 },
	{ label: "Last year", days: 365 },
];

// Analytics module tabs
const ANALYTICS_MODULES = [
	{ id: "overview", label: "Overview", icon: BarChart3 },
	{ id: "products", label: "Products", icon: Package },
	{ id: "sales", label: "Sales Trends", icon: TrendingUpIcon },
	{ id: "payments", label: "Payments", icon: CreditCard },
	{ id: "customers", label: "Customers", icon: Users },
];

// Export functionality
const exportToCSV = (data: any[], filename: string) => {
	if (!data || data.length === 0) return;

	const headers = Object.keys(data[0]);
	const csvContent = [
		headers.join(","),
		...data.map((row) =>
			headers.map((header) => `"${row[header] || ""}"`).join(","),
		),
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	link.setAttribute("href", url);
	link.setAttribute(
		"download",
		`${filename}-${new Date().toISOString().split("T")[0]}.csv`,
	);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export default function AnalyticsPage() {
	const { user } = useAuth();

	// Check if user has access to analytics page (only SUPERADMIN and MANAGER)
	const canAccessAnalytics =
		user?.roles.includes("SUPERADMIN") || user?.roles.includes("MANAGER");

	// Redirect unauthorized users
	if (user && !canAccessAnalytics) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='text-center space-y-4'>
					<h1 className='text-2xl font-bold text-red-600'>Access Denied</h1>
					<p className='text-gray-600'>
						You do not have permission to access the analytics page.
					</p>
					<Button asChild>
						<a href='/dashboard'>Go to Dashboard</a>
					</Button>
				</div>
			</div>
		);
	}

	const [activeTab, setActiveTab] = useState("overview");
	const [dateRange, setDateRange] = useState<{
		from: Date;
		to: Date;
	}>({
		from: subDays(new Date(), 30),
		to: new Date(),
	});
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

	const [selectedCategoryId, setSelectedCategoryId] = useState<
		string | undefined
	>();

	const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

	const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

	// Refresh preferences
	const refreshPrefs = useRefreshPreferences();

	// Calculate date range for API queries
	const apiDateRange = useMemo(
		() => ({
			startDate: startOfDay(dateRange.from).toISOString(),
			endDate: endOfDay(dateRange.to).toISOString(),
		}),
		[dateRange],
	);

	// Use the enhanced analytics dashboard hook with refresh capabilities
	const dashboard = useAnalyticsDashboardWithRefresh(apiDateRange, {
		enabled: refreshPrefs.preferences.enabled,
		interval: refreshPrefs.preferences.interval,
		onRefresh: () => {
			toast.success("Analytics data refreshed successfully");
		},
		onError: (error) => {
			toast.error(
				`Analytics refresh failed: ${JSON.stringify(error, null, 2)}`,
			);
		},
	});

	// Handle date preset selection
	const handlePresetSelect = (days: number) => {
		const to = new Date();
		const from = days === 0 ? new Date() : subDays(new Date(), days);
		setDateRange({ from, to });
		// setIsDatePickerOpen(false);
	};

	// Handle CSV export with enhanced functionality
	const handleExport = useCallback(
		async (module: string) => {
			try {
				switch (module) {
					case "products":
						if (dashboard.data.topProducts?.products) {
							exportToCSV(dashboard.data.topProducts.products, "top-products");
						}
						break;
					case "sales":
						if (dashboard.data.salesTrends?.trends) {
							exportToCSV(dashboard.data.salesTrends.trends, "sales-trends");
						}
						break;
					case "payments":
						if (dashboard.data.paymentBreakdown?.paymentMethods) {
							exportToCSV(
								dashboard.data.paymentBreakdown.paymentMethods,
								"payment-breakdown",
							);
						}
						break;
					case "customers":
						if (dashboard.data.topCustomers?.customers) {
							exportToCSV(
								dashboard.data.topCustomers.customers,
								"top-customers",
							);
						}
						break;
					case "overview":
						// Export combined overview data
						const overviewData = [
							{
								metric: "Total Revenue",
								value: dashboard.data.salesTrends?.kpis.totalGrossRevenue || 0,
								period: `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`,
							},
							{
								metric: "Average Order Value",
								value: dashboard.data.salesTrends?.kpis.averageOrderValue || 0,
								period: `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`,
							},
							{
								metric: "Total Discounts",
								value: dashboard.data.salesTrends?.kpis.totalDiscounts || 0,
								period: `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`,
							},
							{
								metric: "Inventory Value",
								value: dashboard.data.inventoryValue?.totalValue || 0,
								period: "Current",
							},
						];
						exportToCSV(overviewData, "analytics-overview");
						break;
					default:
						console.log(`Export not implemented for ${module}`);
				}
			} catch (error) {
				console.error("Export failed:", error);
			}
		},
		[dashboard.data, dateRange],
	);

	// Drill-down handlers
	const handleProductClick = useCallback((productId: string) => {
		console.log("Product clicked:", productId);
		// TODO: Navigate to product details or show modal
	}, []);

	const handleCategoryClick = useCallback((categoryId: string) => {
		console.log("Category clicked:", categoryId);
		setSelectedCategoryId(categoryId);
		setActiveTab("products"); // Switch to products tab with category filter
	}, []);

	const handleCashierClick = useCallback((userId: string) => {
		console.log("Cashier clicked:", userId);
		setSelectedUserId(userId);
		// Could show detailed cashier performance modal
	}, []);

	const handleCustomerClick = useCallback((customerId: string) => {
		console.log("Customer clicked:", customerId);
		setSelectedCustomerIds([customerId]);
		setActiveTab("customers"); // Switch to customers tab with specific customer
	}, []);

	const handlePaymentMethodClick = useCallback((method: any) => {
		console.log("Payment method clicked:", method);
		// Could filter other views by payment method
	}, []);

	const handleSaleClick = useCallback((saleId: string) => {
		console.log("Sale clicked:", saleId);
		// TODO: Navigate to sale details or show modal
	}, []);

	// Global refresh handler
	const handleGlobalRefresh = useCallback(() => {
		dashboard.refresh.manualRefresh();
	}, [dashboard.refresh]);

	if (!user) return null;

	const canSeeAll = canViewAllData(user.roles);

	return (
		<div className='space-y-6 p-6'>
			{/* Header with Date Range Selector and Real-time Controls */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
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

				<div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
					<Badge
						variant='secondary'
						className='bg-brand-main-100 text-brand-main-800 w-fit'>
						{canSeeAll ? "All Data" : "Personal Data"}
					</Badge>

					{/* Real-time Refresh Controls */}
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={dashboard.refresh.manualRefresh}
							disabled={dashboard.refresh.isRefreshing}
							className='flex items-center gap-2'>
							{dashboard.refresh.isRefreshing ? (
								<RefreshCw className='h-4 w-4 animate-spin' />
							) : (
								<RefreshCw className='h-4 w-4' />
							)}
							Refresh
						</Button>

						<Popover>
							<PopoverTrigger>
								<Button
									variant='outline'
									size='sm'
									className='flex items-center gap-2'>
									<Settings className='h-4 w-4' />
									Auto-refresh
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-80'>
								<div className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='auto-refresh'>Enable Auto-refresh</Label>
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
												{refreshPrefs.preferences.enabled
													? "Enabled"
													: "Disabled"}
											</span>
										</div>
									</div>

									{refreshPrefs.preferences.enabled && (
										<div className='space-y-2'>
											<Label>Refresh Interval</Label>
											<Select
												value={refreshPrefs.preferences.interval.toString()}
												onValueChange={(value) =>
													refreshPrefs.setRefreshInterval(parseInt(value))
												}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem
														value={REFRESH_INTERVALS.EVERY_30_SECONDS.toString()}>
														Every 30 seconds
													</SelectItem>
													<SelectItem
														value={REFRESH_INTERVALS.EVERY_MINUTE.toString()}>
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
									)}

									{dashboard.refresh.lastRefresh && (
										<div className='text-sm text-muted-foreground'>
											Last refresh: {dashboard.refresh.formatLastRefresh()}
										</div>
									)}
								</div>
							</PopoverContent>
						</Popover>
					</div>

					{/* Date Range Selector */}
					<Popover
						open={isDatePickerOpen}
						onOpenChange={setIsDatePickerOpen}>
						<PopoverTrigger>
							<Button
								// onClick={() => setIsDatePickerOpen((prev) => !prev)}
								variant='outline'
								className={cn(
									"w-[280px] justify-start text-left font-normal",
									!dateRange && "text-muted-foreground",
								)}>
								<CalendarIcon className='mr-2 h-4 w-4' />
								{dateRange?.from ? (
									dateRange.to ? (
										<>
											{format(dateRange.from, "LLL dd, y")} -{" "}
											{format(dateRange.to, "LLL dd, y")}
										</>
									) : (
										format(dateRange.from, "LLL dd, y")
									)
								) : (
									<span>Pick a date range</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className='w-auto p-0'
							align='end'>
							<div className='flex'>
								<div className='flex flex-col gap-2 p-3 border-r'>
									<div className='text-sm font-medium'>Quick Select</div>
									{DATE_PRESETS.map((preset) => (
										<Button
											key={preset.label}
											variant='ghost'
											size='sm'
											className='justify-start'
											onClick={() => handlePresetSelect(preset.days)}>
											{preset.label}
										</Button>
									))}

									<Button
										onClick={() => setIsDatePickerOpen((prev) => !prev)}
										variant='outline'
										className='mt-auto'>
										Apply Filter
									</Button>
								</div>
								<Calendar
									mode='range'
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={(range) => {
										if (range?.from && range?.to) {
											setDateRange({ from: range.from, to: range.to });
										}
									}}
									numberOfMonths={2}
								/>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Analytics Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className='space-y-6'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<TabsList className='grid w-full grid-cols-5 lg:w-fit'>
						{ANALYTICS_MODULES.map((module) => (
							<TabsTrigger
								key={module.id}
								value={module.id}
								className='flex items-center gap-2'>
								<module.icon className='h-4 w-4' />
								<span className='hidden sm:inline'>{module.label}</span>
							</TabsTrigger>
						))}
					</TabsList>

					<Button
						variant='outline'
						size='sm'
						onClick={() => handleExport(activeTab)}
						className='flex items-center gap-2'>
						<Download className='h-4 w-4' />
						Export CSV
					</Button>
				</div>

				{/* Overview Tab */}
				<TabsContent
					value='overview'
					className='space-y-6'>
					{/* Key Metrics */}
					<OverviewMetrics onRefresh={handleGlobalRefresh} />

					{/* Revenue Trend Chart */}
					<RevenueTrendReport
						dateRange={apiDateRange}
						onRefresh={handleGlobalRefresh}
					/>

					{/* Charts Section */}
					<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 h-[450px] lg:h-fit'>
						<SalesTrendReport
							dateRange={apiDateRange}
							onRefresh={handleGlobalRefresh}
						/>

						<PaymentMethodsReport
							dateRange={apiDateRange}
							onPaymentMethodClick={handlePaymentMethodClick}
							onRefresh={handleGlobalRefresh}
						/>
					</div>

					{/* Bottom Section */}
					<div className='grid gap-4 md:grid-cols-2'>
						<TopProductsReport
							limit={5}
							onProductClick={handleProductClick}
							onRefresh={handleGlobalRefresh}
						/>

						<RecentSalesReport
							onSaleClick={handleSaleClick}
							onRefresh={handleGlobalRefresh}
						/>
					</div>
				</TabsContent>

				{/* Products Tab */}
				<TabsContent
					value='products'
					className='space-y-6'>
					<EnhancedTopProductsReport
						dateRange={apiDateRange}
						selectedCategoryId={selectedCategoryId}
						onProductClick={handleProductClick}
						onRefresh={handleGlobalRefresh}
					/>

					<CategoryRevenueReport
						dateRange={apiDateRange}
						onCategoryClick={handleCategoryClick}
						onRefresh={handleGlobalRefresh}
					/>
				</TabsContent>

				{/* Sales Trends Tab */}
				<TabsContent
					value='sales'
					className='space-y-6'>
					<EnhancedSalesTrendsReport
						dateRange={apiDateRange}
						onCashierClick={handleCashierClick}
						onRefresh={handleGlobalRefresh}
					/>
				</TabsContent>

				{/* Payments Tab */}
				<TabsContent
					value='payments'
					className='space-y-6'>
					<EnhancedPaymentMethodsReport
						dateRange={apiDateRange}
						onPaymentMethodClick={handlePaymentMethodClick}
						onRefresh={handleGlobalRefresh}
					/>
				</TabsContent>

				{/* Customers Tab */}
				<TabsContent
					value='customers'
					className='space-y-6'>
					<CustomerAnalyticsReport
						dateRange={apiDateRange}
						selectedCustomerIds={selectedCustomerIds}
						onCustomerClick={handleCustomerClick}
						onRefresh={handleGlobalRefresh}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
