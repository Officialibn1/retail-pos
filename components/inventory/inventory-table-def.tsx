import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";
import { formatNaira, getStockStatus } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
	AlertTriangle,
	Edit,
	MoreHorizontal,
	Trash2,
	Package,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

interface TableDef {
	handleEditItem: (item: InventoryItemWithCategory) => void;
	handleDeleteItem: (item: InventoryItemWithCategory) => void;
	handleAdjustStock: (item: InventoryItemWithCategory) => void;
}

export const inventoryTableDef = ({
	handleEditItem,
	handleDeleteItem,
	handleAdjustStock,
}: TableDef) => {
	const column: ColumnDef<InventoryItemWithCategory>[] = [
		{
			header: "Product",
			accessorKey: "name",
		},
		{
			header: "SKU",
			accessorKey: "sku",
		},
		{
			header: "Description",
			accessorKey: "description",
			cell: ({ row }) => row.original.description || "N/A",
		},
		{
			header: "Category",
			accessorKey: "category",
			cell: ({ row }) => row.original.category?.name || "N/A",
		},
		{
			header: "Price",
			accessorKey: "price",
			cell: ({ row }) => (
				<div className='flex w-full justify-end text-end'>
					{formatNaira(row.original.price)}
				</div>
			),
		},
		{
			header: "Stock",
			accessorKey: "stock",
			cell: ({ row }) => (
				<div className='flex items-center gap-2 justify-end'>
					{row.original.stock < 10 && (
						<AlertTriangle className='h-4 w-4 text-amber-500 mr-auto' />
					)}
					{row.original.stock}
				</div>
			),
		},
		{
			header: "Status",
			accessorKey: "stock",
			cell: ({ row }) => {
				const stockStatus = getStockStatus(row.original.stock);

				return (
					<Badge
						variant={stockStatus.variant}
						className={
							stockStatus.variant === "destructive"
								? "bg-red-100 text-red-800 hover:bg-red-100"
								: stockStatus.variant === "secondary"
									? "bg-amber-100 text-amber-800 hover:bg-amber-100"
									: "bg-green-100 text-green-800 hover:bg-green-100"
						}>
						{stockStatus.label}
					</Badge>
				);
			},
		},
		{
			header: "Actions",
			accessorKey: "id",
			cell: ({ row }) => {
				const item = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button
								variant='ghost'
								size='sm'
								className='text-brand-main-600 hover:bg-brand-main-100'>
								<MoreHorizontal className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem
								onClick={() => handleEditItem(item)}
								className='text-brand-main-700'>
								<Edit className='h-4 w-4 mr-2' />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleAdjustStock(item)}
								className='text-brand-main-700'>
								<Package className='h-4 w-4 mr-2' />
								Adjust Stock
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => handleDeleteItem(item)}
								className='text-red-600 focus:text-red-600'>
								<Trash2 className='h-4 w-4 mr-2 text-red-600 focus:text-red-600' />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return column;
};
