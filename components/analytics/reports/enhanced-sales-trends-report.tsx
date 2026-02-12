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
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { SalesTrendChart } from "@/components/analytics/sales-trend-chart";
import { CashierPerformanceChart } from "@/components/analytics/cashier-performance-chart";
import { useSalesTrends, useCashierPerformance } from "@/hooks/use-analytics";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface EnhancedSalesTrendsReportProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	onCashierClick?: (userId: string) => void;
	onRefresh?: () => void;
}

export function EnhancedSalesTrendsReport({
	dateRange,
	onCashierClick,
	onRefresh,
}: EnhancedSalesTrendsReportProps) {
	const { user } = useAuth();
	const canSeeAll = user ? canViewAllData(user.roles) : false;

	const [salesTrendInterval, setSalesTrendInterval] = useState<
		"hourly" | "daily" | "weekly"
	>("daily");

	const salesTrendsQuery = useSalesTrends({
		...dateRange,
		interval: salesTrendInterval,
	});

	const cashierPerformanceQuery = useCashierPerformance(dateRange, {
		enabled: canSeeAll,
	});

	const handleRefresh = () => {
		salesTrendsQuery.refetch();
		if (canSeeAll) {
			cashierPerformanceQuery.refetch();
		}
	};

	const handleRetry = () => {
		salesTrendsQuery.retry();
		if (canSeeAll) {
			cashierPerformanceQuery.retry();
		}
	};

	const isLoading =
		salesTrendsQuery.isLoading ||
		(canSeeAll && cashierPerformanceQuery.isLoading);
	const isFetching =
		salesTrendsQuery.isFetching ||
		(canSeeAll && cashierPerformanceQuery.isFetching);
	const isError =
		salesTrendsQuery.isError || (canSeeAll && cashierPerformanceQuery.isError);
	const error =
		salesTrendsQuery.error ||
		(canSeeAll ? cashierPerformanceQuery.error : null);

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<Card className='border-brand-main-200'>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<div>
								<CardTitle className='text-brand-main-800'>
									Sales Trends
								</CardTitle>
								<CardDescription className='text-brand-main-600'>
									Loading sales trend data...
								</CardDescription>
							</div>
							<Skeleton className='h-8 w-20' />
						</div>
					</CardHeader>
					<CardContent>
						<div className='flex items-center justify-center h-64'>
							<div className='flex flex-col items-center gap-2'>
								<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
								<p className='text-sm text-brand-main-600'>Loading trends...</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{canSeeAll && (
					<Card className='border-brand-main-200'>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<div>
									<CardTitle className='text-brand-main-800'>
										Cashier Performance
									</CardTitle>
									<CardDescription className='text-brand-main-600'>
										Loading cashier performance data...
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
										Loading performance...
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant='destructive'>
				<AlertTriangle className='h-4 w-4' />
				<AlertDescription className='flex items-center justify-between'>
					<span>
						Failed to load sales trends: {error?.message || "Unknown error"}
					</span>
					<div className='flex gap-2 ml-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={handleRefresh}>
							<RefreshCw className='h-3 w-3 mr-1' />
							Refresh
						</Button>
						{error?.retryable && (
							<Button
								variant='outline'
								size='sm'
								onClick={handleRetry}>
								Retry
							</Button>
						)}
					</div>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-semibold text-brand-main-800'>
						Sales Trends Analysis
					</h3>
					<p className='text-sm text-brand-main-600'>
						Comprehensive sales performance and trend analysis
					</p>
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

			{salesTrendsQuery.data ? (
				<SalesTrendChart
					data={salesTrendsQuery.data}
					interval={salesTrendInterval}
					onIntervalChange={setSalesTrendInterval}
				/>
			) : (
				<Alert>
					<AlertTriangle className='h-4 w-4' />
					<AlertDescription>
						No sales trend data available for the selected period.
					</AlertDescription>
				</Alert>
			)}

			{canSeeAll && cashierPerformanceQuery.data ? (
				<CashierPerformanceChart
					data={cashierPerformanceQuery.data}
					onCashierClick={onCashierClick}
				/>
			) : canSeeAll && cashierPerformanceQuery.isError ? (
				<Alert variant='destructive'>
					<AlertTriangle className='h-4 w-4' />
					<AlertDescription>
						Failed to load cashier performance data:{" "}
						{cashierPerformanceQuery.error?.message}
					</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
