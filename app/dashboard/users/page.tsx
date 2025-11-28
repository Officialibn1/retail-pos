"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canManageUsers } from "@/lib/auth";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";

interface UserResponse {
	users: User[];
	count: number;
}
export default function UsersPage() {
	const { user } = useAuth();
	const { toast } = useToast();
	const [users, setUsers] = useState<UserResponse>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.get<UserResponse>("/api/users");
			setUsers(data);
		} catch (err: any) {
			console.error("Failed to fetch users:", err);
			setError(err.message || "Failed to load users");
			toast({
				title: "Error",
				description: err.message || "Failed to load users",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user && canManageUsers(user.roles)) {
			fetchUsers();
		}
	}, [user]);

	if (!user || !canManageUsers(user.roles)) {
		return (
			<div className='flex items-center justify-center h-64'>
				<p className='text-lunar-green-600'>
					You don't have permission to access this page.
				</p>
			</div>
		);
	}

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
						<CardTitle className='text-red-800'>Error Loading Users</CardTitle>
						<p className='text-red-700'>{error}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const filteredUsers = users?.users.filter((u) => {
		const matchesSearch =
			u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.email.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesRole =
			roleFilter === "all" || u.roles.includes(roleFilter as any);

		return matchesSearch && matchesRole;
	});

	const getRoleBadge = (roles: string[]) => {
		const role = roles[0];
		switch (role) {
			case "SUPERADMIN":
				return (
					<Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
						Super Admin
					</Badge>
				);
			case "MANAGER":
				return (
					<Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
						Manager
					</Badge>
				);
			case "CASHIER":
				return (
					<Badge className='bg-lunar-green-100 text-lunar-green-800 hover:bg-lunar-green-100'>
						Cashier
					</Badge>
				);
			default:
				return <Badge variant='secondary'>{role}</Badge>;
		}
	};

	const getShiftBadge = (shift: string) => {
		return (
			<Badge
				variant='outline'
				className={
					shift === "MORNING"
						? "border-orange-300 text-orange-700"
						: shift === "EVENING"
						? "border-purple-300 text-purple-700"
						: "border-blue-300 text-blue-700"
				}>
				{shift === "MORNING"
					? "Morning"
					: shift === "EVENING"
					? "Evening"
					: "Full Time"}
			</Badge>
		);
	};

	const morningShiftUsers = filteredUsers?.filter(
		(u) => u.shift === "MORNING",
	).length;
	const eveningShiftUsers = filteredUsers?.filter(
		(u) => u.shift === "EVENING",
	).length;

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user?")) {
			return;
		}

		try {
			await api.delete(`/api/users/${userId}`);
			toast({
				title: "Success",
				description: "User deleted successfully",
			});
			fetchUsers();
		} catch (err: any) {
			console.error("Failed to delete user:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to delete user",
				variant: "destructive",
			});
		}
	};

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-lunar-green-800'>
						User Management
					</h1>
					<p className='text-lunar-green-600 mt-1'>
						Manage store users and their permissions
					</p>
				</div>
				<Button className='bg-lunar-green-600 hover:bg-lunar-green-700 text-white'>
					<Plus className='h-4 w-4 mr-2' />
					Add User
				</Button>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card className='border-lunar-green-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-lunar-green-700'>
							Total Users
						</CardTitle>
						<Users className='h-4 w-4 text-lunar-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-lunar-green-800'>
							{users?.count}
						</div>
						<p className='text-xs text-lunar-green-600'>Active users</p>
					</CardContent>
				</Card>

				<Card className='border-lunar-green-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-lunar-green-700'>
							Morning Shift
						</CardTitle>
						<Users className='h-4 w-4 text-lunar-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-lunar-green-800'>
							{morningShiftUsers}
						</div>
						<p className='text-xs text-lunar-green-600'>
							Users on morning shift
						</p>
					</CardContent>
				</Card>

				<Card className='border-lunar-green-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-lunar-green-700'>
							Evening Shift
						</CardTitle>
						<Users className='h-4 w-4 text-lunar-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-lunar-green-800'>
							{eveningShiftUsers}
						</div>
						<p className='text-xs text-lunar-green-600'>
							Users on evening shift
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className='border-lunar-green-200'>
				<CardHeader>
					<CardTitle className='text-lunar-green-800'>Users</CardTitle>
					<div className='flex gap-4 mt-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500' />
							<Input
								placeholder='Search users...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8 border-lunar-green-200 focus:border-lunar-green-400'
							/>
						</div>

						<Select
							value={roleFilter}
							onValueChange={(value) => setRoleFilter(value)}>
							<SelectTrigger className='border-lunar-green-200 focus:border-lunar-green-400 w-40'>
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
					<Table>
						<TableHeader>
							<TableRow className='border-lunar-green-200'>
								<TableHead className='text-lunar-green-700'>Name</TableHead>
								<TableHead className='text-lunar-green-700'>Email</TableHead>
								<TableHead className='text-lunar-green-700'>Username</TableHead>
								<TableHead className='text-lunar-green-700'>Role</TableHead>
								<TableHead className='text-lunar-green-700'>Shift</TableHead>
								<TableHead className='text-lunar-green-700'>Created</TableHead>
								<TableHead className='text-lunar-green-700'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers?.map((u) => (
								<TableRow
									key={u.id}
									className='border-lunar-green-100'>
									<TableCell className='font-medium text-lunar-green-800'>
										{u.name}
									</TableCell>
									<TableCell className='text-lunar-green-700'>
										{u.email}
									</TableCell>
									<TableCell className='text-lunar-green-700'>
										{u.username}
									</TableCell>
									<TableCell>{getRoleBadge(u.roles)}</TableCell>
									<TableCell>{getShiftBadge(u.shift)}</TableCell>
									<TableCell className='text-lunar-green-700'>
										{new Date(u.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className='flex gap-1'>
											<Button
												size='sm'
												variant='ghost'
												className='text-lunar-green-600 hover:bg-lunar-green-100'>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												size='sm'
												variant='ghost'
												className='text-red-600 hover:bg-red-100'
												onClick={() => handleDeleteUser(u.id)}>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{filteredUsers?.length === 0 && (
						<div className='text-center py-8 text-lunar-green-600'>
							No users found matching your criteria.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
