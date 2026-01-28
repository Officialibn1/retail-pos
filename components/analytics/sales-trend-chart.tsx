"use client";

import { useState } from "react";
import {
	AreaChart,
	Area,
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
import { formatCurrency } from "@/lib/utils";
import { SalesTrendResult } from "@/lib/types";
import {
	TrendingUp,
	DollarSign,
	ShoppingCart,
	BarChart3,
	Calendar,
} from "lucide-react";

interface SalesTrendChartProps {
	data: SalesTrendResult;
	interval?: "hourly" | "daily" | "weekly";
	onIntervalChange?: (interval: "hourly" | "daily" | "weekly") => void;
}

type ChartType = "area" | "line";

const chartConfig = {
	totalRevenue: {
		label: "Revenue (₦)",
		color: "var(--color-brand-main-600)",
	},
	transactionCount: {
		label: "Transactions",
		color: "var(--color-brand-main-500)",
	},
	averageTransactionValue: {
		label: "Avg Transaction (₦)",
		color: "var(--color-brand-main-700)",
	},
	totalDiscounts: {
		label: "Discounts (₦)",
		color: "#EF4444",
	},
	totalTax: {
		label: "Tax (₦)",
		color: "#10B981",
	},
} satisfies ChartConfig;

export function SalesTrendChart({
	data,
	interval = "daily",
	onIntervalChange,
}: SalesTrendChartProps) {
	const [chartType, setChartType] = useState<ChartType>("area");

	// Format date labels based on interval
	const formatDateLabel = (dateString: string) => {
		const date = new Date(dateString);
		switch (interval) {
			case "hourly":
				return date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				});
			case "weekly":
				return `Week of ${date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				})}`;
			case "daily":
			default:
				return date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});
		}
	};

	// Prepare chart data with formatted dates
	const chartData = data.trends.map((trend) => ({
		...trend,
		formattedDate: formatDateLabel(trend.date),
		originalDate: trend.date,
	}));

	// Custom tooltip
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-white p-3 border rounded-lg shadow-lg'>
					<p className='font-semibold text-sm mb-2'>{label}</p>
					<div className='space-y-1'>
						<p className='text-sm'>
							<span className='font-medium'>Revenue:</span> ₦
							{formatCurrency(data.totalRevenue)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Transactions:</span>{" "}
							{data.transactionCount.toLocaleString()}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Avg Transaction:</span> ₦
							{formatCurrency(data.averageTransactionValue)}
						</p>
						{data.totalDiscounts > 0 && (
							<p className='text-sm'>
								<span className='font-medium'>Discounts:</span> ₦
								{formatCurrency(data.totalDiscounts)}
							</p>
						)}
						{data.totalTax > 0 && (
							<p className='text-sm'>
								<span className='font-medium'>Tax:</span> ₦
								{formatCurrency(data.totalTax)}
							</p>
						)}
					</div>
				</div>
			);
		}
		return null;
	};

	// KPI Cards Component
	const KPICards = () => (
		<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
			<Card>
				<CardContent className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-medium text-gray-600'>Total Revenue</p>
							<p className='text-2xl font-bold text-brand-main-600'>
								₦{formatCurrency(data.kpis.totalGrossRevenue)}
							</p>
						</div>
						<DollarSign className='h-8 w-8 text-brand-main-600' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-medium text-gray-600'>
								Avg Order Value
							</p>
							<p className='text-2xl font-bold text-brand-main-600'>
								₦{formatCurrency(data.kpis.averageOrderValue)}
							</p>
						</div>
						<ShoppingCart className='h-8 w-8 text-brand-main-600' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-medium text-gray-600'>
								Total Discounts
							</p>
							<p className='text-2xl font-bold text-red-600'>
								₦{formatCurrency(data.kpis.totalDiscounts)}
							</p>
						</div>
						<TrendingUp className='h-8 w-8 text-red-600' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-medium text-gray-600'>Total Tax</p>
							<p className='text-2xl font-bold text-green-600'>
								₦{formatCurrency(data.kpis.totalTax)}
							</p>
						</div>
						<Calendar className='h-8 w-8 text-green-600' />
					</div>
				</CardContent>
			</Card>
		</div>
	);

	return (
		<div className='w-full space-y-6'>
			{/* KPI Cards */}
			<KPICards />

			{/* Main Chart Card */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center gap-2'>
							<TrendingUp className='h-5 w-5' />
							Sales Trends
						</CardTitle>
						<div className='flex items-center gap-2'>
							{/* Interval Toggle */}
							{onIntervalChange && (
								<div className='flex items-center gap-1'>
									<Button
										variant={interval === "hourly" ? "default" : "outline"}
										size='sm'
										onClick={() => onIntervalChange("hourly")}
										className='h-8'>
										Hourly
									</Button>
									<Button
										variant={interval === "daily" ? "default" : "outline"}
										size='sm'
										onClick={() => onIntervalChange("daily")}
										className='h-8'>
										Daily
									</Button>
									<Button
										variant={interval === "weekly" ? "default" : "outline"}
										size='sm'
										onClick={() => onIntervalChange("weekly")}
										className='h-8'>
										Weekly
									</Button>
								</div>
							)}

							{/* Chart Type Toggle */}
							<div className='flex items-center gap-1'>
								<Button
									variant={chartType === "area" ? "default" : "outline"}
									size='sm'
									onClick={() => setChartType("area")}
									className='h-8'>
									<BarChart3 className='h-3 w-3 mr-1' />
									Area
								</Button>
								<Button
									variant={chartType === "line" ? "default" : "outline"}
									size='sm'
									onClick={() => setChartType("line")}
									className='h-8'>
									<TrendingUp className='h-3 w-3 mr-1' />
									Line
								</Button>
							</div>
						</div>
					</div>

					{/* Summary Stats */}
					<div className='flex items-center gap-4 text-sm text-gray-600'>
						<div className='flex items-center gap-1'>
							<Badge variant='secondary'>
								{data.trends.length} data points
							</Badge>
						</div>
						{data.trends.length > 0 && (
							<div className='flex items-center gap-4'>
								<span>
									Peak Revenue: ₦
									{formatCurrency(
										Math.max(...data.trends.map((t) => t.totalRevenue)),
									)}
								</span>
								<span>
									Peak Transactions:{" "}
									{Math.max(
										...data.trends.map((t) => t.transactionCount),
									).toLocaleString()}
								</span>
							</div>
						)}
					</div>
				</CardHeader>

				<CardContent>
					{data.trends.length === 0 ? (
						<div className='flex items-center justify-center h-64 text-gray-500'>
							<div className='text-center'>
								<TrendingUp className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No sales trend data available</p>
							</div>
						</div>
					) : chartType === "area" ? (
						<div className='h-80'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<AreaChart
										data={chartData}
										margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
										<defs>
											<linearGradient
												id='revenueGradient'
												x1='0'
												y1='0'
												x2='0'
												y2='1'>
												<stop
													offset='5%'
													stopColor='var(--color-brand-main-600)'
													stopOpacity={0.8}
												/>
												<stop
													offset='95%'
													stopColor='var(--color-brand-main-600)'
													stopOpacity={0.1}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											dataKey='formattedDate'
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
											yAxisId='count'
											orientation='right'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											tickFormatter={(value) => value.toLocaleString()}
										/>
										<ChartTooltip content={<CustomTooltip />} />
										<Area
											yAxisId='revenue'
											type='monotone'
											dataKey='totalRevenue'
											stroke='var(--color-brand-main-600)'
											strokeWidth={2}
											fill='url(#revenueGradient)'
										/>
										<Line
											yAxisId='count'
											type='monotone'
											dataKey='transactionCount'
											stroke='var(--color-brand-main-500)'
											strokeWidth={2}
											dot={{
												fill: "var(--color-brand-main-500)",
												strokeWidth: 2,
												r: 4,
											}}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					) : (
						<div className='h-80'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<LineChart
										data={chartData}
										margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											dataKey='formattedDate'
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
											yAxisId='count'
											orientation='right'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											tickFormatter={(value) => value.toLocaleString()}
										/>
										<ChartTooltip content={<CustomTooltip />} />
										<Line
											yAxisId='revenue'
											type='monotone'
											dataKey='totalRevenue'
											stroke='var(--color-brand-main-600)'
											strokeWidth={3}
											dot={{
												fill: "var(--color-brand-main-600)",
												strokeWidth: 2,
												r: 5,
											}}
										/>
										<Line
											yAxisId='count'
											type='monotone'
											dataKey='transactionCount'
											stroke='var(--color-brand-main-500)'
											strokeWidth={2}
											dot={{
												fill: "var(--color-brand-main-500)",
												strokeWidth: 2,
												r: 4,
											}}
										/>
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
