"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
	Search,
	Receipt,
	Plus,
	Loader2,
	Download,
	Calendar as CalendarIcon,
	RotateCcw,
	PackageX,
	TrendingDown,
	Hash,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import { ReturnDialog } from "@/components/sales/return-dialog";
import Link from "next/link";
import {
	useGetSalesQuery,
	useCreateReturnMutation,
	useGetReturnsQuery,
} from "@/lib/store/api";
import { formatNaira, cn } from "@/lib/utils";
import { SaleWithDetails } from "@/lib/services/sale.service";
import DataTable from "@/components/dashboard/data-table";
import { salesHistoryTableDef } from "@/components/sales-history/sales-history-table-def";
import { returnsTableDef } from "@/components/sales-history/returns-table-def";
import { useDebounce } from "@/hooks/use-debounce";
import { exportSales } from "@/lib/export-utils";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SalesHistoryPage() {
	const { user } = useAuth();

	// ── Sales tab state ────────────────────────────────────────────────────────
	const [salesSearch, setSalesSearch] = useState("");
	const debouncedSalesSearch = useDebounce(salesSearch, 300);
	const [statusFilter, setStatusFilter] = useState("all");
	const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
	const [salesDateRange, setSalesDateRange] = useState<DateRange | undefined>();
	const [showReceipt, setShowReceipt] = useState(false);
	const [selectedSale, setSelectedSale] = useState<SaleWithDetails>();
	const [showSaleDetails, setShowSaleDetails] = useState(false);
	const [viewingSale, setViewingSale] = useState<SaleWithDetails>();
	const [showReturnDialog, setShowReturnDialog] = useState(false);
	const [returnSale, setReturnSale] = useState<SaleWithDetails | null>(null);

	// ── Returns tab state ──────────────────────────────────────────────────────
	const [returnsSearch, setReturnsSearch] = useState("");
	const debouncedReturnsSearch = useDebounce(returnsSearch, 300);
	const [refundMethodFilter, setRefundMethodFilter] = useState("all");
	const [returnsDateRange, setReturnsDateRange] = useState<
		DateRange | undefined
	>();

	// ── Mutations ──────────────────────────────────────────────────────────────
	const [createReturn, { isLoading: isProcessingReturn }] =
		useCreateReturnMutation();

	// ── Queries ────────────────────────────────────────────────────────────────
	const {
		data: sales = [],
		isLoading: salesLoading,
		isFetching: salesFetching,
		isError: salesError,
		error: salesErrorData,
	} = useGetSalesQuery(
		{
			searchTerm: debouncedSalesSearch || undefined,
			status: statusFilter !== "all" ? statusFilter : undefined,
			paymentMethod:
				paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
			startDate: salesDateRange?.from
				? format(salesDateRange.from, "yyyy-MM-dd")
				: undefined,
			endDate: salesDateRange?.to
				? format(salesDateRange.to, "yyyy-MM-dd")
				: undefined,
		},
		{ skip: !user },
	);

	const {
		data: returns = [],
		isLoading: returnsLoading,
		isFetching: returnsFetching,
		isError: returnsError,
	} = useGetReturnsQuery(
		{
			searchTerm: debouncedReturnsSearch || undefined,
			refundMethod: refundMethodFilter !== "all" ? refundMethodFilter : undefined,
			startDate: returnsDateRange?.from
				? format(returnsDateRange.from, "yyyy-MM-dd")
				: undefined,
			endDate: returnsDateRange?.to
				? format(returnsDateRange.to, "yyyy-MM-dd")
				: undefined,
		},
		{ skip: !user },
	);

	if (!user) return null;

	const canSeeAll = canViewAllData(user.roles);

	// ── Sales stats ────────────────────────────────────────────────────────────
	const completedSales = sales.filter((s) => s.status === "COMPLETED").length;
	const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
	const averageOrderValue = completedSales > 0 ? totalRevenue / completedSales : 0;

	// ── Returns stats ──────────────────────────────────────────────────────────
	const totalReturnsCount = returns.length;
	const totalItemsReturned = returns.reduce(
		(sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0),
		0,
	);
	const totalAmountRefunded = returns.reduce(
		(sum, r) => sum + Number(r.refundAmount),
		0,
	);

	// ── Handlers ───────────────────────────────────────────────────────────────
	const handleViewSale = (sale: SaleWithDetails) => {
		setViewingSale(sale);
		setShowSaleDetails(true);
	};

	const handlePrintReceipt = (sale: SaleWithDetails) => {
		setSelectedSale(sale);
		setShowReceipt(true);
	};

	const handleExportSales = () => exportSales(sales);

	const handleProcessReturn = (sale: SaleWithDetails) => {
		setReturnSale(sale);
		setShowReturnDialog(true);
	};

	const handleSubmitReturn = async (data: {
		items: { inventoryItemId: string; quantity: number }[];
		reason: string;
		refundMethod: string;
	}) => {
		if (!returnSale) return;
		try {
			await createReturn({ id: returnSale.id, data }).unwrap();
			toast.success("Return processed successfully. Stock has been restocked.");
			setShowReturnDialog(false);
			setReturnSale(null);
		} catch (err: any) {
			toast.error(
				err?.data?.error?.message || "Failed to process return. Please try again.",
			);
		}
	};

	const handleClearSalesFilters = () => {
		setSalesSearch("");
		setStatusFilter("all");
		setPaymentMethodFilter("all");
		setSalesDateRange(undefined);
	};

	const handleClearReturnsFilters = () => {
		setReturnsSearch("");
		setRefundMethodFilter("all");
		setReturnsDateRange(undefined);
	};

	const hasSalesFilters =
		salesSearch || statusFilter !== "all" || paymentMethodFilter !== "all" || salesDateRange;

	const hasReturnsFilters =
		returnsSearch || refundMethodFilter !== "all" || returnsDateRange;

	// ── Loading / error states ─────────────────────────────────────────────────
	if (salesLoading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (salesError) {
		const msg =
			salesErrorData && "data" in salesErrorData
				? (salesErrorData.data as any)?.message || "Failed to load sales"
				: "Failed to load sales";
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>Error Loading Sales</CardTitle>
						<p className='text-red-700'>{msg}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// ── Date range picker shared renderer ─────────────────────────────────────
	const DateRangePicker = ({
		value,
		onChange,
		disabled,
	}: {
		value: DateRange | undefined;
		onChange: (r: DateRange | undefined) => void;
		disabled?: boolean;
	}) => (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						"w-64 justify-start text-left   hover:bg-brand-main-50 bg-white",
						!value && "text-muted-foreground",
					)}
					disabled={disabled}>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{value?.from ? (
						value.to ? (
							<>
								{format(value.from, "LLL dd, y")} –{" "}
								{format(value.to, "LLL dd, y")}
							</>
						) : (
							format(value.from, "LLL dd, y")
						)
					) : (
						<span>Pick a date range</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='range'
					defaultMonth={value?.from}
					selected={value}
					onSelect={onChange}
					numberOfMonths={2}
					disabled={(date) =>
						date > new Date() || date < new Date("1900-01-01")
					}
				/>
			</PopoverContent>
		</Popover>
	);

	return (
		<div className='space-y-6 p-6'>
			{/* Page header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-brand-main-900'>
						Sales History
					</h1>
					<p className='text-brand-main-800 mt-1'>
						{canSeeAll
							? "View all store sales transactions and returns"
							: "View your sales transactions and returns"}
					</p>
				</div>
				<Button
					asChild
					className='bg-brand-main-900 hover:bg-brand-main-700 text-white'>
					<Link href='/dashboard/sales/new'>
						<Plus className='h-4 w-4 mr-2' />
						New Sale
					</Link>
				</Button>
			</div>

			{/* Tabs */}
			<Tabs defaultValue='sales'>
				<TabsList >
					<TabsTrigger
						value='sales'
						className="w-64"
						>
						<Receipt className='h-4 w-4 mr-2' />
						Sales
						
					</TabsTrigger>
					<TabsTrigger
						value='returns'
						>
						<RotateCcw className='h-4 w-4 mr-2' />
						Returns
						
					</TabsTrigger>
				</TabsList>

				{/* ── SALES TAB ──────────────────────────────────────────────────────── */}
				<TabsContent value='sales' className='space-y-6 pt-6'>
					{/* Stats */}
					<div className='grid gap-4 md:grid-cols-3'>
						<Card className=' '>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium text-slate-600'>
									Total Sales
								</CardTitle>
								<Receipt className='h-4 w-4 text-brand-main-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-brand-main-800'>
									{sales.length}
								</div>
								<p className='text-xs text-slate-500'>
									{completedSales} completed
								</p>
							</CardContent>
						</Card>

						<Card className=' '>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium text-slate-600'>
									Total Revenue
								</CardTitle>
								<Receipt className='h-4 w-4 text-brand-main-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-brand-main-800'>
									{formatNaira(totalRevenue)}
								</div>
								<p className='text-xs text-slate-500'>
									From {canSeeAll ? "all sales" : "your sales"}
								</p>
							</CardContent>
						</Card>

						<Card className=' '>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium text-slate-600'>
									Avg Order Value
								</CardTitle>
								<Receipt className='h-4 w-4 text-brand-main-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-brand-main-800'>
									{formatNaira(averageOrderValue)}
								</div>
								<p className='text-xs text-slate-500'>Per transaction</p>
							</CardContent>
						</Card>
					</div>

					{/* Filters + table */}
					<Card className=' '>
						<CardHeader>
							<div className='space-y-4'>
								<div className='flex gap-4'>
									<div className='relative flex-1'>
										{salesFetching ? (
											<Loader2 className='absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground' />
										) : (
											<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
										)}
										<Input
											placeholder='Search by ID, customer, cashier...'
											value={salesSearch}
											onChange={(e) => setSalesSearch(e.target.value)}
											className='pl-8   focus:border-brand-main-400'
										/>
									</div>
									<Button
										onClick={handleExportSales}
										disabled={salesLoading || salesFetching || sales.length === 0}
										variant='outline'
										className='  hover:bg-brand-main-50'>
										<Download className='h-4 w-4 mr-2' />
										Export CSV
									</Button>
								</div>

								<div className='flex gap-4 flex-wrap'>
									<Select
										value={statusFilter}
										onValueChange={setStatusFilter}
										disabled={salesFetching}>
										<SelectTrigger className='w-48   focus:border-brand-main-400'>
											<SelectValue placeholder='All Status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Status</SelectItem>
											<SelectItem value='COMPLETED'>Completed</SelectItem>
											<SelectItem value='PENDING'>Pending</SelectItem>
											<SelectItem value='CANCELLED'>Cancelled</SelectItem>
										</SelectContent>
									</Select>

									<Select
										value={paymentMethodFilter}
										onValueChange={setPaymentMethodFilter}
										disabled={salesFetching}>
										<SelectTrigger className='w-48   focus:border-brand-main-400'>
											<SelectValue placeholder='All Payment Methods' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Payment Methods</SelectItem>
											<SelectItem value='CASH'>Cash</SelectItem>
											<SelectItem value='CARD'>Card</SelectItem>
											<SelectItem value='MOBILE_MONEY'>Mobile Money</SelectItem>
											<SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
										</SelectContent>
									</Select>

									<DateRangePicker
										value={salesDateRange}
										onChange={setSalesDateRange}
										disabled={salesFetching}
									/>

									{hasSalesFilters && (
										<Button
											variant='ghost'
											onClick={handleClearSalesFilters}
											className='text-brand-main-600 hover:text-brand-main-700 hover:bg-brand-main-50'>
											Clear Filters
										</Button>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{sales.length === 0 ? (
								<div className='text-center py-8 text-brand-main-600'>
									No sales found matching your criteria.
								</div>
							) : (
								<DataTable
									columns={salesHistoryTableDef({
										canSeeAll,
										handleViewSale,
										handlePrintReceipt,
										handleProcessReturn,
									})}
									data={sales}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── RETURNS TAB ────────────────────────────────────────────────────── */}
				<TabsContent value='returns' className='space-y-6 pt-6'>
					{/* Stats */}
					<div className='grid gap-4 md:grid-cols-3'>
						<Card className=' '>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium text-brand-main-700'>
									Total Returns
								</CardTitle>
								<Hash className='h-4 w-4 text-amber-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-brand-main-800'>
									{totalReturnsCount}
								</div>
								<p className='text-xs text-brand-main-600'>
									Return transactions
								</p>
							</CardContent>
						</Card>

						<Card className=' '>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium text-brand-main-700'>
									Items Returned
								</CardTitle>
								<PackageX className='h-4 w-4 text-amber-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-brand-main-800'>
									{totalItemsReturned}
								</div>
								<p className='text-xs text-brand-main-600'>
									Units back in stock
								</p>
							</CardContent>
						</Card>

						<Card className=' '>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium text-brand-main-700'>
									Total Refunded
								</CardTitle>
								<TrendingDown className='h-4 w-4 text-amber-600' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-amber-700'>
									{formatNaira(totalAmountRefunded)}
								</div>
								<p className='text-xs text-brand-main-600'>
									Across all returns
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Filters + table */}
					<Card className=' '>
						<CardHeader>
							<div className='space-y-4'>
								<div className='flex gap-4'>
									<div className='relative flex-1'>
										{returnsFetching ? (
											<Loader2 className='absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-brand-main-500' />
										) : (
											<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
										)}
										<Input
											placeholder='Search by return ID, sale ID, customer, cashier...'
											value={returnsSearch}
											onChange={(e) => setReturnsSearch(e.target.value)}
											className='pl-8   focus:border-brand-main-400'
										/>
									</div>
								</div>

								<div className='flex gap-4 flex-wrap'>
									<Select
										value={refundMethodFilter}
										onValueChange={setRefundMethodFilter}
										disabled={returnsFetching}>
										<SelectTrigger className='w-48   focus:border-brand-main-400'>
											<SelectValue placeholder='All Refund Methods' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Refund Methods</SelectItem>
											<SelectItem value='CASH'>Cash</SelectItem>
											<SelectItem value='CARD'>Card</SelectItem>
											<SelectItem value='MOBILE_MONEY'>Mobile Money</SelectItem>
											<SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
										</SelectContent>
									</Select>

									<DateRangePicker
										value={returnsDateRange}
										onChange={setReturnsDateRange}
										disabled={returnsFetching}
									/>

									{hasReturnsFilters && (
										<Button
											variant='ghost'
											onClick={handleClearReturnsFilters}
											className='text-brand-main-600 hover:text-brand-main-700 hover:bg-brand-main-50'>
											Clear Filters
										</Button>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{returnsLoading ? (
								<div className='flex items-center justify-center py-8'>
									<Loader2 className='h-6 w-6 animate-spin text-brand-main-600' />
								</div>
							) : returnsError ? (
								<div className='text-center py-8 text-red-600'>
									Failed to load returns. Please try again.
								</div>
							) : returns.length === 0 ? (
								<div className='text-center py-8'>
									<RotateCcw className='h-10 w-10 mx-auto text-brand-main-300 mb-3' />
									<p className='text-brand-main-600'>
										No returns found matching your criteria.
									</p>
								</div>
							) : (
								<DataTable
									columns={returnsTableDef({ canSeeAll, handleViewSale, sales })}
									data={returns}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* ── Sale Details Dialog ──────────────────────────────────────────────── */}
			<Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
				<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-brand-main-800'>
							Sale Details
						</DialogTitle>
					</DialogHeader>
					{viewingSale && (
						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-sm font-medium text-brand-main-700'>
										Sale ID
									</p>
									<p className='text-brand-main-800 uppercase font-mono'>
										{viewingSale.id.slice(0, 8)}
									</p>
								</div>
								<div>
									<p className='text-sm font-medium text-brand-main-700'>
										Date
									</p>
									<p className='text-brand-main-800'>
										{new Date(viewingSale.createdAt).toLocaleDateString()}{" "}
										{new Date(viewingSale.createdAt).toLocaleTimeString()}
									</p>
								</div>
								<div>
									<p className='text-sm font-medium text-brand-main-700'>
										Sales Person
									</p>
									<p className='text-brand-main-800'>
										{viewingSale.user?.name || "Unknown"}
									</p>
								</div>
								<div>
									<p className='text-sm font-medium text-brand-main-700'>
										Payment Method
									</p>
									<p className='text-brand-main-800 capitalize'>
										{viewingSale.paymentMethod}
									</p>
								</div>
								{viewingSale.customer &&
									(viewingSale.customer.name ||
										viewingSale.customer.email ||
										viewingSale.customer.phone) && (
										<>
											{viewingSale.customer.name && (
												<div>
													<p className='text-sm font-medium text-brand-main-700'>
														Customer Name
													</p>
													<p className='text-brand-main-800'>
														{viewingSale.customer.name}
													</p>
												</div>
											)}
											{viewingSale.customer?.email && (
												<div>
													<p className='text-sm font-medium text-brand-main-700'>
														Customer Email
													</p>
													<p className='text-brand-main-800'>
														{viewingSale.customer.email}
													</p>
												</div>
											)}
											{viewingSale.customer.phone && (
												<div>
													<p className='text-sm font-medium text-brand-main-700'>
														Customer Phone
													</p>
													<p className='text-brand-main-800'>
														{viewingSale.customer.phone}
													</p>
												</div>
											)}
										</>
									)}
							</div>

							{/* Items */}
							<div>
								<p className='text-sm font-medium text-brand-main-700 mb-2'>
									Items
								</p>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Item</TableHead>
											<TableHead>Qty</TableHead>
											<TableHead>Unit Price</TableHead>
											<TableHead>Total</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{viewingSale.items?.map((item, index) => (
											<TableRow key={index}>
												<TableCell>{item.inventoryItem.name}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>{formatNaira(Number(item.price))}</TableCell>
												<TableCell>
													{formatNaira(Number(item.price) * item.quantity)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Totals */}
							<div className='border-t pt-4 space-y-1'>
								<div className='flex justify-between text-sm'>
									<span className='text-brand-main-700'>Subtotal:</span>
									<span className='text-brand-main-800'>
										{formatNaira(Number(viewingSale.subTotal))}
									</span>
								</div>
								{Number(viewingSale.discountAmount) > 0 && (
									<div className='flex justify-between text-sm'>
										<span className='text-brand-main-700'>Discount:</span>
										<span className='text-brand-main-800'>
											-{formatNaira(Number(viewingSale.discountAmount))}
										</span>
									</div>
								)}
								{Number(viewingSale.taxAmount) > 0 && (
									<div className='flex justify-between text-sm'>
										<span className='text-brand-main-700'>Tax:</span>
										<span className='text-brand-main-800'>
											{formatNaira(Number(viewingSale.taxAmount))}
										</span>
									</div>
								)}
								<div className='flex justify-between font-bold text-base border-t pt-1'>
									<span className='text-brand-main-700'>Total:</span>
									<span className='text-brand-main-800'>
										{formatNaira(Number(viewingSale.total))}
									</span>
								</div>
							</div>

							{/* Returns on this sale */}
							{viewingSale.returns && viewingSale.returns.length > 0 && (
								<>
									<Separator />
									<div className='space-y-3'>
										<div className='flex items-center gap-2'>
											<RotateCcw className='h-4 w-4 text-amber-600' />
											<p className='text-sm font-medium text-brand-main-800'>
												Returns ({viewingSale.returns.length})
											</p>
										</div>
										{viewingSale.returns.map((ret) => (
											<div
												key={ret.id}
												className='rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2'>
												<div className='flex items-start justify-between gap-2'>
													<div className='space-y-0.5'>
														<p className='text-xs text-brand-main-500 font-mono'>
															Return #{ret.id.slice(0, 8)}
														</p>
														<p className='text-xs text-brand-main-600'>
															{new Date(ret.createdAt).toLocaleDateString()}{" "}
															{new Date(ret.createdAt).toLocaleTimeString()} · by{" "}
															{ret.processedBy.name}
														</p>
													</div>
													<div className='text-right shrink-0'>
														<p className='text-sm font-semibold text-amber-700'>
															-{formatNaira(Number(ret.refundAmount))}
														</p>
														<Badge
															variant='outline'
															className='text-xs border-amber-300 text-amber-700 mt-0.5'>
															{ret.refundMethod.replace(/_/g, " ")}
														</Badge>
													</div>
												</div>
												<p className='text-xs text-brand-main-700 italic'>
													"{ret.reason}"
												</p>
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead className='text-xs py-1'>Item</TableHead>
															<TableHead className='text-xs py-1'>Qty</TableHead>
															<TableHead className='text-xs py-1'>Refund</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{ret.items.map((ri, idx) => (
															<TableRow key={idx}>
																<TableCell className='text-xs py-1'>
																	{ri.inventoryItem.name}
																</TableCell>
																<TableCell className='text-xs py-1'>
																	{ri.quantity}
																</TableCell>
																<TableCell className='text-xs py-1'>
																	{formatNaira(Number(ri.price) * ri.quantity)}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										))}
										<div className='flex justify-between text-sm font-medium text-amber-700 pt-1'>
											<span>Total Refunded:</span>
											<span>
												{formatNaira(
													viewingSale.returns.reduce(
														(sum, r) => sum + Number(r.refundAmount),
														0,
													),
												)}
											</span>
										</div>
									</div>
								</>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* ── Receipt ──────────────────────────────────────────────────────────── */}
			<ReceiptPrintDialog
				sale={selectedSale}
				open={showReceipt}
				onOpenChange={setShowReceipt}
			/>

			{/* ── Return dialog ────────────────────────────────────────────────────── */}
			<ReturnDialog
				open={showReturnDialog}
				onOpenChange={(open) => {
					setShowReturnDialog(open);
					if (!open) setReturnSale(null);
				}}
				sale={returnSale}
				onProcessReturn={handleSubmitReturn}
				isProcessing={isProcessingReturn}
			/>
		</div>
	);
}
