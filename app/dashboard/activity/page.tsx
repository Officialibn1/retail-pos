"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Activity, Clock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewActivityLogs } from "@/lib/auth";
import { useGetActivityLogsQuery } from "@/lib/store/api";
import DataTable from "@/components/dashboard/data-table";
import { activitiesTableDef } from "@/components/activities/activities-table-def";

export default function ActivityLogsPage() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [actionFilter, setActionFilter] = useState("all");

	// Use RTK Query hook to fetch activity logs
	const {
		data: logs = [],
		isLoading: loading,
		isError,
		error,
	} = useGetActivityLogsQuery(
		{ limit: 200 },
		{
			skip: !user || !canViewActivityLogs(user.roles),
		},
	);

	if (!user || !canViewActivityLogs(user.roles)) {
		return (
			<div className='flex items-center justify-center h-64'>
				<p className='text-brand-main-600'>
					You don't have permission to access this page.
				</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			error && "data" in error
				? (error.data as any)?.message || "Failed to load activity logs"
				: "Failed to load activity logs";

		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Activity Logs
						</CardTitle>
						<p className='text-red-700'>{errorMessage}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const filteredLogs = logs.filter((log) => {
		const matchesSearch =
			log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.user.name.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesAction =
			actionFilter === "all" ||
			log.action.toLowerCase().includes(actionFilter.toLowerCase());

		return matchesSearch && matchesAction;
	});

	const todayLogs = filteredLogs.filter((log) => {
		const today = new Date();
		const logDate = new Date(log.createdAt);
		return logDate.toDateString() === today.toDateString();
	}).length;

	const uniqueUsers = new Set(filteredLogs.map((log) => log.userId)).size;

	// Get column definitions
	const columns = activitiesTableDef();

	return (
		<div className='space-y-6 p-6'>
			<div>
				<h1 className='text-3xl font-bold text-brand-main-800'>
					Activity Logs
				</h1>
				<p className='text-brand-main-600 mt-1'>
					Monitor system activities and user actions
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Activities
						</CardTitle>
						<Activity className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{filteredLogs.length}
						</div>
						<p className='text-xs text-brand-main-600'>all time activities</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Today's Activities
						</CardTitle>
						<Clock className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{todayLogs}
						</div>
						<p className='text-xs text-brand-main-600'>activities today</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Active Users
						</CardTitle>
						<User className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{uniqueUsers}
						</div>
						<p className='text-xs text-brand-main-600'>users with activities</p>
					</CardContent>
				</Card>
			</div>

			<Card className='border-brand-main-200'>
				<CardHeader>
					<CardTitle className='text-brand-main-800'>Activity Logs</CardTitle>
					<div className='flex gap-4 mt-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
							<Input
								placeholder='Search activities...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8 border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<select
							value={actionFilter}
							onChange={(e) => setActionFilter(e.target.value)}
							className='px-3 py-2 border border-brand-main-200 rounded-md text-sm focus:border-brand-main-400 focus:outline-none'>
							<option value='all'>All Actions</option>
							<option value='login'>Authentication</option>
							<option value='sale'>Sales</option>
							<option value='inventory'>Inventory</option>
							<option value='user'>User Management</option>
						</select>
					</div>
				</CardHeader>
				<CardContent className='overflow-x-auto'>
					<DataTable
						columns={columns}
						data={filteredLogs}
						tableName='Activity Logs'
					/>
				</CardContent>
			</Card>
		</div>
	);
}
