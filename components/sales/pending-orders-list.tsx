"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingOrderCard } from "./pending-order-card";
import { CancelOrderDialog } from "./cancel-order-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package } from "lucide-react";
import { useGetSalesQuery, useCancelSaleMutation } from "@/lib/store/api";
import { toast } from "sonner";

interface PendingOrdersListProps {
	userId: string;
	userRoles: string[];
	onComplete?: (saleId: string, saleTotal: number) => void;
	onCancel?: (saleId: string) => void;
}

export function PendingOrdersList({
	userId,
	userRoles,
	onComplete,
	onCancel,
}: PendingOrdersListProps) {
	const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [cancelOrderTotal, setCancelOrderTotal] = useState(0);

	// Fetch pending sales - role-based filtering is handled on backend
	const {
		data: pendingSales = [],
		isLoading,
		isError,
		error,
	} = useGetSalesQuery({ status: "PENDING" });

	const [cancelSale, { isLoading: isCancelling }] = useCancelSaleMutation();

	// Determine if user is manager or higher
	const isManagerOrHigher = userRoles.some((role) =>
		["MANAGER", "ADMIN", "SUPERADMIN"].includes(role),
	);

	// Handle complete action - delegate to parent with sale details
	const handleComplete = (saleId: string) => {
		if (onComplete) {
			const sale = pendingSales.find((s) => s.id === saleId);
			if (sale) {
				// Pass sale ID and total to parent for payment dialog
				onComplete(saleId, Number(sale.total));
			}
		}
	};

	// Handle cancel action - open confirmation dialog
	const handleCancelClick = (saleId: string) => {
		const sale = pendingSales.find((s) => s.id === saleId);
		if (sale) {
			setSelectedSaleId(saleId);
			setCancelOrderTotal(Number(sale.total));
			setShowCancelDialog(true);
		}
	};

	// Confirm cancellation
	const handleConfirmCancel = async () => {
		if (!selectedSaleId) return;

		try {
			await cancelSale(selectedSaleId).unwrap();
			toast.success("Order cancelled successfully");
			setShowCancelDialog(false);
			setSelectedSaleId(null);

			// Notify parent if callback provided
			if (onCancel) {
				onCancel(selectedSaleId);
			}
		} catch (err: any) {
			console.error("Failed to cancel order:", err);
			toast.error(err?.data?.error?.message || "Failed to cancel order");
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<Card className=' '>
				<CardHeader>
					<CardTitle className='text-brand-main-800 flex items-center gap-2'>
						<Package className='h-5 w-5' />
						Pending Orders
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<Skeleton className='h-32 w-full' />
					<Skeleton className='h-32 w-full' />
					<Skeleton className='h-32 w-full' />
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (isError) {
		return (
			<Card className='border-red-200 bg-red-50'>
				<CardHeader>
					<CardTitle className='text-red-800 flex items-center gap-2'>
						<AlertCircle className='h-5 w-5' />
						Error Loading Pending Orders
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-red-700 text-sm'>
						{(error as any)?.data?.error?.message ||
							"Failed to load pending orders"}
					</p>
				</CardContent>
			</Card>
		);
	}

	// Empty state
	if (pendingSales.length === 0) {
		return (
			<Card className=' '>
				<CardHeader>
					<CardTitle className='text-brand-main-800 flex items-center gap-2'>
						<Package className='h-5 w-5' />
						Pending Orders
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8'>
						<Package className='h-12 w-12 mx-auto text-brand-main-300 mb-3' />
						<p className='text-brand-main-600 text-sm'>
							No pending orders at the moment
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className=' '>
				<CardHeader>
					<CardTitle className='text-brand-main-800 flex items-center gap-2'>
						<Package className='h-5 w-5' />
						Pending Orders
						<span className='text-sm font-normal text-brand-main-600'>
							({pendingSales.length})
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					{pendingSales.map((sale) => (
						<PendingOrderCard
							key={sale.id}
							sale={sale}
							onComplete={handleComplete}
							onCancel={handleCancelClick}
							isProcessing={isCancelling && selectedSaleId === sale.id}
							showCreatorName={isManagerOrHigher}
						/>
					))}
				</CardContent>
			</Card>

			{/* Cancel Order Dialog */}
			<CancelOrderDialog
				open={showCancelDialog}
				onOpenChange={setShowCancelDialog}
				onConfirm={handleConfirmCancel}
				isProcessing={isCancelling}
				orderTotal={cancelOrderTotal}
			/>
		</>
	);
}
