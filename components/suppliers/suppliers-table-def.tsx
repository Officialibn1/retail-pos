import { ColumnDef } from "@tanstack/react-table";
import { SupplierWithCounts } from "@/lib/prisma-extended-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface TableDef {
	onView: (supplier: SupplierWithCounts) => void;
	onEdit: (supplier: SupplierWithCounts) => void;
	onDelete: (supplier: SupplierWithCounts) => void;
}

export const suppliersTableDef = ({
	onView,
	onEdit,
	onDelete,
}: TableDef): ColumnDef<SupplierWithCounts>[] => [
	{
		header: "Name",
		accessorKey: "name",
		cell: ({ row }) => (
			<span className="font-medium text-brand-main-900">
				{row.original.name}
			</span>
		),
	},
	{
		header: "Phone",
		accessorKey: "phone",
		cell: ({ row }) => row.original.phone || <span className="text-slate-400">—</span>,
	},
	{
		header: "Email",
		accessorKey: "email",
		cell: ({ row }) => row.original.email || <span className="text-slate-400">—</span>,
	},
	{
		header: "Address",
		accessorKey: "address",
		cell: ({ row }) =>
			row.original.address ? (
				<span className="truncate max-w-[200px] block">{row.original.address}</span>
			) : (
				<span className="text-slate-400">—</span>
			),
	},
	{
		header: "Items",
		accessorKey: "_count.inventoryItems",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original._count.inventoryItems}
			</Badge>
		),
	},
	{
		header: "Orders",
		accessorKey: "_count.purchaseOrders",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original._count.purchaseOrders}
			</Badge>
		),
	},
	{
		header: "Actions",
		accessorKey: "id",
		cell: ({ row }) => {
			const supplier = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreHorizontal className="h-4 w-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => onView(supplier)}
							className="text-brand-main-700">
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onEdit(supplier)}
							className="text-brand-main-700">
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onDelete(supplier)}
							className="text-red-600 focus:text-red-600">
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
