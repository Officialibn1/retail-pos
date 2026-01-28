"use client";

import { useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
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
import { CashierPerformanceResult, UserRole } from "@/lib/types";
import {
	Users,
	Trophy,
	ArrowUpDown,
	BarChart3,
	Table as TableIcon,
} from "lucide-react";

interface CashierPerformanceChartProps {
	data: CashierPerformanceResult;
	onCashierClick?: (userId: string) => void;
}

type ViewMode = "chart" | "table";
type SortField =
	| "userName"
	| "totalRevenue"
	| "transactionCount"
	| "averageTransactionValue"
	| "revenuePerHour";
type SortDirection = "asc" | "desc";

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
} satisfies ChartConfig;

// Role colors for badges
const getRoleColor = (role: UserRole) => {
	switch (role) {
		case "SUPERADMIN":
			return "bg-purple-100 text-purple-800";
		case "ADMIN":
			return "bg-blue-100 text-blue-800";
		case "MANAGER":
			return "bg-green-100 text-green-800";
		case "CASHIER":
			return "bg-gray-100 text-gray-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

export function CashierPerformanceChart({
	data,
	onCashierClick,
}: CashierPerformanceChartProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("chart");
	const [sortField, setSortField] = useState<SortField>("totalRevenue");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Prepare data for bar chart (top 10 for better visualization)
	const chartData = data.cashiers.slice(0, 10).map((cashier, index) => ({
		name:
			cashier.userName.length > 12
				? `${cashier.userName.substring(0, 12)}...`
				: cashier.userName,
		fullName: cashier.userName,
		userId: cashier.userId,
		roles: cashier.roles,
		totalRevenue: cashier.totalRevenue,
		transactionCount: cashier.transactionCount,
		averageTransactionValue: cashier.averageTransactionValue,
		revenuePerHour: cashier.shiftInfo?.revenuePerHour || 0,
		totalHours: cashier.shiftInfo?.totalHours || 0,
		rank: index + 1,
	}));

	// Sort table data
	const sortedCashiers = [...data.cashiers].sort((a, b) => {
		let aValue: any;
		let bValue: any;

		switch (sortField) {
			case "userName":
				aValue = a.userName;
				bValue = b.userName;
				break;
			case "revenuePerHour":
				aValue = a.shiftInfo?.revenuePerHour || 0;
				bValue = b.shiftInfo?.revenuePerHour || 0;
				break;
			default:
				aValue = a[sortField];
				bValue = b[sortField];
		}

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

	// Custom tooltip for bar chart
	const CustomBarTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;

			return (
				<div className='bg-white p-3 border rounded-lg shadow-lg'>
					<div className='flex items-center gap-2 mb-2'>
						<Trophy className='h-4 w-4 text-yellow-500' />
						<p className='font-semibold text-sm'>
							#{data.rank} {data.fullName}
						</p>
					</div>
					<div className='flex items-center gap-1 mb-2'>
						{data.roles.map((role: UserRole, index: number) => (
							<Badge
								key={index}
								className={getRoleColor(role)}
								variant='secondary'>
								{role}
							</Badge>
						))}
					</div>
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
						{data.totalHours > 0 && (
							<>
								<p className='text-sm'>
									<span className='font-medium'>Hours Worked:</span>{" "}
									{data.totalHours.toFixed(1)}h
								</p>
								<p className='text-sm'>
									<span className='font-medium'>Revenue/Hour:</span> ₦
									{formatCurrency(data.revenuePerHour)}
								</p>
							</>
						)}
					</div>
					{onCashierClick && (
						<p className='text-xs text-blue-600 mt-2'>Click to view details</p>
					)}
				</div>
			);
		}
		return null;
	};

	const handleBarClick = (data: any) => {
		if (onCashierClick && data.userId) {
			onCashierClick(data.userId);
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
	const totalRevenue = data.cashiers.reduce(
		(sum, c) => sum + c.totalRevenue,
		0,
	);
	const totalTransactions = data.cashiers.reduce(
		(sum, c) => sum + c.transactionCount,
		0,
	);
	const topPerformer = data.cashiers.length > 0 ? data.cashiers[0] : null;

	return (
		<Card className='w-full'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2'>
						<Users className='h-5 w-5' />
						Cashier Performance Leaderboard
					</CardTitle>
					<div className='flex items-center gap-2'>
						{/* View Mode Toggle */}
						<div className='flex items-center gap-1'>
							<Button
								variant={viewMode === "chart" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("chart")}
								className='h-8'>
								<BarChart3 className='h-3 w-3 mr-1' />
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
						<Badge variant='secondary'>{data.cashiers.length} cashiers</Badge>
					</div>
					<span>Total Revenue: ₦{formatCurrency(totalRevenue)}</span>
					<span>Total Transactions: {totalTransactions.toLocaleString()}</span>
					{topPerformer && <span>Top Performer: {topPerformer.userName}</span>}
				</div>
			</CardHeader>

			<CardContent>
				{data.cashiers.length === 0 ? (
					<div className='flex items-center justify-center h-64 text-gray-500'>
						<div className='text-center'>
							<Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
							<p>No cashier performance data available</p>
						</div>
					</div>
				) : viewMode === "chart" ? (
					<div className='space-y-6'>
						{/* Leaderboard Chart */}
						<div className='h-96'>
							<ChartContainer config={chartConfig}>
								<ResponsiveContainer
									width='100%'
									height='100%'>
									<BarChart
										data={chartData}
										layout='horizontal'
										margin={{ top: 20, right: 50, left: 120, bottom: 20 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											type='number'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											tickFormatter={(value) => `₦${formatCurrency(value)}`}
										/>
										<YAxis
											type='category'
											dataKey='name'
											tickLine={false}
											axisLine={false}
											className='text-brand-main-600'
											width={110}
										/>
										<ChartTooltip content={<CustomBarTooltip />} />
										<Bar
											dataKey='totalRevenue'
											fill='var(--color-brand-main-600)'
											radius={[0, 4, 4, 0]}
											onClick={handleBarClick}
											className='cursor-pointer hover:opacity-80'
										/>
									</BarChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>

						{/* Top 3 Performance Cards */}
						{data.cashiers.length >= 3 && (
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{data.cashiers.slice(0, 3).map((cashier, index) => (
									<Card
										key={cashier.userId}
										className={`cursor-pointer hover:shadow-md transition-shadow ${
											index === 0 ? "ring-2 ring-yellow-400" : ""
										}`}
										onClick={() => onCashierClick?.(cashier.userId)}>
										<CardContent className='p-4'>
											<div className='flex items-center justify-between mb-2'>
												<div className='flex items-center gap-2'>
													{index === 0 && (
														<Trophy className='h-5 w-5 text-yellow-500' />
													)}
													{index === 1 && (
														<Trophy className='h-5 w-5 text-gray-400' />
													)}
													{index === 2 && (
														<Trophy className='h-5 w-5 text-amber-600' />
													)}
													<span className='font-semibold text-lg'>
														#{index + 1}
													</span>
												</div>
												{/* {cashier.roles.map((role) => (
													<Badge
														className={getRoleColor(role)}
														variant='secondary'>
														{role}
													</Badge>
												))} */}
												<div className='flex items-center gap-1'>
													{cashier.roles.map((role, roleIndex) => (
														<Badge
															key={roleIndex}
															className={getRoleColor(role)}
															variant='secondary'>
															{role}
														</Badge>
													))}
												</div>
											</div>
											<h3 className='font-semibold text-lg mb-2'>
												{cashier.userName}
											</h3>
											<div className='space-y-2'>
												<div className='flex items-center justify-between'>
													<span className='text-sm text-gray-600'>Revenue</span>
													<span className='font-medium'>
														₦{formatCurrency(cashier.totalRevenue)}
													</span>
												</div>
												<div className='flex items-center justify-between'>
													<span className='text-sm text-gray-600'>
														Transactions
													</span>
													<span className='font-medium'>
														{cashier.transactionCount.toLocaleString()}
													</span>
												</div>
												<div className='flex items-center justify-between'>
													<span className='text-sm text-gray-600'>
														Avg Transaction
													</span>
													<span className='font-medium'>
														₦{formatCurrency(cashier.averageTransactionValue)}
													</span>
												</div>
												{cashier.shiftInfo && (
													<div className='flex items-center justify-between'>
														<span className='text-sm text-gray-600'>
															Revenue/Hour
														</span>
														<span className='font-medium'>
															₦
															{formatCurrency(cashier.shiftInfo.revenuePerHour)}
														</span>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				) : (
					// Performance Table
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='w-12'>#</TableHead>
									<TableHead>
										<SortButton field='userName'>Cashier</SortButton>
									</TableHead>
									<TableHead>Roles</TableHead>
									<TableHead className='text-right'>
										<SortButton field='totalRevenue'>Revenue</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='transactionCount'>
											Transactions
										</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='averageTransactionValue'>
											Avg Transaction
										</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='revenuePerHour'>Revenue/Hour</SortButton>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedCashiers.map((cashier, index) => (
									<TableRow
										key={cashier.userId}
										className='cursor-pointer hover:bg-gray-50'
										onClick={() => onCashierClick?.(cashier.userId)}>
										<TableCell>
											<div className='flex items-center gap-1'>
												{index < 3 && (
													<Trophy className='h-4 w-4 text-yellow-500' />
												)}
												<span className='font-medium'>#{index + 1}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className='font-medium'>{cashier.userName}</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1'>
												{cashier.roles.map((role, roleIndex) => (
													<Badge
														key={roleIndex}
														className={getRoleColor(role)}
														variant='secondary'>
														{role}
													</Badge>
												))}
											</div>
										</TableCell>
										<TableCell className='text-right font-medium'>
											₦{formatCurrency(cashier.totalRevenue)}
										</TableCell>
										<TableCell className='text-right'>
											{cashier.transactionCount.toLocaleString()}
										</TableCell>
										<TableCell className='text-right'>
											₦{formatCurrency(cashier.averageTransactionValue)}
										</TableCell>
										<TableCell className='text-right'>
											{cashier.shiftInfo ? (
												<div>
													<div>
														₦{formatCurrency(cashier.shiftInfo.revenuePerHour)}
													</div>
													<div className='text-xs text-gray-500'>
														{cashier.shiftInfo.totalHours.toFixed(1)}h worked
													</div>
												</div>
											) : (
												<span className='text-gray-400'>-</span>
											)}
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
