import { ColumnDef } from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { CustomerWithSales } from "@/lib/services/customer.service";

interface TableProps {
	canModify: boolean;
	onDelete: (customer: CustomerWithSales) => void;
	onEdit: (customer: CustomerWithSales) => void;
}

export const customersTableDef = ({
	canModify,
	onDelete,
	onEdit,
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
							<DropdownMenuTrigger className='ml-auto'>
								<Button
									variant='ghost'
									size='sm'
									className='text-brand-main-600 hover:bg-brand-main-100 '
									aria-label={`Actions for ${row.original.name}`}>
									<MoreHorizontal className='h-4 w-4' />
									<span className='sr-only'>Open actions menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem
									onClick={() => onEdit(row.original)}
									className='text-brand-main-700'>
									<Edit
										className='h-4 w-4 mr-2'
										aria-hidden='true'
									/>
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => onDelete(row.original)}
									className='text-red-600 focus:text-red-600'>
									<Trash2
										className='h-4 w-4 mr-2'
										aria-hidden='true'
									/>
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
