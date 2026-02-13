"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Receipt, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import Link from "next/link";
import { useGetSalesQuery } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";
import { SaleWithDetails } from "@/lib/services/sale.service";
import DataTable from "@/components/dashboard/data-table";
import { salesHistoryTableDef } from "@/components/sales-history/sales-history-table-def";
import { useDebounce } from "@/hooks/use-debounce";

export default function SalesHistoryPage() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const [statusFilter, setStatusFilter] = useState("all");
	const [showReceipt, setShowReceipt] = useState(false);
	const [selectedSale, setSelectedSale] = useState<SaleWithDetails>();
	const [showSaleDetails, setShowSaleDetails] = useState(false);
	const [viewingSale, setViewingSale] = useState<SaleWithDetails>();

	// Use RTK Query hook to fetch sales with server-side filtering
	const {
		data: sales = [],
		isLoading: loading,
		isFetching,
		isError,
		error,
	} = useGetSalesQuery(
		{
			searchTerm: debouncedSearchTerm || undefined,
			status: statusFilter !== "all" ? statusFilter : undefined,
		},
		{
			skip: !user,
		},
	);

	if (!user) return null;

	const canSeeAll = canViewAllData(user.roles);

	// Use server-filtered data directly - no client-side filtering
	const completedSales = sales.filter(
		(sale) => sale.status === "COMPLETED",
	).length;
	const totalSales = sales.length;
	const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
	const averageOrderValue =
		completedSales > 0 ? totalRevenue / completedSales : 0;

	const handleViewSale = (sale: SaleWithDetails) => {
		setViewingSale(sale);
		setShowSaleDetails(true);
	};

	const handlePrintReceipt = (sale: SaleWithDetails) => {
		setSelectedSale(sale);
		setShowReceipt(true);
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			error && "data" in error
				? (error.data as any)?.message || "Failed to load sales"
				: "Failed to load sales";

		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>Error Loading Sales</CardTitle>
						<p className='text-red-700'>{errorMessage}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-brand-main-800'>
						Sales History
					</h1>
					<p className='text-brand-main-600 mt-1'>
						{canSeeAll
							? "View all store sales transactions"
							: "View your sales transactions"}
					</p>
				</div>
				<Button
					asChild
					className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
					<Link href='/dashboard/sales/new'>
						<Plus className='h-4 w-4 mr-2' />
						New Sale
					</Link>
				</Button>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Sales
						</CardTitle>
						<Receipt className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{totalSales}
						</div>
						<p className='text-xs text-brand-main-600'>
							{completedSales} completed
						</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Revenue
						</CardTitle>
						<Receipt className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{formatNaira(totalRevenue)}
						</div>
						<p className='text-xs text-brand-main-600'>
							From {canSeeAll ? "all sales" : "your sales"}
						</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Avg Order Value
						</CardTitle>
						<Receipt className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{formatNaira(averageOrderValue)}
						</div>
						<p className='text-xs text-brand-main-600'>Per transaction</p>
					</CardContent>
				</Card>
			</div>

			<Card className='border-brand-main-200'>
				<CardHeader>
					<div className='flex gap-4'>
						<div className='relative flex-1'>
							{isFetching ? (
								<Loader2 className='absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-brand-main-500' />
							) : (
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
							)}
							<Input
								placeholder='Search sales...'
								value={searchTerm}
								disabled={loading || isFetching}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8 border-brand-main-200 focus:border-brand-main-400 disabled:cursor-not-allowed'
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
							disabled={loading || isFetching}>
							<SelectTrigger className='w-48 border-brand-main-200 focus:border-brand-main-400'>
								<SelectValue placeholder='All Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='COMPLETED'>Completed</SelectItem>
								<SelectItem value='PENDING'>Pending</SelectItem>
								<SelectItem value='CANCELLED'>Cancelled</SelectItem>
							</SelectContent>
						</Select>
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
							})}
							data={sales}
						/>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={showSaleDetails}
				onOpenChange={setShowSaleDetails}>
				<DialogContent className='max-w-2xl'>
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
									<p className='text-brand-main-800 uppercase'>
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
														{viewingSale.customer?.email}
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

							<div>
								<p className='text-sm font-medium text-brand-main-700 mb-2'>
									Items
								</p>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Item</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Unit Price</TableHead>
											<TableHead>Total</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{viewingSale.items?.map((item, index: number) => (
											<TableRow key={index}>
												<TableCell>{item.inventoryItem.name}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>
													{formatNaira(Number(item.price))}{" "}
												</TableCell>
												<TableCell>
													{formatNaira(Number(item.price * item.quantity))}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							<div className='border-t pt-4'>
								<div className='flex justify-between'>
									<span className='text-brand-main-700'>Subtotal:</span>
									<span className='text-brand-main-800'>
										{formatNaira(Number(viewingSale.total))}
									</span>
								</div>
								{/* {viewingSale.tax > 0 && (
									<div className='flex justify-between'>
										<span className='text-brand-main-700'>Tax:</span>
										<span className='text-brand-main-800'>
											{formatNaira(Number(viewingSale.tax))}
										</span>
									</div>
								)}
								{viewingSale.discount > 0 && (
									<div className='flex justify-between'>
										<span className='text-brand-main-700'>Discount:</span>
										<span className='text-brand-main-800'>
											-{formatNaira(Number(viewingSale.discount))}
										</span>
									</div>
								)} */}
								<div className='flex justify-between font-bold text-lg'>
									<span className='text-brand-main-700'>Total:</span>
									<span className='text-brand-main-800'>
										{formatNaira(Number(viewingSale.total))}
									</span>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<ReceiptPrintDialog
				sale={selectedSale}
				open={showReceipt}
				onOpenChange={setShowReceipt}
			/>
		</div>
	);
}
