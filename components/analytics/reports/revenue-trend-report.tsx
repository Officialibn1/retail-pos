"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { useGetSalesByDateQuery } from "@/lib/store/api";
import { cn } from "@/lib/utils";

interface RevenueTrendReportProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	onRefresh?: () => void;
}

export function RevenueTrendReport({
	dateRange,
	onRefresh,
}: RevenueTrendReportProps) {
	const {
		data: salesByDay = [],
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useGetSalesByDateQuery(dateRange);

	const handleRefresh = () => {
		refetch();
	};

	if (isLoading) {
		return (
			<Card className='border-brand-main-200 w-full flex flex-col h-[450px] lg:h-[550px]'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<Skeleton className='h-6 w-32 mb-2' />
							<Skeleton className='h-4 w-48' />
						</div>
						<Skeleton className='h-8 w-20' />
					</div>
				</CardHeader>
				<CardContent className='flex-1 flex items-center justify-center'>
					<div className='flex flex-col items-center gap-2'>
						<Skeleton className='h-8 w-8 rounded-full' />
						<Skeleton className='h-4 w-32' />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className='border-red-200 bg-red-50 w-full flex flex-col h-[450px] lg:h-[550px]'>
				<CardHeader>
					<CardTitle className='text-red-800 flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5' />
						Revenue Trend Error
					</CardTitle>
					<CardDescription className='text-red-700'>
						Failed to load revenue trend data
					</CardDescription>
				</CardHeader>
				<CardContent className='flex-1 flex items-center justify-center'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>
							{(error as any)?.data?.error?.message ||
								(error as any)?.message ||
								"Unable to fetch revenue data"}
						</p>
						<Button
							variant='outline'
							onClick={handleRefresh}
							className='border-red-300 text-red-700 hover:bg-red-100'>
							<RefreshCw className='h-4 w-4 mr-2' />
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='border-brand-main-200 w-full flex flex-col h-fit'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-brand-main-800'>Revenue Trend</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Daily revenue for selected period
						</CardDescription>
					</div>
					<Button
						variant='outline'
						size='sm'
						onClick={handleRefresh}
						className='flex items-center gap-2'>
						<RefreshCw
							className={cn("h-3 w-3", {
								"animate-spin": isFetching,
							})}
						/>
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent className='flex-1'>
				{salesByDay.length > 0 ? (
					<RevenueChart data={salesByDay} />
				) : (
					<div className='flex items-center justify-center h-full text-brand-main-600'>
						<div className='text-center'>
							<p>No revenue data available for the selected period</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
