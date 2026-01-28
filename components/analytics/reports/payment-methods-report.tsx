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
import { AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import { PaymentMethodChart } from "@/components/analytics/payment-methods-chart";
import { usePaymentBreakdown } from "@/hooks/use-analytics";
import { useGetPaymentMethodsQuery } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";

interface PaymentMethodsReportProps {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	onPaymentMethodClick?: (method: any) => void;
	onRefresh?: () => void;
}

export function PaymentMethodsReport({
	dateRange,
	onPaymentMethodClick,
	onRefresh,
}: PaymentMethodsReportProps) {
	// Try enhanced analytics first
	const enhancedQuery = usePaymentBreakdown(dateRange, { enabled: true });

	// Fallback to legacy query
	const {
		data: legacyPaymentMethods = [],
		isLoading: isLegacyLoading,
		isError: isLegacyError,
		error: legacyError,
		refetch: refetchLegacy,
	} = useGetPaymentMethodsQuery();

	// Use enhanced data if available, otherwise fallback to legacy
	const isLoading =
		enhancedQuery.isLoading || (enhancedQuery.error && isLegacyLoading);
	const isError = enhancedQuery.isError && isLegacyError;
	const error = enhancedQuery.error || legacyError;
	const hasData = enhancedQuery.data || legacyPaymentMethods.length > 0;

	const handleRefresh = () => {
		enhancedQuery.refetch();
		refetchLegacy();
		onRefresh?.();
	};

	if (isLoading) {
		return (
			<Card className='border-brand-main-200'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<Skeleton className='h-6 w-32 mb-2' />
							<Skeleton className='h-4 w-48' />
						</div>
						<Skeleton className='h-8 w-20' />
					</div>
				</CardHeader>
				<CardContent className='p-3 flex-1'>
					<div className='space-y-4'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className='flex items-center justify-between'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-20' />
									<Skeleton className='h-3 w-24' />
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
						Payment Methods Error
					</CardTitle>
					<CardDescription className='text-red-700'>
						Failed to load payment methods data
					</CardDescription>
				</CardHeader>
				<CardContent className='flex items-center justify-center py-8'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>
							{(error as any)?.message || "Unable to fetch payment data"}
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
		<Card className='border-brand-main-200'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<CreditCard className='h-5 w-5' />
							Payment Methods
						</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Sales distribution by payment type
						</CardDescription>
					</div>
					<Button
						variant='outline'
						size='sm'
						onClick={handleRefresh}
						className='flex items-center gap-2'>
						<RefreshCw className='h-3 w-3' />
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent className='p-3 flex-1'>
				{enhancedQuery.data ? (
					<PaymentMethodChart
						data={enhancedQuery.data}
						onPaymentMethodClick={onPaymentMethodClick}
					/>
				) : legacyPaymentMethods.length > 0 ? (
					<div className='space-y-4'>
						{legacyPaymentMethods.map((method) => (
							<div
								key={method.method}
								className='flex items-center justify-between cursor-pointer hover:bg-brand-main-50 p-2 rounded'
								onClick={() => onPaymentMethodClick?.(method)}>
								<div>
									<p className='text-sm font-medium text-brand-main-800'>
										{method.method}
									</p>
									<p className='text-xs text-brand-main-600'>
										{method.count} transactions
									</p>
								</div>
								<div className='text-sm font-medium text-brand-main-800'>
									{formatNaira(method.revenue)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='flex items-center justify-center py-8 text-brand-main-600'>
						<div className='text-center'>
							<CreditCard className='h-12 w-12 mx-auto mb-4 opacity-50' />
							<p>No payment data available</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
