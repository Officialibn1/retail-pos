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
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { TopProductsChart } from "@/components/analytics/top-products-chart";
import { useTopPerformingProducts } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

interface EnhancedTopProductsReportProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	selectedCategoryId?: string;
	onProductClick?: (productId: string) => void;
	onRefresh?: () => void;
}

export function EnhancedTopProductsReport({
	dateRange,
	selectedCategoryId,
	onProductClick,
	onRefresh,
}: EnhancedTopProductsReportProps) {
	const { data, isLoading, isError, error, refetch, retry, isFetching } =
		useTopPerformingProducts({
			...dateRange,
			sortBy: "revenue",
			limit: 10,
			categoryId: selectedCategoryId,
		});

	const handleRefresh = () => {
		refetch();
	};

	const handleRetry = () => {
		retry();
	};

	if (isLoading) {
		return (
			<Card className='border-brand-main-200'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle className='text-brand-main-800'>
								Top Products Analytics
							</CardTitle>
							<CardDescription className='text-brand-main-600'>
								Loading product performance data...
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
								Loading analytics...
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
						Top Products Analytics Error
					</CardTitle>
					<CardDescription className='text-red-700'>
						Failed to load product performance data
					</CardDescription>
				</CardHeader>
				<CardContent className='flex items-center justify-center py-8'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>
							{error?.message || "Unable to fetch product analytics"}
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

	if (!data) {
		return (
			<Alert>
				<AlertTriangle className='h-4 w-4' />
				<AlertDescription>
					No product analytics data available for the selected period.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-semibold text-brand-main-800'>
						Product Performance Analytics
					</h3>
					<p className='text-sm text-brand-main-600'>
						Detailed insights into product sales and trends
						{selectedCategoryId && " (filtered by category)"}
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

			<TopProductsChart
				data={data}
				onProductClick={onProductClick}
			/>
		</div>
	);
}
