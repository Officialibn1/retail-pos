import { SaleWithDetails } from "@/lib/services/sale.service";
import { dateTimeFormatter, formatNaira } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Eye, Printer, MoreVertical, RotateCcw } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TableProps {
	canSeeAll: boolean;
	handleViewSale: (sale: SaleWithDetails) => void;
	handlePrintReceipt: (sale: SaleWithDetails) => void;
	handleProcessReturn: (sale: SaleWithDetails) => void;
}

const getStatusBadge = (status: string) => {
	switch (status) {
		case "COMPLETED":
			return (
				<Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
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

export const salesHistoryTableDef = ({
	canSeeAll,
	handleViewSale,
	handlePrintReceipt,
	handleProcessReturn,
}: TableProps) => {
	const columnDef: ColumnDef<SaleWithDetails>[] = [
		{
			header: "Sale Number",
			accessorKey: "id",
			cell: ({ row }) => row.original.id.slice(0, 8),
		},
		...(canSeeAll
			? ([
					{
						header: "Sale Person",
						accessorKey: "user",
						cell: ({ row }) => row.original.user?.name || "N/A",
					},
				] satisfies ColumnDef<SaleWithDetails>[])
			: []),
		{
			header: "Order Time",
			accessorKey: "createdAt",
			cell: ({ row }) => dateTimeFormatter(row.original.createdAt),
		},
		{
			header: "Order Items",
			accessorKey: "items",
			cell: ({ row }) => `${row.original.items?.length || 0} Items`,
		},
		{
			header: "Payment",
			accessorKey: "paymentMethod",
		},
		{
			header: "Subtotal",
			accessorKey: "subTotal",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.subTotal)}
				</div>
			),
		},
		{
			header: "Tax",
			accessorKey: "taxAmount",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.taxAmount || 0)}
				</div>
			),
		},
		{
			header: "Discount",
			accessorKey: "discountAmount",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.discountAmount || 0)}
				</div>
			),
		},
		{
			header: "Total",
			accessorKey: "total",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.total)}
				</div>
			),
		},
		{
			header: "Total Paid",
			accessorKey: "amountPaid",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.amountPaid)}
				</div>
			),
		},
		{
			header: "Change Given",
			accessorKey: "changeGiven",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.changeGiven)}
				</div>
			),
		},
		{
			header: "Returned Qty",
			id: "returnedQty",
			cell: ({ row }) => {
				const totalQty = row.original.returns?.reduce(
					(sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0),
					0,
				) ?? 0;
				return (
					<div className='text-end w-full flex justify-end'>
						{totalQty > 0 ? (
							<span className='text-amber-700 font-medium'>{totalQty}</span>
						) : (
							<span className='text-brand-main-400'>—</span>
						)}
					</div>
				);
			},
		},
		{
			header: "Refunded",
			id: "refundedAmount",
			cell: ({ row }) => {
				const totalRefund = row.original.returns?.reduce(
					(sum, r) => sum + Number(r.refundAmount),
					0,
				) ?? 0;
				return (
					<div className='text-end w-full flex justify-end'>
						{totalRefund > 0 ? (
							<span className='text-amber-700 font-medium'>
								-{formatNaira(totalRefund)}
							</span>
						) : (
							<span className='text-brand-main-400'>—</span>
						)}
					</div>
				);
			},
		},
		{
			header: "Status",
			accessorKey: "status",
			cell: ({ row }) => getStatusBadge(row.original.status),
		},
		{
			header: "Actions",
			accessorKey: "id",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button
							size='sm'
							variant='ghost'
							className='text-brand-main-600 hover:bg-brand-main-100'>
							<MoreVertical className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem onClick={() => handleViewSale(row.original)}>
							<Eye className='h-4 w-4 mr-2' />
							View Details
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handlePrintReceipt(row.original)}>
							<Printer className='h-4 w-4 mr-2' />
							Print Receipt
						</DropdownMenuItem>
						{row.original.status === "COMPLETED" && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => handleProcessReturn(row.original)}
									className='text-amber-700 focus:text-amber-800 focus:bg-amber-50'>
									<RotateCcw className='h-4 w-4 mr-2' />
									Process Return
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return columnDef;
};
