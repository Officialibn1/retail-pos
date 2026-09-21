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
import { AlertTriangle, RefreshCw, Package } from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";
import { useGetTopProductsQuery } from "@/lib/store/api";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";

interface TopProductsReportProps {
	limit?: number;
	onProductClick?: (productId: string) => void;
	onRefresh?: () => void;
}

export function TopProductsReport({
	limit = 5,
	onProductClick,
	onRefresh,
}: TopProductsReportProps) {
	const c = useCurrencySymbol();
	const {
		data: topProducts = [],
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useGetTopProductsQuery({ limit });

	const handleRefresh = () => {
		refetch();
	};

	if (isLoading) {
		return (
			<Card className=' '>
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
						{Array.from({ length: limit }).map((_, i) => (
							<div
								key={i}
								className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<Skeleton className='h-8 w-8 rounded-full' />
									<div className='space-y-2'>
										<Skeleton className='h-4 w-32' />
										<Skeleton className='h-3 w-20' />
									</div>
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
						Top Products Error
					</CardTitle>
					<CardDescription className='text-red-700'>
						Failed to load top products data
					</CardDescription>
				</CardHeader>
				<CardContent className='flex items-center justify-center py-8'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>
							{(error as any)?.data?.error?.message ||
								(error as any)?.message ||
								"Unable to fetch products data"}
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
		<Card className=' '>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Package className='h-5 w-5' />
							Top Products
						</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Best selling items
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
					{topProducts.length > 0 ? (
						topProducts.map((product, index) => (
							<div
								key={product.productId}
								className='flex items-center justify-between cursor-pointer hover:bg-brand-main-50 p-2 rounded transition-colors'
								onClick={() => onProductClick?.(product.productId)}>
								<div className='flex items-center gap-3'>
									<div className='flex h-8 w-8 items-center justify-center rounded-full bg-brand-main-100 text-xs font-medium text-brand-main-800'>
										{index + 1}
									</div>
									<div>
										<p className='text-sm font-medium text-brand-main-800'>
											{product.productName}
										</p>
										<p className='text-xs text-brand-main-600'>
											{product.quantitySold} units sold
										</p>
									</div>
								</div>
								<div className='text-sm font-medium text-brand-main-800'>
									{formatNaira(product.revenue, c)}
								</div>
							</div>
						))
					) : (
						<div className='flex items-center justify-center py-8 text-brand-main-600'>
							<div className='text-center'>
								<Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No product data available</p>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
