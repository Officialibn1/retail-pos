"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Plus,
	Search,
	Truck,
	Package,
	ShoppingBag,
	Loader2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
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
	useGetSuppliersQuery,
	useCreateSupplierMutation,
	useUpdateSupplierMutation,
	useDeleteSupplierMutation,
} from "@/lib/store/api";
import { SupplierWithCounts } from "@/lib/prisma-extended-types";
import {
	CreateSupplierInput,
	UpdateSupplierInput,
} from "@/lib/validations/supplier.schema";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { EditSupplierDialog } from "@/components/suppliers/edit-supplier-dialog";
import { SupplierDetailDialog } from "@/components/suppliers/supplier-detail-dialog";
import DataTable from "@/components/dashboard/data-table";
import { suppliersTableDef } from "@/components/suppliers/suppliers-table-def";

export default function SuppliersPage() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearch = useDebounce(searchTerm, 300);

	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showDetailDialog, setShowDetailDialog] = useState(false);
	const [selectedSupplier, setSelectedSupplier] =
		useState<SupplierWithCounts | null>(null);

	const {
		data: suppliersData,
		isLoading,
		isFetching,
		isError,
		error,
	} = useGetSuppliersQuery({ searchTerm: debouncedSearch || undefined });

	const [createSupplier, { isLoading: isCreating }] =
		useCreateSupplierMutation();
	const [updateSupplier, { isLoading: isUpdating }] =
		useUpdateSupplierMutation();
	const [deleteSupplier, { isLoading: isDeleting }] =
		useDeleteSupplierMutation();

	const suppliers = suppliersData?.suppliers || [];

	const handleAddSupplier = async (data: CreateSupplierInput, form: any) => {
		try {
			await createSupplier(data).unwrap();
			form.reset();
			setShowAddDialog(false);
			toast.success("Supplier added successfully");
		} catch (err: any) {
			toast.error(err.data?.error?.message || "Failed to add supplier");
		}
	};

	const handleViewSupplier = (supplier: SupplierWithCounts) => {
		setSelectedSupplier(supplier);
		setShowDetailDialog(true);
	};

	const handleEditSupplier = (supplier: SupplierWithCounts) => {
		setSelectedSupplier(supplier);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (data: UpdateSupplierInput) => {
		if (!selectedSupplier) return;
		try {
			await updateSupplier({ id: selectedSupplier.id, data }).unwrap();
			setShowEditDialog(false);
			setSelectedSupplier(null);
			toast.success("Supplier updated successfully");
		} catch (err: any) {
			toast.error(err.data?.error?.message || "Failed to update supplier");
		}
	};

	const handleDeleteSupplier = (supplier: SupplierWithCounts) => {
		setSelectedSupplier(supplier);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!selectedSupplier) return;
		try {
			await deleteSupplier(selectedSupplier.id).unwrap();
			setShowDeleteDialog(false);
			setSelectedSupplier(null);
			toast.success("Supplier deleted successfully");
		} catch (err: any) {
			toast.error(err.data?.error?.message || "Failed to delete supplier");
		}
	};

	if (!user) return null;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-brand-main-600" />
			</div>
		);
	}

	if (isError) {
		const msg =
			(error as any)?.data?.error?.message || "Failed to load suppliers";
		return (
			<div className="space-y-6 p-6">
				<Card className="border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="text-red-800">Error Loading Suppliers</CardTitle>
						<p className="text-red-700">{msg}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const columns = suppliersTableDef({
		onView: handleViewSupplier,
		onEdit: handleEditSupplier,
		onDelete: handleDeleteSupplier,
	});

	return (
		<ProtectedRoute allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]}>
			<div className="space-y-6 p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-brand-main-950">
							Suppliers
						</h1>
						<p className="text-brand-main-800 mt-1">
							Manage your inventory suppliers
						</p>
					</div>
					<Button
						onClick={() => setShowAddDialog(true)}
						className="bg-brand-main-900 hover:bg-brand-main-700 text-white">
						<Plus className="h-4 w-4 mr-2" />
						Add Supplier
					</Button>
				</div>

				{/* Summary cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Total Suppliers
							</CardTitle>
							<Truck className="h-4 w-4 text-brand-main-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{suppliersData?.count ?? 0}
							</div>
							<p className="text-xs text-slate-500">Active suppliers</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Items Linked
							</CardTitle>
							<Package className="h-4 w-4 text-brand-main-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{suppliers.reduce((sum, s) => sum + s._count.inventoryItems, 0)}
							</div>
							<p className="text-xs text-slate-500">
								Inventory items with a supplier
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Purchase Orders
							</CardTitle>
							<ShoppingBag className="h-4 w-4 text-brand-main-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{suppliers.reduce((sum, s) => sum + s._count.purchaseOrders, 0)}
							</div>
							<p className="text-xs text-slate-500">
								Total orders across all suppliers
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Table */}
				<Card>
					<CardHeader>
						<div className="flex gap-4 mt-2">
							<div className="relative flex-1">
								{isFetching ? (
									<Spinner className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								) : (
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								)}
								<Input
									placeholder="Search by name, phone or email..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 focus:border-brand-main-400"
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={columns}
							data={suppliers}
							tableName="Suppliers"
						/>
					</CardContent>
				</Card>

				{/* Dialogs */}
				<AddSupplierDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSave={handleAddSupplier}
					isCreating={isCreating}
				/>

				<EditSupplierDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					supplier={selectedSupplier}
					onSave={handleSaveEdit}
					isUpdating={isUpdating}
				/>

				<SupplierDetailDialog
					supplierId={selectedSupplier?.id ?? null}
					open={showDetailDialog}
					onOpenChange={(v) => {
						setShowDetailDialog(v);
						if (!v) setSelectedSupplier(null);
					}}
				/>

				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="text-brand-main-800">
								Delete Supplier
							</AlertDialogTitle>
							<AlertDialogDescription className="text-brand-main-600">
								Are you sure you want to delete "{selectedSupplier?.name}"? This
								will unlink all associated inventory items. Purchase order
								history will be preserved.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="text-brand-main-700 hover:bg-brand-main-50">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									confirmDelete();
								}}
								disabled={isDeleting}
								className="bg-red-600 hover:bg-red-700 text-white">
								{isDeleting ? <Spinner className="h-4 w-4" /> : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</ProtectedRoute>
	);
}
