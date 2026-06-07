import { ColumnDef } from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { CustomerWithSales } from "@/lib/services/customer.service";
import { formatNaira } from "@/lib/utils";
import { getSpendingTier } from "@/lib/spending-tier";

interface TableProps {
	canModify: boolean;
	onDelete: (customer: CustomerWithSales) => void;
	onEdit: (customer: CustomerWithSales) => void;
	currencySymbol?: string;
}

export const customersTableDef = ({
	canModify,
	onDelete,
	onEdit,
	currencySymbol = "₦",
}: TableProps) => {
	const tableDef: ColumnDef<CustomerWithSales>[] = [
		{
			header: "Name",
			accessorKey: "name",
			cell: ({ row }) => row.original.name || "N/A",
		},
		{
			header: "Email",
			accessorKey: "email",
			cell: ({ row }) => row.original.email || "N/A",
		},
		{
			header: "Phone",
			accessorKey: "phone",
			cell: ({ row }) => row.original.phone || "N/A",
		},
		{
			header: "Total Spend",
			accessorKey: "id",
			cell: ({ row }) => {
				const totalSpend = row.original.sales
					.filter((s) => s.status === "COMPLETED")
					.reduce((sum, s) => sum + Number(s.total), 0);
				return (
					<span className='font-medium'>
						{formatNaira(totalSpend, currencySymbol)}
					</span>
				);
			},
		},
		{
			header: "Loyalty Tier",
			accessorKey: "id",
			cell: ({ row }) => {
				const totalSpend = row.original.sales
					.filter((s) => s.status === "COMPLETED")
					.reduce((sum, s) => sum + Number(s.total), 0);
				const tier = getSpendingTier(totalSpend);
				const remaining = tier.nextTierThreshold
					? tier.nextTierThreshold - totalSpend
					: null;
				return (
					<div className='flex flex-col gap-0.5'>
						<Badge
							variant='outline'
							className={`w-fit text-xs font-medium ${tier.className}`}>
							{tier.label}
						</Badge>
						{remaining !== null && (
							<span className='text-[10px] text-muted-foreground'>
								{formatNaira(remaining, currencySymbol)} to next tier
							</span>
						)}
					</div>
				);
			},
		},
		{
			header: "Sales Count",
			accessorKey: "id",
			cell: ({ row }) => row.original.sales.length,
		},
		{
			header: "Actions",
			accessorKey: "id",
			cell: ({ row }) =>
				canModify ? (
					<div className='w-full flex'>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Button
									variant='ghost'
									size='sm'
									className='text-brand-main-600 hover:bg-brand-main-100'
									aria-label={`Actions for ${row.original.name}`}>
									<MoreHorizontal className='h-4 w-4' />
									<span className='sr-only'>Open actions menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem
									onClick={() => onEdit(row.original)}
									className='text-brand-main-700'>
									<Edit className='h-4 w-4 mr-2' aria-hidden='true' />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => onDelete(row.original)}
									className='text-red-600 focus:text-red-600'>
									<Trash2 className='h-4 w-4 mr-2' aria-hidden='true' />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<div className='w-full flex text-right text-sm text-brand-main-500'>
						No actions available
					</div>
				),
		},
	];

	return tableDef;
};
