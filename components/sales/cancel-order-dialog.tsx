"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { formatNaira } from "@/lib/utils";

interface CancelOrderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isProcessing: boolean;
	orderTotal: number;
}

export function CancelOrderDialog({
	open,
	onOpenChange,
	onConfirm,
	isProcessing,
	orderTotal,
}: CancelOrderDialogProps) {
	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800 flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5 text-amber-500' />
						Cancel Order
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Are you sure you want to cancel this order? This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='bg-brand-main-50 p-4 rounded-lg border  '>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-brand-main-700'>
								Order Total:
							</span>
							<span className='text-lg font-semibold text-brand-main-800'>
								{formatNaira(orderTotal)}
							</span>
						</div>
					</div>

					<p className='text-sm text-brand-main-600'>
						The order will be marked as cancelled and removed from the pending
						orders list. Inventory stock will not be affected.
					</p>
				</div>

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='  text-brand-main-700 hover:bg-brand-main-50'
						disabled={isProcessing}>
						Keep Order
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isProcessing}
						variant='destructive'
						className='bg-red-600 hover:bg-red-700 text-white'>
						{isProcessing ? "Cancelling..." : "Cancel Order"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
