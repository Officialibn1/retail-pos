"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Eye, Receipt, Plus, Printer, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import Link from "next/link";
import { useGetSalesQuery } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";
import { SaleWithDetails } from "@/lib/services/sale.service";

export default function SalesHistoryPage() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [showReceipt, setShowReceipt] = useState(false);
	const [selectedSale, setSelectedSale] = useState<SaleWithDetails>();
	const [showSaleDetails, setShowSaleDetails] = useState(false);
	const [viewingSale, setViewingSale] = useState<SaleWithDetails>();

	// Use RTK Query hook to fetch sales
	const {
		data: sales = [],
		isLoading: loading,
		isError,
		error,
	} = useGetSalesQuery(undefined, {
		skip: !user,
	});

	if (!user) return null;

	const canSeeAll = canViewAllData(user.roles);

	const filteredSales = sales.filter((sale) => {
		const matchesSearch =
			sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(sale.paymentMethod &&
				sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

		const matchesStatus =
			statusFilter === "all" || sale.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const handleViewSale = (sale: SaleWithDetails) => {
		setViewingSale(sale);
		setShowSaleDetails(true);
	};

	const handlePrintReceipt = (sale: SaleWithDetails) => {
		setSelectedSale(sale);
		setShowReceipt(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return (
					<Badge className='bg-brand-main-100 text-brand-main-800 hover:bg-brand-main-100'>
						Completed
					</Badge>
				);
			case "PENDING":
				return (
					<Badge
						variant='secondary'
						className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
						Pending
					</Badge>
				);
			case "CANCELLED":
				return (
					<Badge
						variant='destructive'
						className='bg-red-100 text-red-800 hover:bg-red-100'>
						Cancelled
					</Badge>
				);
			default:
				return <Badge variant='secondary'>{status}</Badge>;
		}
	};

	const totalSales = filteredSales.length;
	const totalRevenue = filteredSales.reduce(
		(sum, sale) => sum + Number(sale.total),
		0,
	);
	const completedSales = filteredSales.filter(
		(sale) => sale.status === "COMPLETED",
	).length;
	const averageOrderValue =
		completedSales > 0 ? totalRevenue / completedSales : 0;

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
					<CardTitle className='text-brand-main-800'>
						Sales Transactions
					</CardTitle>
					<div className='flex gap-4 mt-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
							<Input
								placeholder='Search sales...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8 border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className='px-3 py-2 border border-brand-main-200 rounded-md text-sm focus:border-brand-main-400 focus:outline-none'>
							<option value='all'>All Status</option>
							<option value='COMPLETED'>Completed</option>
							<option value='PENDING'>Pending</option>
							<option value='CANCELLED'>Cancelled</option>
						</select>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className='border-brand-main-200'>
								<TableHead className='text-brand-main-700'>
									Sale Number
								</TableHead>
								<TableHead className='text-brand-main-700'>Date</TableHead>
								{canSeeAll && (
									<TableHead className='text-brand-main-700'>
										Sales Person
									</TableHead>
								)}
								<TableHead className='text-brand-main-700'>Items</TableHead>
								<TableHead className='text-brand-main-700'>Payment</TableHead>
								<TableHead className='text-brand-main-700'>Total</TableHead>
								<TableHead className='text-brand-main-700'>Status</TableHead>
								<TableHead className='text-brand-main-700'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredSales.map((sale) => (
								<TableRow
									key={sale.id}
									className='border-brand-main-100'>
									<TableCell className='font-medium text-brand-main-800'>
										{sale.id.slice(0, 8)}
									</TableCell>
									<TableCell className='text-brand-main-700'>
										{new Date(sale.createdAt).toLocaleDateString()}{" "}
										{new Date(sale.createdAt).toLocaleTimeString()}
									</TableCell>
									{canSeeAll && (
										<TableCell className='text-brand-main-700'>
											{sale.user?.name || "Unknown"}
										</TableCell>
									)}
									<TableCell className='text-brand-main-700'>
										{sale.items?.length || 0} items
									</TableCell>
									<TableCell className='text-brand-main-700 capitalize'>
										{sale.paymentMethod}
									</TableCell>
									<TableCell className='text-brand-main-700'>
										{formatNaira(Number(sale.total))}
									</TableCell>
									<TableCell>{getStatusBadge(sale.status)}</TableCell>
									<TableCell>
										<div className='flex gap-1'>
											<Button
												size='sm'
												variant='ghost'
												className='text-brand-main-600 hover:bg-brand-main-100'
												onClick={() => handleViewSale(sale)}>
												<Eye className='h-4 w-4 mr-1' />
												View
											</Button>
											<Button
												size='sm'
												variant='ghost'
												className='text-brand-main-600 hover:bg-brand-main-100'
												onClick={() => handlePrintReceipt(sale)}>
												<Printer className='h-4 w-4 mr-1' />
												Receipt
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{filteredSales.length === 0 && (
						<div className='text-center py-8 text-brand-main-600'>
							No sales found matching your criteria.
						</div>
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
