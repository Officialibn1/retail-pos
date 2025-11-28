"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Plus,
	Package,
	AlertTriangle,
	DollarSign,
	Loader2,
} from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";
import { EditItemDialog } from "@/components/inventory/edit-item-dialog";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import type { InventoryItem } from "@/lib/types";
import type { InventoryItemWithCategory } from "@/lib/services/inventory.service";
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
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function InventoryPage() {
	const { user } = useAuth();
	const { toast } = useToast();
	const [inventory, setInventory] = useState<InventoryItemWithCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedItem, setSelectedItem] =
		useState<InventoryItemWithCategory | null>(null);

	const fetchInventory = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.get<InventoryItemWithCategory[]>("/api/inventory");
			setInventory(data);
		} catch (err: any) {
			console.error("Failed to fetch inventory:", err);
			setError(err.message || "Failed to load inventory");
			toast({
				title: "Error",
				description: err.message || "Failed to load inventory",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchInventory();
		}
	}, [user]);

	const totalItems = inventory.length;
	const lowStockItems = inventory.filter((item) => item.stock < 10).length;
	const outOfStockItems = inventory.filter((item) => item.stock === 0).length;
	const totalValue = inventory.reduce(
		(sum, item) => sum + item.price * item.stock,
		0,
	);

	const handleAddItem = async (
		newItem: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
	) => {
		try {
			await api.post<InventoryItem>("/api/inventory", newItem);
			// Refresh inventory to get the item with category
			await fetchInventory();
			setShowAddDialog(false);
			toast({
				title: "Success",
				description: "Item added successfully",
			});
		} catch (err: any) {
			console.error("Failed to add item:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to add item",
				variant: "destructive",
			});
		}
	};

	const handleEditItem = (item: InventoryItemWithCategory) => {
		setSelectedItem(item);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (updatedItem: InventoryItem) => {
		try {
			await api.put<InventoryItemWithCategory>(
				`/api/inventory/${updatedItem.id}`,
				updatedItem,
			);
			// Refresh inventory to get the item with category
			await fetchInventory();
			setShowEditDialog(false);
			setSelectedItem(null);
			toast({
				title: "Success",
				description: "Item updated successfully",
			});
		} catch (err: any) {
			console.error("Failed to update item:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to update item",
				variant: "destructive",
			});
		}
	};

	const handleDeleteItem = (item: InventoryItemWithCategory) => {
		setSelectedItem(item);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!selectedItem) return;

		try {
			await api.delete(`/api/inventory/${selectedItem.id}`);
			setInventory(inventory.filter((item) => item.id !== selectedItem.id));
			setShowDeleteDialog(false);
			setSelectedItem(null);
			toast({
				title: "Success",
				description: "Item deleted successfully",
			});
		} catch (err: any) {
			console.error("Failed to delete item:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to delete item",
				variant: "destructive",
			});
		}
	};

	if (!user) return null;

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-lunar-green-600' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Inventory
						</CardTitle>
						<CardDescription className='text-red-700'>{error}</CardDescription>
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
						<h1 className='text-3xl font-bold text-lunar-green-800'>
							Inventory Management
						</h1>
						<p className='text-lunar-green-600 mt-1'>
							Manage your store's product inventory
						</p>
					</div>
					<Button
						onClick={() => setShowAddDialog(true)}
						className='bg-lunar-green-600 hover:bg-lunar-green-700 text-white'>
						<Plus className='h-4 w-4 mr-2' />
						Add Item
					</Button>
				</div>

				{/* Summary Cards */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card className='border-lunar-green-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-lunar-green-700'>
								Total Items
							</CardTitle>
							<Package className='h-4 w-4 text-lunar-green-600' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-lunar-green-800'>
								{totalItems}
							</div>
							<p className='text-xs text-lunar-green-600'>Active products</p>
						</CardContent>
					</Card>

					<Card className='border-lunar-green-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-lunar-green-700'>
								Low Stock
							</CardTitle>
							<AlertTriangle className='h-4 w-4 text-amber-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-lunar-green-800'>
								{lowStockItems}
							</div>
							<p className='text-xs text-lunar-green-600'>
								Items below 10 units
							</p>
						</CardContent>
					</Card>

					<Card className='border-lunar-green-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-lunar-green-700'>
								Out of Stock
							</CardTitle>
							<AlertTriangle className='h-4 w-4 text-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-lunar-green-800'>
								{outOfStockItems}
							</div>
							<p className='text-xs text-lunar-green-600'>
								Items with 0 quantity
							</p>
						</CardContent>
					</Card>

					<Card className='border-lunar-green-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-lunar-green-700'>
								Total Value
							</CardTitle>
							<DollarSign className='h-4 w-4 text-lunar-green-600' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-lunar-green-800'>
								{formatNaira(totalValue)}
							</div>
							<p className='text-xs text-lunar-green-600'>Inventory worth</p>
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

				{/* Inventory Table */}
				<InventoryTable
					items={inventory}
					onEdit={handleEditItem}
					onDelete={handleDeleteItem}
				/>

				{/* Dialogs */}
				<AddItemDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSave={handleAddItem}
				/>

				<EditItemDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					item={selectedItem}
					onSave={handleSaveEdit}
				/>

				<AlertDialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className='text-lunar-green-800'>
								Delete Item
							</AlertDialogTitle>
							<AlertDialogDescription className='text-lunar-green-600'>
								Are you sure you want to delete "{selectedItem?.name}"? This
								action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className='border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50'>
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
