"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Plus, Package, ShoppingBag, Loader2, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
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
	useGetCategoriesQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,
} from "@/lib/store/api";
import { toast } from "sonner";
import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CategoryWithCount } from "@/lib/prisma-extended-types";
import DataTable from "@/components/dashboard/data-table";
import { categoriesTableDef } from "@/components/categories/categories-table-def";
import { useDebounce } from "@/hooks/use-debounce";

export default function CategoriesPage() {
	const { user } = useAuth();
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryWithCount | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// Refs for focus restoration (Requirement 10.5)
	const addButtonRef = React.useRef<HTMLButtonElement>(null);
	const editButtonRef = React.useRef<HTMLButtonElement>(null);
	const deleteButtonRef = React.useRef<HTMLButtonElement>(null);

	// RTK Query hooks for data fetching and mutations
	const {
		data: categoriesResponse,
		isLoading: loading,
		isFetching,
		isError,
		error: queryError,
	} = useGetCategoriesQuery({
		searchTerm: debouncedSearchTerm || undefined,
	});

	const [createCategory, { isLoading: isCreating }] =
		useCreateCategoryMutation();
	const [updateCategory, { isLoading: isUpdating }] =
		useUpdateCategoryMutation();
	const [deleteCategory] = useDeleteCategoryMutation();

	const categories = categoriesResponse?.categories || [];
	const totalCategories = categories.length;
	const totalItems = categories.reduce(
		(sum, category) => sum + category._count.inventoryItems,
		0,
	);

	const canModify =
		user?.roles.some((role: UserRole) =>
			(
				[UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] as UserRole[]
			).includes(role),
		) || false;

	const handleAddCategory = async (data: { name: string }) => {
		// Requirement 9.4: Display error notification for unauthorized operations
		if (!canModify) {
			toast.error("You don't have permission to create categories");
			return;
		}

		try {
			await createCategory(data).unwrap();
			setShowAddDialog(false);
			toast.success("Category created successfully");
			// Restore focus to add button (Requirement 10.5)
			setTimeout(() => addButtonRef.current?.focus(), 0);
		} catch (err: any) {
			console.error("Failed to create category:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to create category",
			);
		}
	};

	const handleEditCategory = (category: CategoryWithCount) => {
		setSelectedCategory(category);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (data: { name: string }) => {
		if (!selectedCategory) return;

		// Requirement 9.4: Display error notification for unauthorized operations
		if (!canModify) {
			toast.error("You don't have permission to edit categories");
			return;
		}

		try {
			await updateCategory({
				id: selectedCategory.id,
				data,
			}).unwrap();
			setShowEditDialog(false);
			setSelectedCategory(null);
			toast.success("Category updated successfully");
			// Focus restoration handled by Radix UI Dialog
		} catch (err: any) {
			console.error("Failed to update category:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to update category",
			);
		}
	};

	const handleDeleteCategory = (category: CategoryWithCount) => {
		setSelectedCategory(category);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!selectedCategory) return;

		// Requirement 9.4: Display error notification for unauthorized operations
		if (!canModify) {
			toast.error("You don't have permission to delete categories");
			return;
		}

		try {
			await deleteCategory(selectedCategory.id).unwrap();
			setShowDeleteDialog(false);
			setSelectedCategory(null);
			toast.success("Category deleted successfully");
			// Focus restoration handled by Radix UI AlertDialog
		} catch (err: any) {
			console.error("Failed to delete category:", err);
			toast.error(
				err.data?.error?.message || err.message || "Failed to delete category",
			);
		}
	};

	if (loading) {
		return (
			<div
				className='flex items-center justify-center h-64'
				role='status'
				aria-live='polite'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
				<span className='sr-only'>Loading categories...</span>
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			(queryError as any)?.data?.error?.message ||
			(queryError as any)?.message ||
			"Failed to load categories";
		return (
			<div
				className='space-y-6 p-6'
				role='alert'
				aria-live='assertive'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Categories
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
		<ProtectedRoute
			allowedRoles={[UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER]}>
			<div className='space-y-6 p-6'>
				<header className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-brand-main-900'>
							Categories Management
						</h1>
						<p className='text-brand-main-800 mt-1'>
							Manage product categories for your store
						</p>
					</div>
					{canModify && (
						<Button
							ref={addButtonRef}
							onClick={() => setShowAddDialog(true)}
							className='bg-brand-main-900 hover:bg-brand-main-700 text-white'
							aria-label='Add new category'>
							<Plus
								className='h-4 w-4 mr-2'
								aria-hidden='true'
							/>
							Add Category
						</Button>
					)}
				</header>

				{/* Summary Cards */}
				<section
					aria-label='Category statistics'
					className='grid gap-4 md:grid-cols-2'>
					<Card className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle>
								Total Categories
							</CardTitle>
							<Package
								className='h-4 w-4 text-brand-main-600'
								aria-hidden='true'
							/>
						</CardHeader>
						<CardContent>
							<div
								className='text-2xl font-bold text-brand-main-800'
								aria-label={`${totalCategories} total categories`}>
								{totalCategories}
							</div>
							<p className='text-xs text-brand-main-600'>Active categories</p>
						</CardContent>
					</Card>

					<Card className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle>
								Total Items
							</CardTitle>
							<ShoppingBag
								className='h-4 w-4 text-brand-main-600'
								aria-hidden='true'
							/>
						</CardHeader>
						<CardContent>
							<div
								className='text-2xl font-bold text-brand-main-800'
								aria-label={`${totalItems} total items`}>
								{totalItems}
							</div>
							<p className='text-xs text-brand-main-600'>
								Items across all categories
							</p>
						</CardContent>
					</Card>
				</section>

				{/* Categories Table - Will be implemented in Task 2 */}
				{categories.length === 0 ? (
					<Card className=' '>
						<CardHeader>
							<CardTitle className='text-brand-main-800'>
								No Categories Found
							</CardTitle>
							<CardDescription className='text-brand-main-600'>
								Get started by creating your first category.
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<Card className=' '>
						<CardContent>
							<div className='space-y-4'>
								<div className='flex gap-4'>
									<div className='relative flex-1'>
										<label
											htmlFor='category-search'
											className='sr-only'>
											Search categories
										</label>
										{isFetching ? (
											<Spinner
												className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground'
												aria-label='Loading categories'
											/>
										) : (
											<Search
												className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground'
												aria-hidden='true'
											/>
										)}

										<Input
											id='category-search'
											placeholder='Search categories...'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className='pl-8   focus:border-brand-main-400'
											aria-label='Search categories'
										/>
									</div>
								</div>

								<DataTable
									data={categories}
									columns={categoriesTableDef({
										canModify,
										onDelete: handleDeleteCategory,
										onEdit: handleEditCategory,
									})}
								/>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Add Category Dialog */}
				<AddCategoryDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSave={handleAddCategory}
					isCreating={isCreating}
				/>

				{/* Edit Category Dialog */}
				<EditCategoryDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					category={selectedCategory}
					onSave={handleSaveEdit}
					isUpdating={isUpdating}
				/>

				{/* Delete Confirmation Dialog */}
				<AlertDialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className='text-brand-main-800'>
								Delete Category
							</AlertDialogTitle>
							<AlertDialogDescription className='text-brand-main-600'>
								Are you sure you want to delete "{selectedCategory?.name}"? This
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
