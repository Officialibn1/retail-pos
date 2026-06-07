"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { CategoryRevenueResult } from "@/lib/types";
import {
	PieChart as PieChartIcon,
	Table as TableIcon,
	ArrowUpDown,
} from "lucide-react";

interface CategoryRevenueChartProps {
	data: CategoryRevenueResult;
	onCategoryClick?: (categoryId: string) => void;
}

type ViewMode = "chart" | "table";
type SortField =
	| "categoryName"
	| "totalRevenue"
	| "totalSalesCount"
	| "percentageOfTotal";
type SortDirection = "asc" | "desc";

const chartConfig = {
	revenue: {
		label: "Revenue",
		color: "var(--color-brand-main-600)",
	},
} satisfies ChartConfig;

// Color palette for categories
const COLORS = [
	"var(--color-brand-main-600)",
	"var(--color-brand-main-500)",
	"var(--color-brand-main-700)",
	"var(--color-brand-main-400)",
	"var(--color-brand-main-800)",
	"#8B5CF6", // Purple
	"#06B6D4", // Cyan
	"#10B981", // Emerald
	"#F59E0B", // Amber
	"#EF4444", // Red
];

export function CategoryRevenueChart({
	data,
	onCategoryClick,
}: CategoryRevenueChartProps) {
	const c = useCurrencySymbol();
	const [viewMode, setViewMode] = useState<ViewMode>("chart");
	const [sortField, setSortField] = useState<SortField>("totalRevenue");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Prepare data for pie chart
	const pieChartData = data.categories.map((category, index) => ({
		name: category.categoryName,
		value: category.totalRevenue,
		percentage: category.percentageOfTotal,
		categoryId: category.categoryId,
		totalSalesCount: category.totalSalesCount,
		color: COLORS[index % COLORS.length],
	}));

	// Sort table data
	const sortedCategories = [...data.categories].sort((a, b) => {
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

	// Custom tooltip for pie chart
	const CustomPieTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-brand-main-50 p-3 border rounded-lg shadow-lg'>
					<p className='font-semibold text-sm mb-2'>{data.name}</p>
					<div className='space-y-1'>
						<p className='text-sm'>
							<span className='font-medium'>Revenue:</span> {c}
							{formatCurrency(data.value)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Percentage:</span>{" "}
							{data.percentage.toFixed(1)}%
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Sales Count:</span>{" "}
							{data.totalSalesCount.toLocaleString()}
						</p>
					</div>
					{/* {onCategoryClick && (
						<p className='text-xs text-blue-600 mt-2'>Click to view details</p>
					)} */}
				</div>
			);
		}
		return null;
	};

	const handlePieClick = (data: any) => {
		if (onCategoryClick && data.categoryId) {
			onCategoryClick(data.categoryId);
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

	return (
		<Card className='w-full'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2'>
						<PieChartIcon className='h-5 w-5' />
						Revenue by Category
					</CardTitle>
					<div className='flex items-center gap-2'>
						{/* View Mode Toggle */}
						<div className='flex items-center gap-1'>
							<Button
								variant={viewMode === "chart" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("chart")}
								className='h-8'>
								<PieChartIcon className='h-3 w-3 mr-1' />
								Chart
							</Button>
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
				<div className='flex items-center gap-4 text-sm text-gray-600'>
					<div className='flex items-center gap-1'>
						<Badge variant='secondary'>
							{data.categories.length} categories
						</Badge>
					</div>
					<span>Total Revenue: {c}{formatCurrency(data.totalRevenue)}</span>
					{data.categories.length > 0 && (
						<span>
							Top Category:{" "}
							{
								data.categories.reduce((prev, current) =>
									prev.totalRevenue > current.totalRevenue ? prev : current,
								).categoryName
							}
						</span>
					)}
				</div>
			</CardHeader>

			<CardContent>
				{data.categories.length === 0 ? (
					<div className='flex items-center justify-center h-64 text-gray-500'>
						<div className='text-center'>
							<PieChartIcon className='h-12 w-12 mx-auto mb-4 opacity-50' />
							<p>No category data available</p>
						</div>
					</div>
				) : viewMode === "chart" ? (
					<div className='flex flex-col lg:flex-row items-center gap-8'>
						{/* Donut Chart */}
						<div className='flex-1 h-80'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<PieChart>
										<Pie
											data={pieChartData}
											cx='50%'
											cy='50%'
											innerRadius={60}
											outerRadius={120}
											paddingAngle={2}
											dataKey='value'
											onClick={handlePieClick}
											className='cursor-pointer'>
											{pieChartData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={entry.color}
													className='hover:opacity-80'
												/>
											))}
										</Pie>
										<ChartTooltip content={<CustomPieTooltip />} />
									</PieChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>

						{/* Legend */}
						<div className='flex-1 max-w-sm'>
							<h4 className='font-medium mb-4'>Categories</h4>
							<div className='space-y-3 max-h-80 overflow-y-auto'>
								{pieChartData.map((category, index) => (
									<div
										key={category.categoryId}
										className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer'
										onClick={() => onCategoryClick?.(category.categoryId)}>
										<div className='flex items-center gap-3'>
											<div
												className='w-4 h-4 rounded-full'
												style={{ backgroundColor: category.color }}
											/>
											<div>
												<p className='font-medium text-sm'>{category.name}</p>
												<p className='text-xs text-gray-600'>
													{category.totalSalesCount} sales
												</p>
											</div>
										</div>
										<div className='text-right'>
											<p className='font-medium text-sm'>
												{c}{formatCurrency(category.value)}
											</p>
											<p className='text-xs text-gray-600'>
												{category.percentage.toFixed(1)}%
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				) : (
					// Data Table
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<SortButton field='categoryName'>Category</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='totalRevenue'>Revenue</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='percentageOfTotal'>
											Percentage
										</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='totalSalesCount'>Sales Count</SortButton>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedCategories.map((category, index) => (
									<TableRow
										key={category.categoryId}
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => onCategoryClick?.(category.categoryId)}>
										<TableCell>
											<div className='flex items-center gap-3'>
												<div
													className='w-3 h-3 rounded-full'
													style={{
														backgroundColor: COLORS[index % COLORS.length],
													}}
												/>
												<span className='font-medium'>
													{category.categoryName}
												</span>
											</div>
										</TableCell>
										<TableCell className='text-right font-medium'>
											{c}{formatCurrency(category.totalRevenue)}
										</TableCell>
										<TableCell className='text-right'>
											<Badge variant='secondary'>
												{category.percentageOfTotal.toFixed(1)}%
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											{category.totalSalesCount.toLocaleString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
