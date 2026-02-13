"use client";

import { useState } from "react";
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
import { AlertTriangle, RefreshCw, Loader2, Users } from "lucide-react";
import { CustomerAnalyticsChart } from "@/components/analytics/customer-analytics-chart";
import { useTopCustomers, useCustomerTrends } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

interface CustomerAnalyticsReportProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	selectedCustomerIds?: string[];
	onCustomerClick?: (customerId: string) => void;
	onRefresh?: () => void;
}

export function CustomerAnalyticsReport({
	dateRange,
	selectedCustomerIds = [],
	onCustomerClick,
	onRefresh,
}: CustomerAnalyticsReportProps) {
	const [customerTrendInterval, setCustomerTrendInterval] = useState<
		"week" | "month"
	>("month");

	const topCustomersQuery = useTopCustomers({
		...dateRange,
		sortBy: "revenue",
		limit: 10,
	});

	const customerTrendsQuery = useCustomerTrends({
		...dateRange,
		interval: customerTrendInterval,
		customerIds:
			selectedCustomerIds.length > 0 ? selectedCustomerIds : undefined,
	});

	const handleRefresh = () => {
		topCustomersQuery.refetch();
		customerTrendsQuery.refetch();
		onRefresh?.();
	};

	const handleRetry = () => {
		topCustomersQuery.retry();
		customerTrendsQuery.retry();
		onRefresh?.();
	};

	const isLoading =
		topCustomersQuery.isLoading || customerTrendsQuery.isLoading;
	const isFetching =
		topCustomersQuery.isFetching || customerTrendsQuery.isFetching;
	const isError = topCustomersQuery.isError || customerTrendsQuery.isError;
	const error = topCustomersQuery.error || customerTrendsQuery.error;

	if (isLoading) {
		return (
			<Card className='border-brand-main-200'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle className='text-brand-main-800 flex items-center gap-2'>
								<Users className='h-5 w-5' />
								Customer Analytics
							</CardTitle>
							<CardDescription className='text-brand-main-600'>
								Loading customer analytics data...
							</CardDescription>
						</div>
						<Skeleton className='h-8 w-20' />
					</div>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center h-64'>
						<div className='flex flex-col items-center gap-2'>
							<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
							<p className='text-sm text-brand-main-600'>
								Loading customer data...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className='border-red-200 bg-red-50'>
				<CardHeader>
					<CardTitle className='text-red-800 flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5' />
						Customer Analytics Error
					</CardTitle>
					<CardDescription className='text-red-700'>
						Failed to load customer analytics data
					</CardDescription>
				</CardHeader>
				<CardContent className='flex items-center justify-center py-8'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>
							{error?.message || "Unable to fetch customer analytics"}
						</p>
						<div className='flex gap-2 justify-center'>
							<Button
								variant='outline'
								onClick={handleRefresh}
								className='border-red-300 text-red-700 hover:bg-red-100'>
								<RefreshCw className='h-4 w-4 mr-2' />
								Refresh
							</Button>
							{error?.retryable && (
								<Button
									variant='outline'
									onClick={handleRetry}
									className='border-red-300 text-red-700 hover:bg-red-100'>
									Retry
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!topCustomersQuery.data && !customerTrendsQuery.data) {
		return (
			<Alert>
				<AlertTriangle className='h-4 w-4' />
				<AlertDescription>
					No customer analytics data available for the selected period.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-semibold text-brand-main-800'>
						Customer Analytics
					</h3>
					<p className='text-sm text-brand-main-600'>
						Customer behavior insights and trends
						{selectedCustomerIds.length > 0 &&
							` (${selectedCustomerIds.length} customers selected)`}
					</p>
				</div>
				<Button
					variant='outline'
					size='sm'
					onClick={handleRefresh}
					disabled={isLoading || isFetching}
					className='flex items-center gap-2'>
					<RefreshCw
						className={cn("h-3 w-3", {
							"animate-spin": isFetching,
						})}
					/>
					Refresh
				</Button>
			</div>

			<CustomerAnalyticsChart
				topCustomersData={topCustomersQuery.data}
				customerTrendsData={customerTrendsQuery.data}
				onCustomerClick={onCustomerClick}
			/>
		</div>
	);
}
