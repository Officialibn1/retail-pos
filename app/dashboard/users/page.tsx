"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canManageUsers } from "@/lib/auth";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	useGetUsersQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useUpdateUserStatusMutation,
} from "@/lib/store/api";
import DataTable from "@/components/dashboard/data-table";
import { usersTableDef } from "@/components/users/users-table-def";
import { UserWithoutPassword } from "@/lib/prisma-extended-types";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { UpdateStatusDialog } from "@/components/users/update-status-dialog";
import {
	CreateUserInput,
	UpdateUserInput,
} from "@/lib/validations/user.schema";
import { UserStatus } from "@/lib/types";
import { toast } from "sonner";

export default function UsersPage() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// Modal state
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showStatusDialog, setShowStatusDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(
		null,
	);

	// RTK Query hooks
	const {
		data: usersData,
		isLoading,
		isFetching,
		isError,
		error,
	} = useGetUsersQuery(
		{
			searchTerm: debouncedSearchTerm || undefined,
			role: roleFilter !== "all" ? roleFilter : undefined,
		},
		{
			skip: !user || !canManageUsers(user.roles),
		},
	);

	const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
	const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
	const [updateUserStatus] = useUpdateUserStatusMutation();

	if (!user || !canManageUsers(user.roles)) {
		return (
			<div className='flex items-center justify-center h-64'>
				<p className='text-brand-main-600'>
					You don't have permission to access this page.
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			(error as any)?.data?.error?.message ||
			(error as any)?.data?.message ||
			"Failed to load users";
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>Error Loading Users</CardTitle>
						<p className='text-red-700'>{errorMessage}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Use server-filtered data directly
	const users = usersData?.users || [];

	const morningShiftUsers = users.filter((u) => u.shift === "MORNING").length;
	const eveningShiftUsers = users.filter((u) => u.shift === "EVENING").length;

	const handleAddUser = async (data: CreateUserInput) => {
		try {
			await createUser(data).unwrap();
			setShowAddDialog(false);
			toast.success("User created successfully");
		} catch (err: any) {
			console.error("Failed to create user:", err);
			const errorMessage =
				err?.data?.error?.message ||
				err?.data?.message ||
				"Failed to create user";
			toast.error(errorMessage);
		}
	};

	const handleEditUser = (userToEdit: UserWithoutPassword) => {
		setSelectedUser(userToEdit);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (data: UpdateUserInput) => {
		if (!selectedUser) return;

		try {
			await updateUser({
				id: selectedUser.id,
				data,
			}).unwrap();
			setShowEditDialog(false);
			setSelectedUser(null);
			toast.success("User updated successfully");
		} catch (err: any) {
			console.error("Failed to update user:", err);
			const errorMessage =
				err?.data?.error?.message ||
				err?.data?.message ||
				"Failed to update user";
			toast.error(errorMessage);
		}
	};

	const handleDeleteUser = (userId: string) => {
		const userToDelete = users.find((u) => u.id === userId);
		if (userToDelete) {
			setSelectedUser(userToDelete);
			setShowDeleteDialog(true);
		}
	};

	const handleUpdateStatus = (userToUpdate: UserWithoutPassword) => {
		setSelectedUser(userToUpdate);
		setShowStatusDialog(true);
	};

	const handleStatusUpdate = async (userId: string, newStatus: UserStatus) => {
		try {
			await updateUserStatus({
				userId,
				status: newStatus,
			}).unwrap();

			// Get status display name for toast
			const statusDisplayName =
				newStatus === UserStatus.ACTIVE
					? "Active"
					: newStatus === UserStatus.SUSPENDED
						? "Suspended"
						: "Blocked";

			// Get user name for toast
			const userName = selectedUser?.name || "User";

			toast.success(
				`${userName}'s status has been changed to ${statusDisplayName}`,
			);
		} catch (err: any) {
			console.error("Failed to update user status:", err);
			const errorMessage =
				err?.data?.error?.message ||
				err?.data?.message ||
				"Failed to update user status";
			toast.error(errorMessage);
			throw err; // Re-throw to let dialog handle loading state
		}
	};

	const confirmDelete = async () => {
		if (!selectedUser) return;

		try {
			await deleteUser(selectedUser.id).unwrap();
			toast.success("User deleted successfully");
			setShowDeleteDialog(false);
			setSelectedUser(null);
		} catch (err: any) {
			console.error("Failed to delete user:", err);
			const errorMessage =
				err?.data?.error?.message ||
				err?.data?.message ||
				"Failed to delete user";
			toast.error(errorMessage);
			// Don't close dialog on error so user can retry or cancel
		}
	};

	// Get column definitions with callbacks
	const columns = usersTableDef({
		onEdit: handleEditUser,
		onDelete: handleDeleteUser,
		onUpdateStatus: handleUpdateStatus,
	});

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-brand-main-800'>
						User Management
					</h1>
					<p className='text-brand-main-600 mt-1'>
						Manage store users and their permissions
					</p>
				</div>
				<Button
					onClick={() => setShowAddDialog(true)}
					className='bg-brand-main-900 hover:bg-brand-main-700 text-white'>
					<Plus className='h-4 w-4 mr-2' />
					Add User
				</Button>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card className=' '>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Users
						</CardTitle>
						<Users className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{usersData?.count}
						</div>
						<p className='text-xs text-brand-main-600'>Active users</p>
					</CardContent>
				</Card>

				<Card className=' '>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Morning Shift
						</CardTitle>
						<Users className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{morningShiftUsers}
						</div>
						<p className='text-xs text-brand-main-600'>
							Users on morning shift
						</p>
					</CardContent>
				</Card>

				<Card className=' '>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Evening Shift
						</CardTitle>
						<Users className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{eveningShiftUsers}
						</div>
						<p className='text-xs text-brand-main-600'>
							Users on evening shift
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className=' '>
				<CardHeader>
					<CardTitle className='text-brand-main-800'>Users</CardTitle>
					<div className='flex gap-4 mt-4 w-full'>
						<div className='flex gap-4 flex-1'>
							<div className='relative flex-1'>
								<label
									htmlFor='customer-search'
									className='sr-only'>
									Search Users
								</label>
								{isFetching ? (
									<Spinner
										className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500'
										aria-label='Loading users'
									/>
								) : (
									<Search
										className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500'
										aria-hidden='true'
									/>
								)}

								<Input
									id='customer-search'
									placeholder='Search users...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='pl-8   focus:border-brand-main-400'
									aria-label='Search customers'
								/>
							</div>
						</div>

						<Select
							value={roleFilter}
							onValueChange={(value) => setRoleFilter(value)}>
							<SelectTrigger className='  focus:border-brand-main-400 w-40'>
								<SelectValue placeholder='Select role' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Roles</SelectItem>
								<SelectItem value='SUPERADMIN'>Super Admin</SelectItem>
								<SelectItem value='MANAGER'>Manager</SelectItem>
								<SelectItem value='CASHIER'>Cashier</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={columns}
						data={users || []}
						tableName='Users'
					/>
				</CardContent>
			</Card>

			{/* Add User Dialog */}
			<AddUserDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onSave={handleAddUser}
				isCreating={isCreating}
			/>

			{/* Edit User Dialog */}
			<EditUserDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				user={selectedUser}
				onSave={handleSaveEdit}
				isUpdating={isUpdating}
			/>

			{/* Update Status Dialog */}
			{selectedUser && (
				<UpdateStatusDialog
					open={showStatusDialog}
					onOpenChange={setShowStatusDialog}
					userId={selectedUser.id}
					userName={selectedUser.name}
					currentStatus={selectedUser.status}
					onStatusUpdate={handleStatusUpdate}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='text-brand-main-800'>
							Delete User
						</AlertDialogTitle>
						<AlertDialogDescription className='text-brand-main-600'>
							Are you sure you want to delete "{selectedUser?.name}"? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className='  text-brand-main-700 hover:bg-brand-main-50'>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								confirmDelete();
							}}
							disabled={isDeleting}
							className='bg-red-600 hover:bg-red-700 text-white'>
							{isDeleting ? (
								<>
									<Spinner className='h-4 w-4' />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
