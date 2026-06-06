"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Plus,
	Package,
	AlertTriangle,
	DollarSign,
	Loader2,
	Search,
} from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";
import { EditItemDialog } from "@/components/inventory/edit-item-dialog";
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import { formatNaira } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	useGetInventoryQuery,
	useGetCategoriesQuery,
	useCreateInventoryItemMutation,
	useUpdateInventoryItemMutation,
	useDeleteInventoryItemMutation,
	useAdjustStockMutation,
} from "@/lib/store/api";
import { CreateInventoryItemInput, UpdateInventoryItemInput, AdjustStockInput } from "@/lib/validations/inventory.schema";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/dashboard/data-table";
import { inventoryTableDef } from "@/components/inventory/inventory-table-def";

export default function InventoryPage() {
	const { user } = useAuth();
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showAdjustStockDialog, setShowAdjustStockDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedItem, setSelectedItem] =
		useState<InventoryItemWithCategory | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");

	const [debounceSearchTerm] = useDebounce(searchTerm, 300);

	// RTK Query hooks for data fetching and mutations
	const {
		data: inventory = [],
		isLoading: loading,
		isFetching,
		isError,
		error: queryError,
	} = useGetInventoryQuery({
		searchTerm: debounceSearchTerm,
		category: categoryFilter === "all" ? undefined : categoryFilter,
	});

	const {
		data: categoriesData,
		isLoading: categoriesLoading,
		isError: categoriesError,
	} = useGetCategoriesQuery();

	const [createInventoryItem, { isLoading: isCreatingItem }] =
		useCreateInventoryItemMutation();
	const [updateInventoryItem, { isLoading: isUpdatingItem }] =
		useUpdateInventoryItemMutation();
	const [deleteInventoryItem] = useDeleteInventoryItemMutation();
	const [adjustStock, { isLoading: isAdjustingStock }] =
		useAdjustStockMutation();

	const totalItems = inventory.length;
	const lowStockItems = inventory.filter((item) => item.stock > 0 && item.stock <= item.reorderLevel).length;
	const outOfStockItems = inventory.filter((item) => item.stock === 0).length;
	const totalValue = inventory.reduce(
		(sum, item) => sum + item.price * item.stock,
		0,
	);

	// Extract categories from the API response
	const categories = categoriesData?.categories || [];

	const handleAddItem = async (newItem: CreateInventoryItemInput) => {
		try {
			await createInventoryItem(newItem).unwrap();
			setShowAddDialog(false);
			toast.success("Item added successfully");
		} catch (err: any) {
			console.error("Failed to add item:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to add item",
			);
		}
	};

	const handleEditItem = (item: InventoryItemWithCategory) => {
		setSelectedItem(item);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (updatedData: UpdateInventoryItemInput) => {
		if (!selectedItem) return;

		try {
			await updateInventoryItem({
				id: selectedItem.id,
				data: updatedData,
			}).unwrap();
			setShowEditDialog(false);
			setSelectedItem(null);
			toast.success("Item updated successfully");
		} catch (err: any) {
			console.error("Failed to update item:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to update item",
			);
		}
	};

	const handleAdjustStock = (item: InventoryItemWithCategory) => {
		setSelectedItem(item);
		setShowAdjustStockDialog(true);
	};

	const handleSaveAdjustStock = async (
		itemId: string,
		data: AdjustStockInput,
	) => {
		try {
			await adjustStock({ id: itemId, data }).unwrap();
			setShowAdjustStockDialog(false);
			setSelectedItem(null);
			toast.success("Stock adjusted successfully");
		} catch (err: any) {
			console.error("Failed to adjust stock:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to adjust stock",
			);
		}
	};

	const handleDeleteItem = (item: InventoryItemWithCategory) => {
		setSelectedItem(item);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!selectedItem) return;

		try {
			await deleteInventoryItem(selectedItem.id).unwrap();
			setShowDeleteDialog(false);
			setSelectedItem(null);
			toast.success("Item deleted successfully");
		} catch (err: any) {
			console.error("Failed to delete item:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to delete item",
			);
		}
	};

	if (!user) return null;

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			(queryError as any)?.data?.error?.message ||
			(queryError as any)?.message ||
			"Failed to load inventory";
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Inventory
						</CardTitle>
						<CardDescription className='text-red-700'>
							{errorMessage}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<ProtectedRoute allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]}>
			<div className='space-y-6 p-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-brand-main-950'>
							Inventory Management
						</h1>
						<p className='text-brand-main-800 mt-1'>
							Manage your store's product inventory
						</p>
					</div>
					<Button
						onClick={() => setShowAddDialog(true)}
						className='bg-brand-main-900 hover:bg-brand-main-700 text-white'>
						<Plus className='h-4 w-4 mr-2' />
						Add Item
					</Button>
				</div>

				{/* Summary Cards */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-slate-600'>
								Total Items
							</CardTitle>
							<Package className='h-4 w-4 text-brand-main-600' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-brand-main-800'>
								{totalItems}
							</div>
							<p className='text-xs text-slate-500'>Active products</p>
						</CardContent>
					</Card>

					<Card className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-slate-600'>
								Low Stock
							</CardTitle>
							<AlertTriangle className='h-4 w-4 text-amber-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-brand-main-800'>
								{lowStockItems}
							</div>
							<p className='text-xs text-slate-500'>
								Items below 10 units
							</p>
						</CardContent>
					</Card>

					<Card className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-slate-600'>
								Out of Stock
							</CardTitle>
							<AlertTriangle className='h-4 w-4 text-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-brand-main-800'>
								{outOfStockItems}
							</div>
							<p className='text-xs text-slate-500'>
								Items with 0 quantity
							</p>
						</CardContent>
					</Card>

					<Card className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-slate-600'>
								Total Value
							</CardTitle>
							<DollarSign className='h-4 w-4 text-brand-main-600' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-brand-main-800'>
								{formatNaira(totalValue)}
							</div>
							<p className='text-xs text-slate-500'>Inventory worth</p>
						</CardContent>
					</Card>
				</div>

				{/* Low Stock Alert */}
				{lowStockItems > 0 && (
					<Card className='border-amber-200 bg-amber-50'>
						<CardHeader>
							<CardTitle className='text-amber-800 flex items-center gap-2'>
								<AlertTriangle className='h-5 w-5' />
								Low Stock Alert
							</CardTitle>
							<CardDescription className='text-amber-700'>
								You have {lowStockItems} items running low on stock. Consider
								restocking soon.
							</CardDescription>
						</CardHeader>
					</Card>
				)}

				<Card className=' '>
					<CardHeader>
						<div className='flex gap-4 mt-4'>
							<div className='relative flex-1'>
								{isFetching ? (
									<Spinner className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								) : (
									<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								)}

								<Input
									placeholder='Search items...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='pl-8   focus:border-brand-main-400'
								/>
							</div>
							<Select
								value={categoryFilter}
								onValueChange={setCategoryFilter}>
								<SelectTrigger className='w-48   focus:border-brand-main-400'>
									<SelectValue placeholder='All Categories' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Categories</SelectItem>
									{categories.map((category) => (
										<SelectItem
											key={category.id}
											value={category.name}>
											{category.name} ({category._count.inventoryItems})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={inventoryTableDef({
								handleDeleteItem,
								handleEditItem,
								handleAdjustStock,
							})}
							data={inventory}
						/>
					</CardContent>
				</Card>

				{/* Dialogs */}
				<AddItemDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSave={handleAddItem}
					isCreatingItem={isCreatingItem}
				/>

				<EditItemDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					item={selectedItem}
					onSave={handleSaveEdit}
					isUpdating={isUpdatingItem}
				/>

				<AdjustStockDialog
					open={showAdjustStockDialog}
					onOpenChange={setShowAdjustStockDialog}
					item={selectedItem}
					onSave={handleSaveAdjustStock}
					isAdjusting={isAdjustingStock}
				/>

				<AlertDialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className='text-brand-main-800'>
								Delete Item
							</AlertDialogTitle>
							<AlertDialogDescription className='text-brand-main-600'>
								Are you sure you want to delete "{selectedItem?.name}"? This
								action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className='  text-brand-main-700 hover:bg-brand-main-50'>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDelete}
								className='bg-red-600 hover:bg-red-700 text-white'>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</ProtectedRoute>
	);
}
