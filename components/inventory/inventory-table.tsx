"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Search,
	MoreHorizontal,
	Edit,
	Trash2,
	AlertTriangle,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";

interface InventoryTableProps {
	items: InventoryItemWithCategory[];
	onEdit: (item: InventoryItemWithCategory) => void;
	onDelete: (item: InventoryItemWithCategory) => void;
	searchTerm: string;
	setSearchTerm: (item: string) => void;
	categoryFilter: string;
	setCategoryFilter: (item: string) => void;
	isFetching: boolean;
}

export function InventoryTable({
	items,
	onEdit,
	onDelete,
	searchTerm,
	setSearchTerm,
	isFetching,
	setCategoryFilter,
	categoryFilter,
}: InventoryTableProps) {
	const categories = Array.from(
		new Set(items.map((item) => item.category?.name).filter(Boolean)),
	) as string[];

	const getStockStatus = (stock: number) => {
		if (stock === 0)
			return { label: "Out of Stock", variant: "destructive" as const };
		if (stock < 10)
			return { label: "Low Stock", variant: "secondary" as const };
		return { label: "In Stock", variant: "default" as const };
	};

	return (
		<Card className=' '>
			<CardHeader>
				<CardTitle className='text-brand-main-800'>Inventory Items</CardTitle>
				<div className='flex gap-4 mt-4'>
					<div className='relative flex-1'>
						{isFetching ? (
							<Spinner className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
						) : (
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
						)}

						<Input
							placeholder='Search items...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-8   focus:border-brand-main-400'
						/>
					</div>
					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className='px-3 py-2 border   rounded-md text-sm focus:border-brand-main-400 focus:outline-none'>
						<option value='all'>All Categories</option>
						{categories.map((category) => (
							<option
								key={category}
								value={category}>
								{category}
							</option>
						))}
					</select>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow className=' '>
							<TableHead className='text-brand-main-700'>Product</TableHead>
							<TableHead className='text-brand-main-700'>SKU</TableHead>
							<TableHead className='text-brand-main-700'>Category</TableHead>
							<TableHead className='text-brand-main-700'>Price</TableHead>
							<TableHead className='text-brand-main-700'>Stock</TableHead>
							<TableHead className='text-brand-main-700'>Status</TableHead>
							<TableHead className='text-brand-main-700'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item) => {
							const stockStatus = getStockStatus(item.stock);
							return (
								<TableRow
									key={item.id}
									className='border-brand-main-100'>
									<TableCell>
										<div>
											<div className='font-medium text-brand-main-800'>
												{item.name}
											</div>
											{item.description && (
												<div className='text-sm text-brand-main-600'>
													{item.description}
												</div>
											)}
										</div>
									</TableCell>
									<TableCell className='text-brand-main-700'>
										{item.sku}
									</TableCell>
									<TableCell className='text-brand-main-700'>
										{item.category?.name || "Uncategorized"}
									</TableCell>
									<TableCell className='text-brand-main-700'>
										{formatNaira(Number(item.price))}
									</TableCell>
									<TableCell className='text-brand-main-700'>
										<div className='flex items-center gap-2'>
											{item.stock}
											{item.stock < 10 && (
												<AlertTriangle className='h-4 w-4 text-amber-500' />
											)}
										</div>
									</TableCell>
									<TableCell>
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
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='ghost'
													size='sm'
													className='text-brand-main-600 hover:bg-brand-main-100'>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem
													onClick={() => onEdit(item)}
													className='text-brand-main-700'>
													<Edit className='h-4 w-4 mr-2' />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => onDelete(item)}
													className='text-red-600 focus:text-red-600'>
													<Trash2 className='h-4 w-4 mr-2' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				{items.length === 0 && (
					<div className='text-center py-8 text-brand-main-600'>
						No items found matching your search criteria.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
