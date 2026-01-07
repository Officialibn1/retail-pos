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
import { useToast } from "@/hooks/use-toast";
import { useGetUsersQuery, useDeleteUserMutation } from "@/lib/store/api";
import DataTable from "@/components/dashboard/data-table";
import { usersTableDef } from "@/components/users/users-table-def";
import { UserWithoutPassword } from "@/lib/prisma-extended-types";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";

export default function UsersPage() {
	const { user } = useAuth();
	const { toast } = useToast();
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

	const [deleteUser] = useDeleteUserMutation();

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

	const handleEditUser = (user: UserWithoutPassword) => {
		// TODO: Implement edit functionality
		toast({
			title: "Edit User",
			description: `Edit functionality for ${user.name} will be implemented`,
		});
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user?")) {
			return;
		}

		try {
			await deleteUser(userId).unwrap();
			toast({
				title: "Success",
				description: "User deleted successfully",
			});
		} catch (err: any) {
			console.error("Failed to delete user:", err);
			const errorMessage =
				err?.data?.error?.message ||
				err?.data?.message ||
				"Failed to delete user";
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	// Get column definitions with callbacks
	const columns = usersTableDef({
		onEdit: handleEditUser,
		onDelete: handleDeleteUser,
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
				<Button className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
					<Plus className='h-4 w-4 mr-2' />
					Add User
				</Button>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card className='border-brand-main-200'>
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

				<Card className='border-brand-main-200'>
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

				<Card className='border-brand-main-200'>
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

			<Card className='border-brand-main-200'>
				<CardHeader>
					<CardTitle className='text-brand-main-800'>Users</CardTitle>
					<div className='flex gap-4 mt-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
							<Input
								placeholder='Search users...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8 border-brand-main-200 focus:border-brand-main-400'
							/>
							{isFetching && (
								<Spinner className='absolute right-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
							)}
						</div>

						<Select
							value={roleFilter}
							onValueChange={(value) => setRoleFilter(value)}>
							<SelectTrigger className='border-brand-main-200 focus:border-brand-main-400 w-40'>
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
		</div>
	);
}
