import { SaleWithDetails } from "@/lib/services/sale.service";
import { dateTimeFormatter, formatNaira } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Printer } from "lucide-react";

interface TableProps {
	canSeeAll: boolean;
	handleViewSale: (sale: SaleWithDetails) => void;
	handlePrintReceipt: (sale: SaleWithDetails) => void;
}

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

export const salesHistoryTableDef = ({
	canSeeAll,
	handleViewSale,
	handlePrintReceipt,
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
			header: "Total Paid",
			accessorKey: "amountPaid",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.amountPaid)}
				</div>
			),
		},
		{
			header: "Tax Paid",
			accessorKey: "taxAmount",
			cell: ({ row }) => (
				<div className='text-end w-full flex justify-end'>
					{formatNaira(row.original.taxAmount || 0)}
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
			header: "Status",
			accessorKey: "status",
			cell: ({ row }) => getStatusBadge(row.original.status),
		},
		{
			header: "Actions",
			accessorKey: "id",
			cell: ({ row }) => (
				<div className='flex w-full gap-3 items-center '>
					<Button
						size='sm'
						variant='ghost'
						className='text-brand-main-600 hover:bg-brand-main-100'
						onClick={() => handleViewSale(row.original)}>
						<Eye className='h-4 w-4 mr-1' />
						View
					</Button>
					<Button
						size='sm'
						variant='ghost'
						className='text-brand-main-600 hover:bg-brand-main-100'
						onClick={() => handlePrintReceipt(row.original)}>
						<Printer className='h-4 w-4 mr-1' />
						Receipt
					</Button>
				</div>
			),
		},
	];

	return columnDef;
};
