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
import { Plus, Users, Loader2, Search } from "lucide-react";
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
	useGetCustomersQuery,
	useCreateCustomerMutation,
	useUpdateCustomerMutation,
	useDeleteCustomerMutation,
} from "@/lib/store/api";
import { toast } from "sonner";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { customersTableDef } from "@/components/customers/customers-table-def";
import DataTable from "@/components/dashboard/data-table";
import { CustomerWithSales } from "@/lib/services/customer.service";
import { useDebounce } from "@/hooks/use-debounce";

export default function CustomersPage() {
	const { user } = useAuth();
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedCustomer, setSelectedCustomer] =
		useState<CustomerWithSales | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// Refs for focus restoration (Requirement 10.5)
	const addButtonRef = React.useRef<HTMLButtonElement>(null);

	// RTK Query hooks for data fetching and mutations
	const {
		data: customersResponse,
		isLoading,
		isError,
		error: queryError,
		isFetching,
		refetch,
	} = useGetCustomersQuery({
		searchTerm: debouncedSearchTerm || undefined,
	});

	const [createCustomer, { isLoading: isCreating }] =
		useCreateCustomerMutation();
	const [updateCustomer, { isLoading: isUpdating }] =
		useUpdateCustomerMutation();
	const [deleteCustomer] = useDeleteCustomerMutation();

	const customers = customersResponse?.customers || [];

	const canModify =
		user?.roles.some((role: UserRole) =>
			(
				[UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] as UserRole[]
			).includes(role),
		) || false;

	const handleAddCustomer = async (data: {
		name?: string | null;
		phone?: string | null;
		email?: string | null;
	}) => {
		try {
			await createCustomer(data).unwrap();
			setShowAddDialog(false);
			toast.success("Customer created successfully");
			// Restore focus to add button (Requirement 10.5)
			setTimeout(() => addButtonRef.current?.focus(), 0);
		} catch (err: any) {
			console.error("Failed to create customer:", err);

			// Handle specific error cases
			const errorMessage = err.data?.error?.message || err.message;
			const errorCode = err.data?.error?.code;

			// Handle duplicate email error specifically
			if (
				errorCode === "DUPLICATE_EMAIL" ||
				(errorMessage?.toLowerCase().includes("email") &&
					errorMessage?.toLowerCase().includes("already exists"))
			) {
				toast.error("A customer with this email address already exists");
			} else if (errorCode === "VALIDATION_ERROR") {
				toast.error(errorMessage || "Invalid customer data provided");
			} else {
				toast.error(errorMessage || "Failed to create customer");
			}
		}
	};

	const handleEditCustomer = (customer: CustomerWithSales) => {
		setSelectedCustomer(customer);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (data: {
		name?: string | null;
		phone?: string | null;
		email?: string | null;
	}) => {
		if (!selectedCustomer) return;

		try {
			await updateCustomer({
				id: selectedCustomer.id,
				data,
			}).unwrap();
			setShowEditDialog(false);
			setSelectedCustomer(null);
			toast.success("Customer updated successfully");
			// Focus restoration handled by Radix UI Dialog
		} catch (err: any) {
			console.error("Failed to update customer:", err);

			// Handle specific error cases
			const errorMessage = err.data?.error?.message || err.message;
			const errorCode = err.data?.error?.code;

			// Handle duplicate email error specifically (Requirement 7.5)
			if (
				errorCode === "DUPLICATE_EMAIL" ||
				(errorMessage?.toLowerCase().includes("email") &&
					errorMessage?.toLowerCase().includes("already exists"))
			) {
				toast.error("A customer with this email address already exists");
			} else if (errorCode === "NOT_FOUND") {
				toast.error("Customer not found. It may have been deleted.");
				setShowEditDialog(false);
				setSelectedCustomer(null);
			} else if (errorCode === "VALIDATION_ERROR") {
				toast.error(errorMessage || "Invalid customer data provided");
			} else {
				toast.error(errorMessage || "Failed to update customer");
			}
		}
	};

	const handleDeleteCustomer = (customer: CustomerWithSales) => {
		setSelectedCustomer(customer);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!selectedCustomer) return;

		// Requirement 9.4: Display error notification for unauthorized operations
		if (!canModify) {
			toast.error("You don't have permission to delete customers");
			setShowDeleteDialog(false);
			setSelectedCustomer(null);
			return;
		}

		try {
			await deleteCustomer(selectedCustomer.id).unwrap();
			setShowDeleteDialog(false);
			setSelectedCustomer(null);
			toast.success("Customer deleted successfully");
			// Focus restoration handled by Radix UI AlertDialog
		} catch (err: any) {
			console.error("Failed to delete customer:", err);

			// Handle specific error cases
			const errorMessage = err.data?.error?.message || err.message;
			const errorCode = err.data?.error?.code;

			// Handle constraint violation error specifically (Requirement 8.4)
			if (
				errorCode === "CONSTRAINT_VIOLATION" ||
				errorMessage?.toLowerCase().includes("constraint") ||
				errorMessage?.toLowerCase().includes("foreign key")
			) {
				toast.error(
					"Cannot delete customer with existing sales records. Please remove associated sales first.",
					{ duration: 5000 },
				);
			} else if (errorCode === "NOT_FOUND") {
				toast.error("Customer not found. It may have already been deleted.");
				setShowDeleteDialog(false);
				setSelectedCustomer(null);
			} else {
				toast.error(errorMessage || "Failed to delete customer");
			}
		}
	};

	if (isLoading) {
		return (
			<div
				className='flex items-center justify-center h-64'
				role='status'
				aria-live='polite'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
				<span className='sr-only'>Loading customers...</span>
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			(queryError as any)?.data?.error?.message ||
			(queryError as any)?.message ||
			"Failed to load customers";
		return (
			<div
				className='space-y-6 p-6'
				role='alert'
				aria-live='assertive'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Customers
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
			allowedRoles={[
				UserRole.SUPERADMIN,
				UserRole.ADMIN,
				UserRole.MANAGER,
				UserRole.CASHIER,
			]}>
			<div className='space-y-6 p-6'>
				<header className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-brand-main-800'>
							Customers Management
						</h1>
						<p className='text-brand-main-600 mt-1'>
							Manage customer information and track sales history
						</p>
					</div>
					<Button
						ref={addButtonRef}
						onClick={() => setShowAddDialog(true)}
						className='bg-brand-main-600 hover:bg-brand-main-700 text-white'
						aria-label='Add new customer'>
						<Plus
							className='h-4 w-4 mr-2'
							aria-hidden='true'
						/>
						Add Customer
					</Button>
				</header>

				{/* Summary Cards */}
				<section
					aria-label='Customer statistics'
					className='grid gap-4 md:grid-cols-2'>
					<Card className='border-brand-main-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-brand-main-700'>
								Total Customers
							</CardTitle>
							<Users
								className='h-4 w-4 text-brand-main-600'
								aria-hidden='true'
							/>
						</CardHeader>
						<CardContent>
							<div
								className='text-2xl font-bold text-brand-main-800'
								aria-label={`${customers.length} total customers`}>
								{customers.length}
							</div>
							<p className='text-xs text-brand-main-600'>
								Registered customers
							</p>
						</CardContent>
					</Card>
				</section>

				{/* Customers Table - Will be implemented in Task 8 */}
				{customers.length === 0 ? (
					<Card className='border-brand-main-200'>
						<CardHeader>
							<CardTitle className='text-brand-main-800'>
								No Customers Found
							</CardTitle>
							<CardDescription className='text-brand-main-600'>
								Get started by creating your first customer.
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<Card className='border-brand-main-200'>
						<CardContent>
							<div className='space-y-4'>
								<div className='flex gap-4'>
									<div className='relative flex-1'>
										<label
											htmlFor='customer-search'
											className='sr-only'>
											Search customers
										</label>
										{isFetching ? (
											<Spinner
												className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500'
												aria-label='Loading customers'
											/>
										) : (
											<Search
												className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500'
												aria-hidden='true'
											/>
										)}

										<Input
											id='customer-search'
											placeholder='Search customers...'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className='pl-8 border-brand-main-200 focus:border-brand-main-400'
											aria-label='Search customers'
										/>
									</div>
								</div>

								<DataTable
									columns={customersTableDef({
										onDelete: handleDeleteCustomer,
										onEdit: handleEditCustomer,
										canModify,
									})}
									data={customers}
								/>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Add Customer Dialog */}
				<AddCustomerDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSave={handleAddCustomer}
					isCreating={isCreating}
				/>

				{/* Edit Customer Dialog */}
				<EditCustomerDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					customer={selectedCustomer}
					onSave={handleSaveEdit}
					isUpdating={isUpdating}
				/>

				{/* Delete Confirmation Dialog */}
				<AlertDialog
					open={showDeleteDialog}
					onOpenChange={(open) => {
						setShowDeleteDialog(open);
						// Preserve data when dialog is closed without confirming (Requirement 8.5)
						if (!open) {
							setSelectedCustomer(null);
						}
					}}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className='text-brand-main-800'>
								Delete Customer
							</AlertDialogTitle>
							<AlertDialogDescription className='text-brand-main-600'>
								Are you sure you want to delete "
								{selectedCustomer?.name ||
									selectedCustomer?.email ||
									"this customer"}
								"? This action cannot be undone.
								{selectedCustomer && selectedCustomer.sales.length > 0 && (
									<span className='block mt-2 text-red-600 font-medium'>
										Warning: This customer has {selectedCustomer.sales.length}{" "}
										associated sales. Deletion may fail due to database
										constraints.
									</span>
								)}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50'>
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
