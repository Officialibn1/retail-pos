"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Activity, Clock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewActivityLogs } from "@/lib/auth";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
	id: string;
	userId: string;
	action: string;
	details: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

export default function ActivityLogsPage() {
	const { user } = useAuth();
	const { toast } = useToast();
	const [logs, setLogs] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [actionFilter, setActionFilter] = useState("all");

	const fetchActivityLogs = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.get<ActivityLog[]>("/api/activity-logs?limit=200");
			setLogs(data);
		} catch (err: any) {
			console.error("Failed to fetch activity logs:", err);
			setError(err.message || "Failed to load activity logs");
			toast({
				title: "Error",
				description: err.message || "Failed to load activity logs",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user && canViewActivityLogs(user.roles)) {
			fetchActivityLogs();
		}
	}, [user]);

	if (!user || !canViewActivityLogs(user.roles)) {
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
						<CardTitle className='text-red-800'>
							Error Loading Activity Logs
						</CardTitle>
						<p className='text-red-700'>{error}</p>
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

	const getActionBadge = (action: string) => {
		if (action.includes("Login") || action.includes("Logout")) {
			return (
				<Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
					Auth
				</Badge>
			);
		}
		if (action.includes("Sale") || action.includes("Transaction")) {
			return (
				<Badge className='bg-lunar-green-100 text-lunar-green-800 hover:bg-lunar-green-100'>
					Sales
				</Badge>
			);
		}
		if (action.includes("Inventory") || action.includes("Product")) {
			return (
				<Badge className='bg-purple-100 text-purple-800 hover:bg-purple-100'>
					Inventory
				</Badge>
			);
		}
		if (action.includes("User") || action.includes("Account")) {
			return (
				<Badge className='bg-orange-100 text-orange-800 hover:bg-orange-100'>
					User Mgmt
				</Badge>
			);
		}
		return <Badge variant='secondary'>System</Badge>;
	};

	const todayLogs = filteredLogs.filter((log) => {
		const today = new Date();
		const logDate = new Date(log.createdAt);
		return logDate.toDateString() === today.toDateString();
	}).length;

	const uniqueUsers = new Set(filteredLogs.map((log) => log.userId)).size;

	return (
		<div className='space-y-6 p-6'>
			<div>
				<h1 className='text-3xl font-bold text-lunar-green-800'>
					Activity Logs
				</h1>
				<p className='text-lunar-green-600 mt-1'>
					Monitor system activities and user actions
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card className='border-lunar-green-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-lunar-green-700'>
							Total Activities
						</CardTitle>
						<Activity className='h-4 w-4 text-lunar-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-lunar-green-800'>
							{filteredLogs.length}
						</div>
						<p className='text-xs text-lunar-green-600'>all time activities</p>
					</CardContent>
				</Card>

				<Card className='border-lunar-green-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-lunar-green-700'>
							Today's Activities
						</CardTitle>
						<Clock className='h-4 w-4 text-lunar-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-lunar-green-800'>
							{todayLogs}
						</div>
						<p className='text-xs text-lunar-green-600'>activities today</p>
					</CardContent>
				</Card>

				<Card className='border-lunar-green-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-lunar-green-700'>
							Active Users
						</CardTitle>
						<User className='h-4 w-4 text-lunar-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-lunar-green-800'>
							{uniqueUsers}
						</div>
						<p className='text-xs text-lunar-green-600'>
							users with activities
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className='border-lunar-green-200'>
				<CardHeader>
					<CardTitle className='text-lunar-green-800'>Activity Logs</CardTitle>
					<div className='flex gap-4 mt-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500' />
							<Input
								placeholder='Search activities...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8 border-lunar-green-200 focus:border-lunar-green-400'
							/>
						</div>
						<select
							value={actionFilter}
							onChange={(e) => setActionFilter(e.target.value)}
							className='px-3 py-2 border border-lunar-green-200 rounded-md text-sm focus:border-lunar-green-400 focus:outline-none'>
							<option value='all'>All Actions</option>
							<option value='login'>Authentication</option>
							<option value='sale'>Sales</option>
							<option value='inventory'>Inventory</option>
							<option value='user'>User Management</option>
						</select>
					</div>
				</CardHeader>
				<CardContent className='overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow className='border-lunar-green-200'>
								<TableHead className='text-lunar-green-700'>
									Timestamp
								</TableHead>
								<TableHead className='text-lunar-green-700'>User</TableHead>
								<TableHead className='text-lunar-green-700'>Action</TableHead>
								<TableHead className='text-lunar-green-700'>Details</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredLogs.map((log) => (
								<TableRow
									key={log.id}
									className='border-lunar-green-100'>
									<TableCell className='text-lunar-green-700'>
										{new Date(log.createdAt).toLocaleDateString()}{" "}
										{new Date(log.createdAt).toLocaleTimeString()}
									</TableCell>
									<TableCell className='font-medium text-lunar-green-800'>
										{log.user.name}
									</TableCell>
									<TableCell className='text-lunar-green-700'>
										{log.action}
									</TableCell>
									<TableCell className='text-lunar-green-700 truncate'>
										{log.details}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{filteredLogs.length === 0 && (
						<div className='text-center py-8 text-lunar-green-600'>
							No activity logs found matching your criteria.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
