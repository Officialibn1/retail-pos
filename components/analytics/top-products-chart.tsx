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
import { formatCurrency } from "@/lib/utils";
import { TopProductsResult } from "@/lib/types";
import { TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react";

interface TopProductsChartProps {
	data: TopProductsResult;
	onProductClick?: (productId: string) => void;
}

type ViewMode = "revenue" | "volume";
type ChartType = "bar" | "trend";

const chartConfig = {
	revenue: {
		label: "Revenue (₦)",
		color: "var(--color-brand-main-600)",
	},
	quantity: {
		label: "Units Sold",
		color: "var(--color-brand-main-500)",
	},
	totalRevenue: {
		label: "Total Revenue (₦)",
		color: "var(--color-brand-main-600)",
	},
	unitsSold: {
		label: "Units Sold",
		color: "var(--color-brand-main-500)",
	},
} satisfies ChartConfig;

export function TopProductsChart({
	data,
	onProductClick,
}: TopProductsChartProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("revenue");
	const [chartType, setChartType] = useState<ChartType>("bar");

	// Prepare data for bar chart
	const barChartData = data.products.map((product) => ({
		name:
			product.productName.length > 15
				? `${product.productName.substring(0, 15)}...`
				: product.productName,
		fullName: product.productName,
		productId: product.productId,
		sku: product.sku,
		categoryName: product.categoryName,
		totalRevenue: product.totalRevenue,
		unitsSold: product.unitsSold,
		averageSellingPrice: product.averageSellingPrice,
	}));

	// Custom tooltip for bar chart
	const CustomBarTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-white p-3 border rounded-lg shadow-lg'>
					<p className='font-semibold text-sm'>{data.fullName}</p>
					<p className='text-xs text-gray-600 mb-2'>SKU: {data.sku}</p>
					<p className='text-xs text-gray-600 mb-2'>
						Category: {data.categoryName}
					</p>
					<div className='space-y-1'>
						<p className='text-sm'>
							<span className='font-medium'>Revenue:</span> ₦
							{formatCurrency(data.totalRevenue)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Units Sold:</span>{" "}
							{data.unitsSold.toLocaleString()}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Avg Price:</span> ₦
							{formatCurrency(data.averageSellingPrice)}
						</p>
					</div>
					{onProductClick && (
						<p className='text-xs text-blue-600 mt-2'>Click to view details</p>
					)}
				</div>
			);
		}
		return null;
	};

	// Custom tooltip for trend chart
	const CustomTrendTooltip = ({ active, payload, label }: any) => {
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
									: entry.value.toLocaleString()}
							</p>
						))}
					</div>
				</div>
			);
		}
		return null;
	};

	const handleBarClick = (data: any) => {
		if (onProductClick && data.productId) {
			onProductClick(data.productId);
		}
	};

	return (
		<Card className='w-full'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2'>
						<Package className='h-5 w-5' />
						Top Performing Products
					</CardTitle>
					<div className='flex items-center gap-2'>
						{/* View Mode Toggle */}
						<div className='flex items-center gap-1'>
							<Button
								variant={viewMode === "revenue" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("revenue")}
								className='h-8'>
								<DollarSign className='h-3 w-3 mr-1' />
								Revenue
							</Button>
							<Button
								variant={viewMode === "volume" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("volume")}
								className='h-8'>
								<Package className='h-3 w-3 mr-1' />
								Volume
							</Button>
						</div>

						{/* Chart Type Toggle */}
						{data.trendData && data.trendData.length > 0 && (
							<div className='flex items-center gap-1'>
								<Button
									variant={chartType === "bar" ? "default" : "outline"}
									size='sm'
									onClick={() => setChartType("bar")}
									className='h-8'>
									<BarChart3 className='h-3 w-3 mr-1' />
									Bar
								</Button>
								<Button
									variant={chartType === "trend" ? "default" : "outline"}
									size='sm'
									onClick={() => setChartType("trend")}
									className='h-8'>
									<TrendingUp className='h-3 w-3 mr-1' />
									Trend
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Summary Stats */}
				<div className='flex items-center gap-4 text-sm text-gray-600'>
					<div className='flex items-center gap-1'>
						<Badge variant='secondary'>{data.products.length} products</Badge>
					</div>
					{data.products.length > 0 && (
						<div className='flex items-center gap-4'>
							<span>
								Top Revenue: ₦
								{formatCurrency(data.products[0]?.totalRevenue || 0)}
							</span>
							<span>
								Top Volume:{" "}
								{Math.max(
									...data.products.map((p) => p.unitsSold),
								).toLocaleString()}{" "}
								units
							</span>
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent>
				{data.products.length === 0 ? (
					<div className='flex items-center justify-center h-64 text-gray-500'>
						<div className='text-center'>
							<Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
							<p>No product data available</p>
						</div>
					</div>
				) : chartType === "bar" ? (
					<div className='h-96'>
						<ChartContainer config={chartConfig}>
							<ResponsiveContainer
								width='100%'
								height='100%'>
								<BarChart
									data={barChartData}
									margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
										tickFormatter={(value) =>
											viewMode === "revenue"
												? `₦${formatCurrency(value)}`
												: value.toLocaleString()
										}
									/>
									<ChartTooltip content={<CustomBarTooltip />} />
									<Bar
										dataKey={
											viewMode === "revenue" ? "totalRevenue" : "unitsSold"
										}
										fill={
											viewMode === "revenue"
												? "var(--color-brand-main-600)"
												: "var(--color-brand-main-500)"
										}
										radius={[4, 4, 0, 0]}
										onClick={handleBarClick}
										className='cursor-pointer hover:opacity-80'
									/>
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</div>
				) : (
					// Trend Chart
					data.trendData &&
					data.trendData.length > 0 && (
						<div className='h-80'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<LineChart
										data={data.trendData}
										margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											dataKey='date'
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
											yAxisId='quantity'
											orientation='right'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											tickFormatter={(value) => value.toLocaleString()}
										/>
										<ChartTooltip content={<CustomTrendTooltip />} />
										<Line
											yAxisId='revenue'
											type='monotone'
											dataKey='revenue'
											stroke='var(--color-brand-main-600)'
											strokeWidth={2}
											dot={{
												fill: "var(--color-brand-main-600)",
												strokeWidth: 2,
												r: 4,
											}}
											name='Revenue'
										/>
										<Line
											yAxisId='quantity'
											type='monotone'
											dataKey='quantity'
											stroke='var(--color-brand-main-500)'
											strokeWidth={2}
											dot={{
												fill: "var(--color-brand-main-500)",
												strokeWidth: 2,
												r: 4,
											}}
											name='Quantity'
										/>
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					)
				)}
			</CardContent>
		</Card>
	);
}
