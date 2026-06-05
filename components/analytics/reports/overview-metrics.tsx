"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	DollarSign,
	ShoppingCart,
	AlertTriangle,
	TrendingUp,
	TrendingDown,
	RefreshCw,
} from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";
import { useGetDashboardStatsQuery } from "@/lib/store/api";

interface OverviewMetricsProps {
	onRefresh?: () => void;
}

export function OverviewMetrics({ onRefresh }: OverviewMetricsProps) {
	const {
		data: dashboardStats,
		isLoading: isDashboardLoading,
		isError: isDashboardError,
		error: dashboardError,
		refetch: refetchDashboard,
		isFetching: isFetchingDashboard,
	} = useGetDashboardStatsQuery();

	const isLoading = isDashboardLoading;
	const isError = isDashboardError;
	const error = dashboardError;

	const handleRefresh = () => {
		refetchDashboard();
	};

	if (isLoading || isFetchingDashboard) {
		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Card
						key={i}
						className=' '>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-4 rounded' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-8 w-32 mb-2' />
							<Skeleton className='h-3 w-20' />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant='destructive'>
				<AlertTriangle className='h-4 w-4' />
				<AlertDescription className='flex items-center justify-between'>
					<span>
						Failed to load overview metrics:{" "}
						{(error as any)?.data?.error?.message ||
							(error as any)?.message ||
							"Unknown error"}
					</span>
					<Button
						variant='outline'
						size='sm'
						onClick={handleRefresh}
						className='ml-2'>
						<RefreshCw
							className={cn("h-3 w-3 mr-1", {
								"animate-spin": isFetchingDashboard,
							})}
						/>
						Retry
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	if (!dashboardStats) {
		return (
			<Alert>
				<AlertTriangle className='h-4 w-4' />
				<AlertDescription>
					No overview data available at this time.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<Card className=' '>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium text-brand-main-700'>
						Total Revenue
					</CardTitle>
					<DollarSign className='h-4 w-4 text-brand-main-600' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-brand-main-800'>
						{formatNaira(dashboardStats.totalRevenue)}
					</div>
					<p className='text-xs text-brand-main-600 flex items-center mt-1'>
						<TrendingUp className='h-3 w-3 mr-1' />
						Total sales revenue
					</p>
				</CardContent>
			</Card>

			<Card className=' '>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium text-brand-main-700'>
						Total Sales
					</CardTitle>
					<ShoppingCart className='h-4 w-4 text-brand-main-600' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-brand-main-800'>
						{dashboardStats.totalSales}
					</div>
					<p className='text-xs text-brand-main-600 flex items-center mt-1'>
						<TrendingUp className='h-3 w-3 mr-1' />
						Completed transactions
					</p>
				</CardContent>
			</Card>

			<Card className=' '>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium text-brand-main-700'>
						Avg Order Value
					</CardTitle>
					<DollarSign className='h-4 w-4 text-brand-main-600' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-brand-main-800'>
						{formatNaira(dashboardStats.averageOrderValue)}
					</div>
					<p className='text-xs text-brand-main-600 flex items-center mt-1'>
						<TrendingDown className='h-3 w-3 mr-1' />
						Per transaction
					</p>
				</CardContent>
			</Card>

			<Card className=' '>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium text-brand-main-700'>
						Low Stock Items
					</CardTitle>
					<AlertTriangle className='h-4 w-4 text-brand-main-600' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold text-brand-main-800'>
						{dashboardStats.lowStockCount}
					</div>
					<p className='text-xs text-brand-main-600'>Items below 10 units</p>
				</CardContent>
			</Card>
		</div>
	);
}
