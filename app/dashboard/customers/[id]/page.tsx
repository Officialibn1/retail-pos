"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	ArrowLeft,
	Loader2,
	ShoppingBag,
	RotateCcw,
	DollarSign,
	Calendar,
	Medal,
	TrendingUp,
	Package,
	FolderOpen,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/dashboard/data-table";
import { useGetCustomerDetailQuery, CustomerDetailSale } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";
import { getSpendingTier } from "@/lib/spending-tier";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToggleMode = "amount" | "quantity";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Sales table columns ──────────────────────────────────────────────────────

function salesColumns(c: string): ColumnDef<CustomerDetailSale>[] {
	return [
		{
			header: "Sale ID",
			accessorKey: "id",
			cell: ({ row }) => (
				<span className='font-mono text-xs'>{row.original.id.slice(0, 8)}</span>
			),
		},
		{
			header: "Date",
			accessorKey: "createdAt",
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm"),
		},
		{
			header: "Status",
			accessorKey: "status",
			cell: ({ row }) => {
				const s = row.original.status;
				return (
					<Badge
						variant='outline'
						className={
							s === "COMPLETED"
								? "bg-green-50 text-green-700 border-green-300"
								: s === "CANCELLED"
									? "bg-red-50 text-red-700 border-red-300"
									: "bg-amber-50 text-amber-700 border-amber-300"
						}>
						{s}
					</Badge>
				);
			},
		},
		{
			header: "Items",
			accessorKey: "items",
			cell: ({ row }) =>
				row.original.items.reduce((s, i) => s + i.quantity, 0),
		},
		{
			header: "Payment",
			accessorKey: "paymentMethod",
			cell: ({ row }) =>
				row.original.paymentMethod?.replace(/_/g, " ") || "—",
		},
		{
			header: "Total",
			accessorKey: "total",
			cell: ({ row }) => (
				<span className='font-medium'>
					{formatNaira(Number(row.original.total), c)}
				</span>
			),
		},
	];
}

// ─── Returns table columns ────────────────────────────────────────────────────

type FlatReturn = {
	id: string;
	saleId: string;
	reason: string;
	refundAmount: number;
	refundMethod: string;
	createdAt: string;
	processedBy: string;
};

function returnsColumns(c: string): ColumnDef<FlatReturn>[] {
	return [
		{
			header: "Return ID",
			accessorKey: "id",
			cell: ({ row }) => (
				<span className='font-mono text-xs'>{row.original.id.slice(0, 8)}</span>
			),
		},
		{
			header: "Sale ID",
			accessorKey: "saleId",
			cell: ({ row }) => (
				<span className='font-mono text-xs'>
					{row.original.saleId.slice(0, 8)}
				</span>
			),
		},
		{
			header: "Date",
			accessorKey: "createdAt",
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm"),
		},
		{
			header: "Reason",
			accessorKey: "reason",
			cell: ({ row }) => (
				<span className='max-w-[180px] truncate block'>{row.original.reason}</span>
			),
		},
		{
			header: "Refund Method",
			accessorKey: "refundMethod",
			cell: ({ row }) => row.original.refundMethod.replace(/_/g, " "),
		},
		{
			header: "Processed By",
			accessorKey: "processedBy",
			cell: ({ row }) => row.original.processedBy,
		},
		{
			header: "Refund Amount",
			accessorKey: "refundAmount",
			cell: ({ row }) => (
				<span className='font-medium'>
					{formatNaira(row.original.refundAmount, c)}
				</span>
			),
		},
	];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const c = useCurrencySymbol();
	const [productToggle, setProductToggle] = useState<ToggleMode>("amount");
	const [categoryToggle, setCategoryToggle] = useState<ToggleMode>("amount");

	const { data, isLoading, isError } = useGetCustomerDetailQuery(id);
	const customer = data?.customer;

	// ── Derived metrics ────────────────────────────────────────────────────────

	const completedSales = useMemo(
		() => customer?.sales.filter((s) => s.status === "COMPLETED") ?? [],
		[customer],
	);

	const totalSpend = useMemo(
		() => completedSales.reduce((sum, s) => sum + Number(s.total), 0),
		[completedSales],
	);

	const totalVisits = completedSales.length;

	const allReturns: FlatReturn[] = useMemo(
		() =>
			(customer?.sales ?? []).flatMap((sale) =>
				sale.returns.map((r) => ({
					id: r.id,
					saleId: sale.id,
					reason: r.reason,
					refundAmount: Number(r.refundAmount),
					refundMethod: r.refundMethod,
					createdAt: r.createdAt,
					processedBy: r.processedBy.name,
				})),
			),
		[customer],
	);

	const totalReturnCount = allReturns.length;
	const totalRefundAmount = allReturns.reduce(
		(sum, r) => sum + r.refundAmount,
		0,
	);

	const tier = getSpendingTier(totalSpend);

	// ── Top products ───────────────────────────────────────────────────────────

	const topProducts = useMemo(() => {
		const map = new Map<
			string,
			{ name: string; totalAmount: number; totalQty: number }
		>();
		completedSales.forEach((sale) =>
			sale.items.forEach((item) => {
				const existing = map.get(item.inventoryItem.id);
				if (existing) {
					existing.totalAmount += Number(item.price) * item.quantity;
					existing.totalQty += item.quantity;
				} else {
					map.set(item.inventoryItem.id, {
						name: item.inventoryItem.name,
						totalAmount: Number(item.price) * item.quantity,
						totalQty: item.quantity,
					});
				}
			}),
		);
		return [...map.values()]
			.sort((a, b) =>
				productToggle === "amount"
					? b.totalAmount - a.totalAmount
					: b.totalQty - a.totalQty,
			)
			.slice(0, 10);
	}, [completedSales, productToggle]);

	// ── Top categories ─────────────────────────────────────────────────────────

	const topCategories = useMemo(() => {
		const map = new Map<
			string,
			{ name: string; totalAmount: number; totalQty: number }
		>();
		completedSales.forEach((sale) =>
			sale.items.forEach((item) => {
				const catName = item.inventoryItem.category.name;
				const existing = map.get(catName);
				if (existing) {
					existing.totalAmount += Number(item.price) * item.quantity;
					existing.totalQty += item.quantity;
				} else {
					map.set(catName, {
						name: catName,
						totalAmount: Number(item.price) * item.quantity,
						totalQty: item.quantity,
					});
				}
			}),
		);
		return [...map.values()]
			.sort((a, b) =>
				categoryToggle === "amount"
					? b.totalAmount - a.totalAmount
					: b.totalQty - a.totalQty,
			)
			.slice(0, 10);
	}, [completedSales, categoryToggle]);

	// ── Visit pattern by weekday ───────────────────────────────────────────────

	const visitPattern = useMemo(() => {
		const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon–Sun
		completedSales.forEach((sale) => {
			// getDay(): 0 = Sunday, 1 = Monday … 6 = Saturday
			// Remap to Mon=0 … Sun=6
			const day = (new Date(sale.createdAt).getDay() + 6) % 7;
			counts[day]++;
		});
		return DAY_LABELS.map((label, i) => ({ day: label, visits: counts[i] }));
	}, [completedSales]);

	// ── Render ─────────────────────────────────────────────────────────────────

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (isError || !customer) {
		return (
			<div className='p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>Customer not found</CardTitle>
						<CardDescription className='text-red-700'>
							The customer you are looking for does not exist.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant='outline' onClick={() => router.back()}>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Go back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6 p-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button
					variant='ghost'
					size='sm'
					asChild
					className='text-brand-main-700 hover:bg-brand-main-50'>
					<Link href='/dashboard/customers'>
						<ArrowLeft className='h-4 w-4 mr-1' />
						Customers
					</Link>
				</Button>
				<Separator orientation='vertical' className='h-5' />
				<div>
					<h1 className='text-2xl font-bold text-brand-main-900'>
						{customer.name || "Walk-in Customer"}
					</h1>
					<p className='text-sm text-brand-main-600'>
						{customer.phone}
						{customer.email && ` · ${customer.email}`}
						{` · Member since ${format(new Date(customer.createdAt), "MMM yyyy")}`}
					</p>
				</div>
			</div>

			{/* Summary cards */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs font-medium text-brand-main-700'>
							Total Spend
						</CardTitle>
						<DollarSign className='h-4 w-4 text-brand-main-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-900'>
							{formatNaira(totalSpend, c)}
						</div>
						<p className='text-xs text-brand-main-500 mt-0.5'>
							Completed purchases
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs font-medium text-brand-main-700'>
							Store Visits
						</CardTitle>
						<Calendar className='h-4 w-4 text-brand-main-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-900'>
							{totalVisits}
						</div>
						<p className='text-xs text-brand-main-500 mt-0.5'>
							Completed transactions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs font-medium text-brand-main-700'>
							Returns
						</CardTitle>
						<RotateCcw className='h-4 w-4 text-brand-main-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-900'>
							{totalReturnCount}
						</div>
						<p className='text-xs text-brand-main-500 mt-0.5'>
							{formatNaira(totalRefundAmount, c)} refunded
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs font-medium text-brand-main-700'>
							Total Refunded
						</CardTitle>
						<ShoppingBag className='h-4 w-4 text-brand-main-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-900'>
							{formatNaira(totalRefundAmount, c)}
						</div>
						<p className='text-xs text-brand-main-500 mt-0.5'>
							Across {totalReturnCount} return{totalReturnCount !== 1 ? "s" : ""}
						</p>
					</CardContent>
				</Card>

				<Card className={`border ${tier.className}`}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs font-medium'>
							Loyalty Tier
						</CardTitle>
						<Medal className='h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{tier.label}</div>
						{tier.nextTierThreshold && (
							<p className='text-xs mt-0.5'>
								{formatNaira(tier.nextTierThreshold - totalSpend, c)} to next
								tier
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Sales & Returns tables */}
			<Tabs defaultValue='sales'>
				<TabsList>
					<TabsTrigger value='sales'>
						Sales ({customer.sales.length})
					</TabsTrigger>
					<TabsTrigger value='returns'>
						Returns ({totalReturnCount})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='sales' className='mt-4'>
					<Card>
						<CardHeader>
							<CardTitle className='text-brand-main-800'>
								Purchase History
							</CardTitle>
						</CardHeader>
						<CardContent>
							<DataTable
								columns={salesColumns(c)}
								data={customer.sales}
								tableName={`${customer.name ?? "Customer"} Sales`}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='returns' className='mt-4'>
					<Card>
						<CardHeader>
							<CardTitle className='text-brand-main-800'>
								Return History
							</CardTitle>
						</CardHeader>
						<CardContent>
							{allReturns.length === 0 ? (
								<p className='text-sm text-brand-main-500 py-8 text-center'>
									No returns on record.
								</p>
							) : (
								<DataTable
									columns={returnsColumns(c)}
									data={allReturns}
									tableName={`${customer.name ?? "Customer"} Returns`}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Analytics section */}
			<div className='grid gap-6 lg:grid-cols-2'>
				{/* Top Products */}
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-brand-main-800 flex items-center gap-2'>
								<Package className='h-4 w-4' />
								Top Products
							</CardTitle>
							<div className='flex items-center gap-1'>
								<Button
									size='sm'
									variant={productToggle === "amount" ? "default" : "outline"}
									className='h-7 text-xs'
									onClick={() => setProductToggle("amount")}>
									By Amount
								</Button>
								<Button
									size='sm'
									variant={productToggle === "quantity" ? "default" : "outline"}
									className='h-7 text-xs'
									onClick={() => setProductToggle("quantity")}>
									By Qty
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{topProducts.length === 0 ? (
							<p className='text-sm text-brand-main-500 py-4 text-center'>
								No purchase data yet.
							</p>
						) : (
							<div className='space-y-2'>
								{topProducts.map((p, i) => (
									<div
										key={p.name}
										className='flex items-center justify-between text-sm'>
										<div className='flex items-center gap-2 min-w-0'>
											<span className='text-xs text-brand-main-400 w-4 shrink-0'>
												{i + 1}
											</span>
											<span className='truncate text-brand-main-800'>
												{p.name}
											</span>
										</div>
										<span className='font-medium text-brand-main-900 shrink-0 ml-4'>
											{productToggle === "amount"
												? formatNaira(p.totalAmount, c)
												: `${p.totalQty} units`}
										</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Categories */}
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-brand-main-800 flex items-center gap-2'>
								<FolderOpen className='h-4 w-4' />
								Top Categories
							</CardTitle>
							<div className='flex items-center gap-1'>
								<Button
									size='sm'
									variant={categoryToggle === "amount" ? "default" : "outline"}
									className='h-7 text-xs'
									onClick={() => setCategoryToggle("amount")}>
									By Amount
								</Button>
								<Button
									size='sm'
									variant={
										categoryToggle === "quantity" ? "default" : "outline"
									}
									className='h-7 text-xs'
									onClick={() => setCategoryToggle("quantity")}>
									By Qty
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{topCategories.length === 0 ? (
							<p className='text-sm text-brand-main-500 py-4 text-center'>
								No purchase data yet.
							</p>
						) : (
							<div className='space-y-2'>
								{topCategories.map((cat, i) => (
									<div
										key={cat.name}
										className='flex items-center justify-between text-sm'>
										<div className='flex items-center gap-2 min-w-0'>
											<span className='text-xs text-brand-main-400 w-4 shrink-0'>
												{i + 1}
											</span>
											<span className='truncate text-brand-main-800'>
												{cat.name}
											</span>
										</div>
										<span className='font-medium text-brand-main-900 shrink-0 ml-4'>
											{categoryToggle === "amount"
												? formatNaira(cat.totalAmount, c)
												: `${cat.totalQty} units`}
										</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Visit pattern chart */}
			<Card>
				<CardHeader>
					<CardTitle className='text-brand-main-800 flex items-center gap-2'>
						<TrendingUp className='h-4 w-4' />
						Visit Pattern by Day of Week
					</CardTitle>
					<CardDescription className='text-brand-main-600'>
						Number of completed purchases per weekday
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='h-56'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={visitPattern}
								margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
								<CartesianGrid strokeDasharray='3 3' vertical={false} />
								<XAxis
									dataKey='day'
									tickLine={false}
									axisLine={false}
									className='text-brand-main-600 text-xs'
								/>
								<YAxis
									allowDecimals={false}
									tickLine={false}
									axisLine={false}
									className='text-brand-main-600 text-xs'
								/>
								<Tooltip
									formatter={(value: number) => [
										`${value} visit${value !== 1 ? "s" : ""}`,
										"Visits",
									]}
									contentStyle={{
										borderRadius: "8px",
										fontSize: "12px",
										border: "1px solid #e2e8f0",
									}}
								/>
								<Bar
									dataKey='visits'
									fill='var(--color-brand-main-600, #7c3aed)'
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
