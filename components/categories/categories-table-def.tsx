import { CategoryWithCount } from "@/lib/services/category.service";
import { ColumnDef } from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface TableProps {
	canModify: boolean;
	onDelete: (category: CategoryWithCount) => void;
	onEdit: (category: CategoryWithCount) => void;
}

export const categoriesTableDef = ({
	canModify,
	onDelete,
	onEdit,
}: TableProps) => {
	const tableDef: ColumnDef<CategoryWithCount>[] = [
		{
			header: "Name",
			accessorKey: "name",
		},
		{
			header: "Item Count",
			accessorKey: "name",
			cell: ({ row }) => row.original._count.inventoryItems,
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
