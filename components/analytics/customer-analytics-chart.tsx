"use client";

import { useState } from "react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { CustomerTrendsResult, TopCustomersResult } from "@/lib/types";
import {
	Users,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	DollarSign,
	ShoppingCart,
	Calendar,
	ArrowUpDown,
	BarChart3,
	LineChart as LineChartIcon,
	Table as TableIcon,
} from "lucide-react";

interface CustomerAnalyticsChartProps {
	topCustomersData?: TopCustomersResult;
	customerTrendsData?: CustomerTrendsResult;
	onCustomerClick?: (customerId: string) => void;
}

type ViewMode = "ranking" | "trends" | "table";
type SortField =
	| "customerName"
	| "totalSpent"
	| "totalVisits"
	| "averageTransactionValue"
	| "lastVisit";
type SortDirection = "asc" | "desc";

const chartConfig = {
	totalSpent: {
		label: "Total Spent (₦)",
		color: "var(--color-brand-main-600)",
	},
	totalVisits: {
		label: "Total Visits",
		color: "var(--color-brand-main-500)",
	},
	revenue: {
		label: "Revenue (₦)",
		color: "var(--color-brand-main-600)",
	},
	growthPercentage: {
		label: "Growth %",
		color: "var(--color-brand-main-700)",
	},
} satisfies ChartConfig;

// Status colors and icons
const getStatusConfig = (status: "Trending Up" | "Slipping" | "At Risk") => {
	switch (status) {
		case "Trending Up":
			return {
				icon: TrendingUp,
				color: "text-green-600",
				bgColor: "bg-green-100",
				badgeVariant: "default" as const,
			};
		case "Slipping":
			return {
				icon: TrendingDown,
				color: "text-yellow-600",
				bgColor: "bg-yellow-100",
				badgeVariant: "secondary" as const,
			};
		case "At Risk":
			return {
				icon: AlertTriangle,
				color: "text-red-600",
				bgColor: "bg-red-100",
				badgeVariant: "destructive" as const,
			};
	}
};

export function CustomerAnalyticsChart({
	topCustomersData,
	customerTrendsData,
	onCustomerClick,
}: CustomerAnalyticsChartProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("ranking");
	const [sortField, setSortField] = useState<SortField>("totalSpent");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Prepare data for ranking chart (top 10 for better visualization)
	const rankingChartData =
		topCustomersData?.customers.slice(0, 10).map((customer, index) => ({
			name: !customer.customerName
				? "No Name"
				: customer.customerName.length > 15
					? `${customer.customerName.substring(0, 15)}...`
					: customer.customerName,
			fullName: customer.customerName,
			customerId: customer.customerId,
			customerPhone: customer.customerPhone,
			totalSpent: customer.totalSpent,
			totalVisits: customer.totalVisits,
			averageTransactionValue: customer.averageTransactionValue,
			lastVisit: customer.lastVisit,
			rank: index + 1,
		})) || [];

	// Prepare data for trends chart
	const trendsChartData =
		customerTrendsData?.customers.map((customer) => ({
			customerName: customer.customerName,
			customerId: customer.customerId,
			status: customer.status,
			lastVisit: customer.lastVisit,
			trends: customer.trends,
		})) || [];

	// Sort table data (combine both datasets)
	const allCustomers = [
		...(topCustomersData?.customers || []),
		...(customerTrendsData?.customers.map((c) => ({
			customerId: c.customerId,
			customerName: c.customerName,
			customerPhone: "", // Not available in trends data
			totalSpent: c.trends.reduce((sum, t) => sum + t.revenue, 0),
			totalVisits: c.trends.length,
			averageTransactionValue:
				c.trends.reduce((sum, t) => sum + t.revenue, 0) / c.trends.length,
			lastVisit: c.lastVisit,
		})) || []),
	];

	// Remove duplicates based on customerId
	const uniqueCustomers = allCustomers.filter(
		(customer, index, self) =>
			index === self.findIndex((c) => c.customerId === customer.customerId),
	);

	const sortedCustomers = [...uniqueCustomers].sort((a, b) => {
		const aValue = a[sortField];
		const bValue = b[sortField];

		if (typeof aValue === "string" && typeof bValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		return sortDirection === "asc"
			? (aValue as number) - (bValue as number)
			: (bValue as number) - (aValue as number);
	});

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	// Custom tooltip for ranking chart
	const CustomRankingTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-brand-main-50 p-3 border rounded-lg shadow-lg'>
					<p className='font-semibold text-sm mb-2'>
						#{data.rank} {data.fullName}
					</p>
					<p className='text-xs text-gray-600 mb-2'>{data.customerPhone}</p>
					<div className='space-y-1'>
						<p className='text-sm'>
							<span className='font-medium'>Total Spent:</span> ₦
							{formatCurrency(data.totalSpent)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Total Visits:</span>{" "}
							{data.totalVisits.toLocaleString()}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Avg Transaction:</span> ₦
							{formatCurrency(data.averageTransactionValue)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Last Visit:</span>{" "}
							{new Date(data.lastVisit).toLocaleDateString()}
						</p>
					</div>
					{/* {onCustomerClick && (
						<p className='text-xs text-blue-600 mt-2'>Click to view details</p>
					)} */}
				</div>
			);
		}
		return null;
	};

	// Custom tooltip for trends chart
	const CustomTrendsTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className='bg-white p-3 border rounded-lg shadow-lg'>
					<p className='font-semibold text-sm mb-2'>{label}</p>
					<div className='space-y-1'>
						{payload.map((entry: any, index: number) => (
							<p
								key={index}
								className='text-sm'
								style={{ color: entry.color }}>
								<span className='font-medium'>{entry.name}:</span>{" "}
								{entry.dataKey === "revenue"
									? `₦${formatCurrency(entry.value)}`
									: `${entry.value.toFixed(1)}%`}
							</p>
						))}
					</div>
				</div>
			);
		}
		return null;
	};

	const handleBarClick = (data: any) => {
		if (onCustomerClick && data.customerId) {
			onCustomerClick(data.customerId);
		}
	};

	const SortButton = ({
		field,
		children,
	}: {
		field: SortField;
		children: React.ReactNode;
	}) => (
		<Button
			variant='ghost'
			size='sm'
			onClick={() => handleSort(field)}
			className='h-auto p-0 font-medium hover:bg-transparent'>
			<div className='flex items-center gap-1'>
				{children}
				<ArrowUpDown className='h-3 w-3' />
			</div>
		</Button>
	);

	// Calculate summary stats
	const totalCustomers = uniqueCustomers.length;
	const totalRevenue = uniqueCustomers.reduce(
		(sum, c) => sum + c.totalSpent,
		0,
	);
	const topCustomer = uniqueCustomers.length > 0 ? uniqueCustomers[0] : null;

	// Status distribution from trends data
	const statusCounts =
		customerTrendsData?.customers.reduce(
			(acc, customer) => {
				acc[customer.status] = (acc[customer.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		) || {};

	return (
		<Card className='w-full'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2'>
						<Users className='h-5 w-5' />
						Customer Analytics
					</CardTitle>
					<div className='flex items-center gap-2'>
						{/* View Mode Toggle */}
						<div className='flex items-center gap-1'>
							{topCustomersData && (
								<Button
									variant={viewMode === "ranking" ? "default" : "outline"}
									size='sm'
									onClick={() => setViewMode("ranking")}
									className='h-8'>
									<BarChart3 className='h-3 w-3 mr-1' />
									Ranking
								</Button>
							)}
							{customerTrendsData && (
								<Button
									variant={viewMode === "trends" ? "default" : "outline"}
									size='sm'
									onClick={() => setViewMode("trends")}
									className='h-8'>
									<LineChartIcon className='h-3 w-3 mr-1' />
									Trends
								</Button>
							)}
							<Button
								variant={viewMode === "table" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("table")}
								className='h-8'>
								<TableIcon className='h-3 w-3 mr-1' />
								Table
							</Button>
						</div>
					</div>
				</div>

				{/* Summary Stats */}
				<div className='flex items-center gap-4 text-sm text-gray-600 flex-wrap'>
					<div className='flex items-center gap-1'>
						<Badge variant='secondary'>{totalCustomers} customers</Badge>
					</div>
					<span>Total Revenue: ₦{formatCurrency(totalRevenue)}</span>
					{topCustomer && <span>Top Customer: {topCustomer.customerName}</span>}
					{/* Status indicators */}
					{Object.entries(statusCounts).map(([status, count]) => {
						const config = getStatusConfig(status as any);
						const Icon = config.icon;
						return (
							<div
								key={status}
								className='flex items-center gap-1'>
								<Icon className={`h-3 w-3 ${config.color}`} />
								<span>
									{status}: {count}
								</span>
							</div>
						);
					})}
				</div>
			</CardHeader>

			<CardContent>
				{totalCustomers === 0 ? (
					<div className='flex items-center justify-center h-64 text-gray-500'>
						<div className='text-center'>
							<Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
							<p>No customer analytics data available</p>
						</div>
					</div>
				) : viewMode === "ranking" && topCustomersData ? (
					<div className='space-y-6'>
						{/* Customer Ranking Chart */}
						<div className='h-[500px]'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<BarChart
										data={rankingChartData}
										margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											dataKey='name'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											angle={-45}
											textAnchor='end'
											height={80}
											interval={0}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											angle={-45}
											className='text-brand-main-600'
											tickFormatter={(value) => `₦${formatCurrency(value)}`}
										/>
										<ChartTooltip content={<CustomRankingTooltip />} />
										<Bar
											dataKey='totalSpent'
											fill='var(--color-brand-main-600)'
											radius={[4, 4, 0, 0]}
											onClick={handleBarClick}
											className='cursor-pointer hover:opacity-80'
										/>
									</BarChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>

						{/* Top 3 Customer Cards */}
						{topCustomersData.customers.length >= 3 && (
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{topCustomersData.customers
									.slice(0, 3)
									.map((customer, index) => (
										<Card
											key={customer.customerId}
											className={`cursor-pointer hover:shadow-md transition-shadow ${
												index === 0
													? "ring-2 ring-green-600"
													: index === 1
														? "ring-2 ring-yellow-600"
														: "ring-2 ring-brand-main-400"
											}`}
											onClick={() => onCustomerClick?.(customer.customerId)}>
											<CardContent className='p-4'>
												<div className='flex items-center justify-between mb-2'>
													<span className='font-semibold text-lg'>
														#{index + 1}
													</span>
													<Badge variant='secondary'>
														{customer.totalVisits} visits
													</Badge>
												</div>
												<h3 className='font-semibold text-lg mb-1'>
													{customer.customerName}
												</h3>
												<p className='text-sm text-gray-600 mb-3'>
													{customer.customerPhone}
												</p>
												<div className='space-y-2'>
													<div className='flex items-center justify-between'>
														<span className='text-sm text-gray-600'>
															Total Spent
														</span>
														<span className='font-medium'>
															₦{formatCurrency(customer.totalSpent)}
														</span>
													</div>
													<div className='flex items-center justify-between'>
														<span className='text-sm text-gray-600'>
															Avg Transaction
														</span>
														<span className='font-medium'>
															₦
															{formatCurrency(customer.averageTransactionValue)}
														</span>
													</div>
													<div className='flex items-center justify-between'>
														<span className='text-sm text-gray-600'>
															Last Visit
														</span>
														<span className='font-medium'>
															{new Date(
																customer.lastVisit,
															).toLocaleDateString()}
														</span>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
							</div>
						)}
					</div>
				) : viewMode === "trends" && customerTrendsData ? (
					<div className='space-y-6'>
						{/* Customer Status Overview */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{Object.entries(statusCounts).map(([status, count]) => {
								const config = getStatusConfig(status as any);
								const Icon = config.icon;
								return (
									<Card key={status}>
										<CardContent className='p-4'>
											<div className='flex items-center justify-between'>
												<div>
													<p className='text-sm font-medium text-gray-600'>
														{status}
													</p>
													<p className='text-2xl font-bold'>{count}</p>
												</div>
												<div className={`p-2 rounded-full ${config.bgColor}`}>
													<Icon className={`h-6 w-6 ${config.color}`} />
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{/* Customer Trends Chart */}
						<div className='h-80'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<LineChart
										data={trendsChartData[0]?.trends || []}
										margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											dataKey='period'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
										/>
										<YAxis
											yAxisId='revenue'
											orientation='left'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											tickFormatter={(value) => `₦${formatCurrency(value)}`}
										/>
										<YAxis
											yAxisId='growth'
											orientation='right'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											tickFormatter={(value) => `${value}%`}
										/>
										<ChartTooltip content={<CustomTrendsTooltip />} />
										{trendsChartData.slice(0, 5).map((customer, index) => (
											<Line
												key={customer.customerId}
												yAxisId='revenue'
												type='monotone'
												dataKey='revenue'
												data={customer.trends}
												stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
												strokeWidth={2}
												dot={{
													fill: `hsl(${(index * 60) % 360}, 70%, 50%)`,
													strokeWidth: 2,
													r: 4,
												}}
												name={customer.customerName}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>

						{/* Customer Status List */}
						<div className='space-y-3'>
							<h4 className='font-medium'>Customer Status Details</h4>
							<div className='space-y-2 max-h-60 overflow-y-auto'>
								{customerTrendsData.customers.map((customer) => {
									const config = getStatusConfig(customer.status);
									const Icon = config.icon;
									const latestTrend =
										customer.trends[customer.trends.length - 1];
									return (
										<div
											key={customer.customerId}
											className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer'
											onClick={() => onCustomerClick?.(customer.customerId)}>
											<div className='flex items-center gap-3'>
												<div className={`p-1 rounded-full ${config.bgColor}`}>
													<Icon className={`h-4 w-4 ${config.color}`} />
												</div>
												<div>
													<p className='font-medium'>{customer.customerName}</p>
													<p className='text-sm text-gray-600'>
														Last visit:{" "}
														{new Date(customer.lastVisit).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div className='text-right'>
												<Badge variant={config.badgeVariant}>
													{customer.status}
												</Badge>
												{latestTrend && (
													<p className='text-sm text-gray-600 mt-1'>
														{latestTrend.growthPercentage > 0 ? "+" : ""}
														{latestTrend.growthPercentage.toFixed(1)}%
													</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				) : (
					// Customer Table
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<SortButton field='customerName'>Customer</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='totalSpent'>Total Spent</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='totalVisits'>Visits</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='averageTransactionValue'>
											Avg Transaction
										</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='lastVisit'>Last Visit</SortButton>
									</TableHead>
									{customerTrendsData && <TableHead>Status</TableHead>}
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedCustomers.map((customer, index) => {
									const trendCustomer = customerTrendsData?.customers.find(
										(c) => c.customerId === customer.customerId,
									);
									return (
										<TableRow
											key={customer.customerId}
											className='cursor-pointer hover:bg-gray-50'
											onClick={() => onCustomerClick?.(customer.customerId)}>
											<TableCell>
												<div>
													<div className='font-medium'>
														{customer.customerName}
													</div>
													{customer.customerPhone && (
														<div className='text-sm text-gray-600'>
															{customer.customerPhone}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell className='text-right font-medium'>
												₦{formatCurrency(customer.totalSpent)}
											</TableCell>
											<TableCell className='text-right'>
												{customer.totalVisits.toLocaleString()}
											</TableCell>
											<TableCell className='text-right'>
												₦{formatCurrency(customer.averageTransactionValue)}
											</TableCell>
											<TableCell className='text-right'>
												{new Date(customer.lastVisit).toLocaleDateString()}
											</TableCell>

											{customerTrendsData && (
												<TableCell>
													{trendCustomer ? (
														<Badge
															variant={
																getStatusConfig(trendCustomer.status)
																	.badgeVariant
															}>
															{trendCustomer.status}
														</Badge>
													) : (
														<span className='text-gray-400'>-</span>
													)}
												</TableCell>
											)}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
