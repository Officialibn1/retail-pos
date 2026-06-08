"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, Activity, Clock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewActivityLogs } from "@/lib/auth";
import { useGetActivityLogsQuery } from "@/lib/store/api";
import DataTable from "@/components/dashboard/data-table";
import { activitiesTableDef } from "@/components/activities/activities-table-def";
import { ActivityDetailsDialog } from "@/components/activities/activity-details-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { ActivityLogWithUser } from "@/lib/prisma-extended-types";
import { Spinner } from "@/components/ui/spinner";

export default function ActivityLogsPage() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [actionFilter, setActionFilter] = useState("all");
	const [selectedActivity, setSelectedActivity] =
		useState<ActivityLogWithUser | null>(null);
	const [showDetailsDialog, setShowDetailsDialog] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	const {
		data: logs = [],
		isLoading: loading,
		isFetching,
		isError,
		error,
	} = useGetActivityLogsQuery(
		{
			searchTerm: debouncedSearchTerm || undefined,
			action: actionFilter !== "all" ? actionFilter : undefined,
			limit: 200,
		},
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

	const todayLogs = logs.filter((log) => {
		const today = new Date();
		const logDate = new Date(log.createdAt);
		return logDate.toDateString() === today.toDateString();
	}).length;

	const uniqueUsers = new Set(logs.map((log) => log.userId)).size;
	const columns = activitiesTableDef();

	const handleRowClick = (activity: ActivityLogWithUser) => {
		setSelectedActivity(activity);
		setShowDetailsDialog(true);
	};

	return (
		<div className='space-y-6 p-6 max-w-full w-full'>
			<div>
				<h1 className='text-3xl font-bold text-brand-main-900'>
					Activity Logs
				</h1>
				<p className='text-brand-main-800 mt-1'>
					Monitor system activities and user actions
				</p>
			</div>

			{/* Summary cards */}
			<div className='grid gap-4 md:grid-cols-3'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Activities
						</CardTitle>
						<Activity className='h-4 w-4 text-brand-main-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{logs.length}
						</div>
						<CardDescription>all time activities</CardDescription>
					</CardContent>
				</Card>

				<Card>
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
						<CardDescription>activities today</CardDescription>
					</CardContent>
				</Card>

				<Card>
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
						<CardDescription>users with activities</CardDescription>
					</CardContent>
				</Card>
			</div>

			<Card className='max-w-full'>
				<CardHeader>
					<CardTitle className='text-brand-main-800'>Activity Logs</CardTitle>

					{/* Row 1: text search + action category */}
					<div className='flex gap-3 mt-4 flex-wrap'>
						<div className='relative flex-1 min-w-[200px]'>
							{isFetching ? (
								<Spinner className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							) : (
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							)}
							<Input
								placeholder='Search by action, details or user…'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={loading}
								className='pl-8 focus:border-brand-main-400'
							/>
						</div>
						<Select
							value={actionFilter}
							onValueChange={setActionFilter}
							disabled={loading || isFetching}>
							<SelectTrigger className='w-48 focus:border-brand-main-400'>
								<SelectValue placeholder='All Actions' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Actions</SelectItem>
								<SelectItem value='login'>Authentication</SelectItem>
								<SelectItem value='sale'>Sales</SelectItem>
								<SelectItem value='inventory'>Inventory</SelectItem>
								<SelectItem value='user'>User Management</SelectItem>
								<SelectItem value='shift'>Shift / Cash Drawer</SelectItem>
								<SelectItem value='return'>Returns</SelectItem>
							</SelectContent>
						</Select>
					</div>


				</CardHeader>

				<CardContent className='overflow-x-auto xl:max-w-full'>
					<DataTable
						columns={columns}
						data={logs}
						tableName='Activity Logs'
						onRowClick={handleRowClick}
					/>
				</CardContent>
			</Card>

			<ActivityDetailsDialog
				open={showDetailsDialog}
				onOpenChange={setShowDetailsDialog}
				activity={selectedActivity}
			/>
		</div>
	);
}
