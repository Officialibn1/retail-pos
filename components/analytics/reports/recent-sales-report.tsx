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
import { AlertTriangle, RefreshCw, Receipt } from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";
import { useGetDashboardStatsQuery } from "@/lib/store/api";

interface RecentSalesReportProps {
	onSaleClick?: (saleId: string) => void;
	onRefresh?: () => void;
}

export function RecentSalesReport({
	onSaleClick,
	onRefresh,
}: RecentSalesReportProps) {
	const {
		data: dashboardStats,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useGetDashboardStatsQuery();

	const handleRefresh = () => {
		refetch();
	};

	if (isLoading) {
		return (
			<Card className='border-brand-main-200'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<Skeleton className='h-6 w-32 mb-2' />
							<Skeleton className='h-4 w-24' />
						</div>
						<Skeleton className='h-8 w-20' />
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className='flex items-center justify-between'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-3 w-32' />
								</div>
								<Skeleton className='h-4 w-16' />
							</div>
						))}
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
						Recent Sales Error
					</CardTitle>
					<CardDescription className='text-red-700'>
						Failed to load recent sales data
					</CardDescription>
				</CardHeader>
				<CardContent className='flex items-center justify-center py-8'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>
							{(error as any)?.data?.error?.message ||
								(error as any)?.message ||
								"Unable to fetch recent sales"}
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

	if (!dashboardStats) {
		return (
			<Alert>
				<AlertTriangle className='h-4 w-4' />
				<AlertDescription>
					No recent sales data available at this time.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className='border-brand-main-200'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Receipt className='h-5 w-5' />
							Recent Sales
						</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Latest transactions
						</CardDescription>
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
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{dashboardStats.recentSales.length > 0 ? (
						dashboardStats.recentSales.map((sale) => (
							<div
								key={sale.id}
								className='flex items-center justify-between cursor-pointer hover:bg-brand-main-50 p-2 rounded transition-colors'
								onClick={() => onSaleClick?.(sale.id)}>
								<div>
									<p className='text-sm font-medium text-brand-main-800'>
										Sale #{sale.id.slice(0, 8)}
									</p>
									<p className='text-xs text-brand-main-600'>
										{new Date(sale.createdAt).toLocaleDateString()} •{" "}
										{sale.itemCount} items
									</p>
								</div>
								<div className='text-sm font-medium text-brand-main-800'>
									{formatNaira(sale.total)}
								</div>
							</div>
						))
					) : (
						<div className='flex items-center justify-center py-8 text-brand-main-600'>
							<div className='text-center'>
								<Receipt className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No recent sales</p>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
