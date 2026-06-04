import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Eye, MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ReturnWithDetails } from "@/lib/store/api";
import { SaleWithDetails } from "@/lib/services/sale.service";
import { dateTimeFormatter, formatNaira } from "@/lib/utils";

interface TableProps {
	canSeeAll: boolean;
	/** Opens the sale details dialog for the original sale */
	handleViewSale: (sale: SaleWithDetails) => void;
	/** Full sales list — used to look up the original sale when "View Sale" is clicked */
	sales: SaleWithDetails[];
}

const getRefundMethodBadge = (method: string) => {
	const label = method.replace(/_/g, " ");
	return (
		<Badge
			variant='outline'
			className='border-brand-main-200 text-brand-main-700 capitalize text-xs'>
			{label}
		</Badge>
	);
};

export const returnsTableDef = ({
	canSeeAll,
	handleViewSale,
	sales,
}: TableProps): ColumnDef<ReturnWithDetails>[] => [
	{
		header: "Return ID",
		accessorKey: "id",
		cell: ({ row }) => (
			<span className='font-mono text-xs text-brand-main-700'>
				#{row.original.id.slice(0, 8)}
			</span>
		),
	},
	{
		header: "Original Sale",
		accessorKey: "saleId",
		cell: ({ row }) => (
			<span className='font-mono text-xs text-brand-main-700'>
				#{row.original.saleId.slice(0, 8)}
			</span>
		),
	},
	{
		header: "Date",
		accessorKey: "createdAt",
		cell: ({ row }) => dateTimeFormatter(row.original.createdAt),
	},
	...(canSeeAll
		? ([
				{
					header: "Processed By",
					id: "processedBy",
					cell: ({ row }: { row: { original: ReturnWithDetails } }) =>
						row.original.processedBy.name,
				},
			] satisfies ColumnDef<ReturnWithDetails>[])
		: []),
	{
		header: "Customer",
		id: "customer",
		cell: ({ row }) => row.original.sale.customer?.name || "—",
	},
	{
		header: "Items Returned",
		id: "itemsReturned",
		cell: ({ row }) => {
			const total = row.original.items.reduce((sum, i) => sum + i.quantity, 0);
			return (
				<div className='text-end w-full flex justify-end font-medium'>
					{total}
				</div>
			);
		},
	},
	{
		header: "Refund Amount",
		accessorKey: "refundAmount",
		cell: ({ row }) => (
			<div className='text-end w-full flex justify-end font-medium text-amber-700'>
				{formatNaira(Number(row.original.refundAmount))}
			</div>
		),
	},
	{
		header: "Refund Method",
		accessorKey: "refundMethod",
		cell: ({ row }) => getRefundMethodBadge(row.original.refundMethod),
	},
	{
		header: "Reason",
		accessorKey: "reason",
		cell: ({ row }) => (
			<span
				className='text-sm text-brand-main-600 italic max-w-[200px] truncate block'
				title={row.original.reason}>
				{row.original.reason}
			</span>
		),
	},
	{
		header: "Actions",
		id: "actions",
		cell: ({ row }) => {
			const originalSale = sales.find((s) => s.id === row.original.saleId);
			return (
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
						<DropdownMenuItem
							onClick={() => originalSale && handleViewSale(originalSale)}
							disabled={!originalSale}>
							<Eye className='h-4 w-4 mr-2' />
							View Original Sale
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
