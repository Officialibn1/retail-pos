"use client";

import { useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	LabelList,
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
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { PaymentBreakdownResult, PaymentMethod } from "@/lib/types";
import {
	CreditCard,
	Banknote,
	Smartphone,
	Building2,
	BarChart3,
	Table as TableIcon,
	ArrowUpDown,
} from "lucide-react";

interface PaymentMethodChartProps {
	data: PaymentBreakdownResult;
	onPaymentMethodClick?: (method: PaymentMethod) => void;
}

type ViewMode = "chart" | "table";
type SortField =
	| "method"
	| "totalAmount"
	| "transactionCount"
	| "percentageOfTotal";
type SortDirection = "asc" | "desc";
type MetricType = "amount" | "count";

const chartConfig = {
	totalAmount: {
		label: "Amount",
		color: "var(--color-brand-main-600)",
	},
	transactionCount: {
		label: "Transactions",
		color: "var(--color-brand-main-500)",
	},
} satisfies ChartConfig;

// Payment method icons and colors
const PAYMENT_METHOD_CONFIG = {
	CASH: {
		icon: Banknote,
		label: "Cash",
		color: "var(--color-brand-main-600)",
		bgColor: "bg-green-100",
		textColor: "text-green-800",
	},
	CARD: {
		icon: CreditCard,
		label: "Card",
		color: "var(--color-brand-main-500)",
		bgColor: "bg-blue-100",
		textColor: "text-blue-800",
	},
	MOBILE_MONEY: {
		icon: Smartphone,
		label: "Mobile Money",
		color: "var(--color-brand-main-700)",
		bgColor: "bg-purple-100",
		textColor: "text-purple-800",
	},
	BANK_TRANSFER: {
		icon: Building2,
		label: "Bank Transfer",
		color: "#10B981",
		bgColor: "bg-emerald-100",
		textColor: "text-emerald-800",
	},
} as const;

export function PaymentMethodChart({
	data,
	onPaymentMethodClick,
}: PaymentMethodChartProps) {
	const c = useCurrencySymbol();
	const [viewMode, setViewMode] = useState<ViewMode>("chart");
	const [metricType, setMetricType] = useState<MetricType>("amount");
	const [sortField, setSortField] = useState<SortField>("totalAmount");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Prepare data for horizontal bar chart
	const chartData = data.paymentMethods.map((method) => {
		const config = PAYMENT_METHOD_CONFIG[method.method];
		return {
			method: config.label,
			methodKey: method.method,
			totalAmount: method.totalAmount,
			transactionCount: method.transactionCount,
			percentageOfTotal: method.percentageOfTotal,
			color: config.color,
		};
	});

	// Sort table data
	const sortedPaymentMethods = [...data.paymentMethods].sort((a, b) => {
		let aValue: any;
		let bValue: any;

		if (sortField === "method") {
			aValue = PAYMENT_METHOD_CONFIG[a.method].label;
			bValue = PAYMENT_METHOD_CONFIG[b.method].label;
		} else {
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
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-brand-main-50 p-3 border rounded-lg shadow-lg'>
					<p className='font-semibold text-sm mb-2'>{label}</p>
					<div className='space-y-1'>
						<p className='text-sm'>
							<span className='font-medium'>Total Amount:</span> {c}
							{formatCurrency(data.totalAmount)}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Transactions:</span>{" "}
							{data.transactionCount.toLocaleString()}
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Percentage:</span>{" "}
							{data.percentageOfTotal.toFixed(1)}%
						</p>
						<p className='text-sm'>
							<span className='font-medium'>Avg per Transaction:</span> {c}
							{formatCurrency(data.totalAmount / data.transactionCount)}
						</p>
					</div>
					{/* {onPaymentMethodClick && (
						<p className='text-xs text-blue-600 mt-2'>Click to view details</p>
					)} */}
				</div>
			);
		}
		return null;
	};

	const handleBarClick = (data: any) => {
		if (onPaymentMethodClick && data.methodKey) {
			onPaymentMethodClick(data.methodKey);
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

	// Calculate reconciliation data
	const totalTransactions = data.paymentMethods.reduce(
		(sum, method) => sum + method.transactionCount,
		0,
	);
	const averageTransactionValue = data.totalAmount / totalTransactions;

	return (
		<Card className='w-full shadow-none border-0 py-0'>
			<CardHeader className='p-0'>
				<div className='flex flex-col'>
					{/* <CardTitle className='flex items-center gap-2'>
						<CreditCard className='h-5 w-5' />
						Payment Method Breakdown
					</CardTitle> */}
					<div className='flex items-center gap-2 flex-wrap'>
						{/* Metric Type Toggle */}
						<div className='flex items-center gap-1'>
							<Button
								variant={metricType === "amount" ? "default" : "outline"}
								size='sm'
								onClick={() => setMetricType("amount")}
								className='h-8'>
								<Banknote className='h-3 w-3 mr-1' />
								Amount
							</Button>
							<Button
								variant={metricType === "count" ? "default" : "outline"}
								size='sm'
								onClick={() => setMetricType("count")}
								className='h-8'>
								<BarChart3 className='h-3 w-3 mr-1' />
								Count
							</Button>
						</div>

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

				{/* Summary Stats & Reconciliation */}
				<div className='space-y-2'>
					<div className='flex items-center gap-4 text-sm text-gray-600 flex-wrap'>
						<div className='flex items-center gap-1'>
							<Badge variant='secondary'>
								{data.paymentMethods.length} payment methods
							</Badge>
						</div>
						<span className='text-nowrap'>
							Total Amount: <b>{c}{formatCurrency(data.totalAmount)}</b>
						</span>
						<span className='text-nowrap'>
							Total Transactions: <b>{totalTransactions.toLocaleString()}</b>
						</span>
					</div>

					{/* Reconciliation Data */}
					<div className='flex gap-4 flex-col text-sm text-gray-600 bg-gray-50 p-2 rounded-lg '>
						<span className='font-semibold w-full'>Reconciliation:</span>

						<div className='flex items-center gap-4 flex-wrap'>
							<span className='text-nowrap'>
								Avg Transaction:{" "}
								<b>{c}{formatCurrency(averageTransactionValue)}</b>
							</span>
							{data.paymentMethods.length > 0 && (
								<span className='text-nowrap'>
									Top Method:{" "}
									<b>
										{
											PAYMENT_METHOD_CONFIG[
												data.paymentMethods.reduce((prev, current) =>
													prev.totalAmount > current.totalAmount
														? prev
														: current,
												).method
											].label
										}{" "}
										(
										{data.paymentMethods
											.reduce((prev, current) =>
												prev.totalAmount > current.totalAmount ? prev : current,
											)
											.percentageOfTotal.toFixed(1)}
										%)
									</b>
								</span>
							)}
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className='p-0'>
				{data.paymentMethods.length === 0 ? (
					<div className='flex items-center justify-center h-64 text-gray-500'>
						<div className='text-center'>
							<CreditCard className='h-12 w-12 mx-auto mb-4 opacity-50' />
							<p>No payment method data available</p>
						</div>
					</div>
				) : viewMode === "chart" ? (
					<div className='h-96'>
						<ChartContainer config={chartConfig}>
							<ResponsiveContainer
								width='100%'
								height='100%'>
								<BarChart
									// layout='vertical'
									data={chartData}
									margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis
										dataKey='method'
										tickLine={false}
										axisLine={false}
										className='text-brand-main-600'
										angle={-25}
										textAnchor='end'
										height={60}
										interval={0}
									/>
									<YAxis
										angle={-45}
										tickLine={false}
										axisLine={false}
										className='text-brand-main-600'
										tickFormatter={(value) =>
											metricType === "amount"
												? `${c}${formatCurrency(value)}`
												: value.toLocaleString()
										}
									/>
									<ChartTooltip content={<CustomTooltip />} />
									<Bar
										dataKey={
											metricType === "amount"
												? "totalAmount"
												: "transactionCount"
										}
										fill='var(--color-brand-main-600)'
										radius={[4, 4, 0, 0]}
										onClick={handleBarClick}
										className='cursor-pointer hover:opacity-80'>
										<LabelList
											position='top'
											offset={12}
											className='fill-brand-main-600'
											fontSize={12}
											formatter={(value) =>
												metricType === "amount"
													? `${c}${formatCurrency(value as unknown as number)}`
													: value
											}
										/>
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</div>
				) : (
					// Data Table
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<SortButton field='method'>Payment Method</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='totalAmount'>Total Amount</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='transactionCount'>
											Transactions
										</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										<SortButton field='percentageOfTotal'>
											Percentage
										</SortButton>
									</TableHead>
									<TableHead className='text-right'>
										Avg per Transaction
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedPaymentMethods.map((method) => {
									const config = PAYMENT_METHOD_CONFIG[method.method];
									const Icon = config.icon;
									const avgPerTransaction =
										method.totalAmount / method.transactionCount;

									return (
										<TableRow
											key={method.method}
											className='cursor-pointer hover:bg-gray-50'
											onClick={() => onPaymentMethodClick?.(method.method)}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<div className={`p-2 rounded-lg ${config.bgColor}`}>
														<Icon className={`h-4 w-4 ${config.textColor}`} />
													</div>
													<span className='font-medium'>{config.label}</span>
												</div>
											</TableCell>
											<TableCell className='text-right font-medium'>
												{c}{formatCurrency(method.totalAmount)}
											</TableCell>
											<TableCell className='text-right'>
												{method.transactionCount.toLocaleString()}
											</TableCell>
											<TableCell className='text-right'>
												<Badge variant='secondary'>
													{method.percentageOfTotal.toFixed(1)}%
												</Badge>
											</TableCell>
											<TableCell className='text-right'>
												{c}{formatCurrency(avgPerTransaction)}
											</TableCell>
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
