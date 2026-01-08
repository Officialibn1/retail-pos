"use client";

import { useEffect, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { SaleItem } from "@/generated/prisma";
import { useAppSelector } from "@/lib/store";
import { User, Phone, Mail } from "lucide-react";
import {
	selectCartDiscount,
	selectCartSubtotal,
	selectCartTaxAmount,
	selectCartCustomer,
} from "@/lib/store/slices/cartSlice";

interface CheckoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	saleId: string;
	items: SaleItem[];
	subtotal: number;
	discount: number;
	tax: number;
	total: number;
	onCompletePayment: (saleId: string) => void;
	onClose: () => void;
	isProcessing?: boolean;
}

export function CheckoutDialogV2({
	open,
	onOpenChange,
	saleId,
	items,
	total,
	onCompletePayment,
	onClose,
	isProcessing = false,
}: CheckoutDialogProps) {
	const completePaymentButtonRef = useRef<HTMLButtonElement>(null);

	const discount = useAppSelector(selectCartDiscount);
	const subtotal = useAppSelector(selectCartSubtotal);
	const taxAmount = useAppSelector(selectCartTaxAmount);
	const selectedCustomer = useAppSelector(selectCartCustomer);

	const handleCompletePayment = () => {
		onCompletePayment(saleId);
		// Cart will be cleared after this dialog closes
	};

	const handleClose = () => {
		onClose();
		onOpenChange(false);
		// Cart will be cleared by onClose handler
	};

	// Auto-focus "Complete Payment" button when dialog opens
	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				completePaymentButtonRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [open]);

	// Handle keyboard shortcuts
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Enter key to complete payment
			if (e.key === "Enter" && !isProcessing) {
				e.preventDefault();
				handleCompletePayment();
			}
			// Escape key to close
			if (e.key === "Escape" && !isProcessing) {
				e.preventDefault();
				handleClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, isProcessing]);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'
				aria-describedby='checkout-description'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Order Summary
					</DialogTitle>
					<DialogDescription
						id='checkout-description'
						className='text-brand-main-600'>
						Review your order details. You can complete payment now or close to
						complete later.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Customer Information */}
					{selectedCustomer && (
						<div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
							<div className='flex items-center gap-2 mb-2'>
								<User className='h-4 w-4 text-blue-600' />
								<span className='font-medium text-blue-800'>Customer</span>
							</div>
							<div className='space-y-1'>
								<div className='font-medium text-blue-900'>
									{selectedCustomer.name || "Anonymous Customer"}
								</div>
								<div className='space-y-1 text-sm text-blue-700'>
									{selectedCustomer.phone && (
										<div className='flex items-center gap-1'>
											<Phone className='h-3 w-3' />
											{selectedCustomer.phone}
										</div>
									)}
									{selectedCustomer.email && (
										<div className='flex items-center gap-1'>
											<Mail className='h-3 w-3' />
											{selectedCustomer.email}
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Order Summary */}
					<div
						className='space-y-3'
						role='region'
						aria-label='Order summary details'>
						<div className='bg-brand-main-50 p-4 rounded-lg space-y-2'>
							<div className='flex justify-between text-sm text-brand-main-700'>
								<span>Items ({items.length}):</span>
								<span
									data-testid='checkout-subtotal'
									aria-label={`Subtotal: ${formatNaira(subtotal)}`}>
									{formatNaira(subtotal)}
								</span>
							</div>
							{discount > 0 && (
								<div className='flex justify-between text-sm text-brand-main-700'>
									<span>Discount:</span>
									<span
										data-testid='checkout-discount'
										aria-label={`Discount: ${formatNaira(discount)}`}>
										-{formatNaira(discount)}
									</span>
								</div>
							)}
							<div className='flex justify-between text-sm text-brand-main-700'>
								<span>Tax:</span>
								<span
									data-testid='checkout-tax'
									aria-label={`Tax: ${formatNaira(taxAmount)}`}>
									{formatNaira(taxAmount)}
								</span>
							</div>
							<Separator className='bg-brand-main-200' />
							<div className='flex justify-between font-medium text-brand-main-800'>
								<span>Total:</span>
								<span
									data-testid='checkout-total'
									aria-label={`Total: ${formatNaira(total)}`}>
									{formatNaira(total)}
								</span>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className='gap-2 flex-col sm:flex-row'>
					<Button
						type='button'
						variant='outline'
						onClick={handleClose}
						disabled={isProcessing}
						className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 w-full sm:w-auto'
						data-testid='close-button'
						aria-label='Close checkout and save order for later'>
						Close
					</Button>
					<Button
						ref={completePaymentButtonRef}
						onClick={handleCompletePayment}
						disabled={isProcessing}
						className='bg-brand-main-600 hover:bg-brand-main-700 text-white w-full sm:w-auto'
						data-testid='complete-payment-button'
						aria-label='Proceed to complete payment'>
						{isProcessing ? (
							<>
								<Spinner
									className='mr-2'
									aria-hidden='true'
								/>
								Processing...
							</>
						) : (
							"Complete Payment"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
