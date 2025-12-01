"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentMethod } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import {
	calculateChange,
	formatChange,
	quickFillAmount,
} from "@/lib/utils/payment";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PaymentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	saleId: string;
	total: number;
	onCompleteSale: (
		saleId: string,
		paymentMethod: PaymentMethod,
		amountPaid: number,
		shouldShowReceipt?: boolean,
	) => void;
	isProcessing: boolean;
	error?: string | null;
	onRetry?: () => void;
}

export function PaymentDialog({
	open,
	onOpenChange,
	saleId,
	total,
	onCompleteSale,
	isProcessing,
	error,
	onRetry,
}: PaymentDialogProps) {
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
		PaymentMethod.CASH,
	);
	const [amountPaid, setAmountPaid] = useState<number>(0);
	const [changeGiven, setChangeGiven] = useState<number>(0);
	const [generateReceipt, setGenerateReceipt] = useState<boolean>(true);

	// Set amout paid as total when the component mounts
	useEffect(() => {
		setAmountPaid(total);
	}, [total]);

	// Calculate change whenever amountPaid changes
	useEffect(() => {
		if (amountPaid > total) {
			const change = calculateChange(amountPaid, total);
			setChangeGiven(change);
		} else {
			setChangeGiven(0);
		}
	}, [amountPaid, total]);

	const handleQuickFill = () => {
		const exactAmount = quickFillAmount(total);
		setAmountPaid(exactAmount);
	};

	const handleSubmit = () => {
		if (amountPaid === 0 || amountPaid < total) {
			toast.warning("Amount paid is less than the total amount to be paid");

			return;
		}
		onCompleteSale(saleId, paymentMethod, amountPaid, generateReceipt);
	};

	// Auto-focus amount paid field when dialog opens
	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				const amountInput = document.getElementById("amount-paid");
				if (amountInput) {
					amountInput.focus();
				}
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [open]);

	// Handle keyboard shortcuts
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Enter key to submit (only if not in input field to avoid double submission)
			if (
				e.key === "Enter" &&
				!isProcessing &&
				e.target instanceof HTMLElement &&
				e.target.tagName !== "INPUT"
			) {
				e.preventDefault();
				handleSubmit();
			}
			// Escape key to close
			if (e.key === "Escape" && !isProcessing) {
				e.preventDefault();
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, isProcessing, onOpenChange]);

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			setPaymentMethod(PaymentMethod.CASH);
			setAmountPaid(0);
			setChangeGiven(0);
			setGenerateReceipt(true);
		}
	}, [open]);

	const handleRetry = () => {
		if (onRetry) {
			onRetry();
		} else {
			handleSubmit();
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'
				aria-describedby='payment-description'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Complete Payment
					</DialogTitle>
					<DialogDescription
						id='payment-description'
						className='text-brand-main-600'>
						Select payment method and enter amount paid to complete the
						transaction.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Error Display */}
					{error && (
						<div
							className='bg-red-50 border border-red-200 rounded-lg p-4'
							role='alert'
							aria-live='assertive'>
							<div className='flex items-start gap-3'>
								<div className='flex-shrink-0'>
									<svg
										className='h-5 w-5 text-red-600'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										aria-hidden='true'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
										/>
									</svg>
								</div>
								<div className='flex-1'>
									<h3 className='text-sm font-medium text-red-800'>
										Payment Error
									</h3>
									<p className='mt-1 text-sm text-red-700'>{error}</p>
									<button
										onClick={handleRetry}
										disabled={isProcessing}
										className='mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'>
										<RefreshCw className='h-4 w-4 mr-2' />
										Retry Payment
									</button>
								</div>
							</div>
						</div>
					)}
					{/* Order Total */}
					<div className='bg-brand-main-50 p-4 rounded-lg'>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-brand-main-700'>Order Total:</span>
							<span
								className='text-2xl font-bold text-brand-main-800'
								data-testid='payment-total'>
								{formatNaira(total)}
							</span>
						</div>
					</div>

					{/* Payment Method */}
					<div className='space-y-3'>
						<Label className='text-brand-main-800'>Payment Method</Label>
						<RadioGroup
							value={paymentMethod}
							onValueChange={(value) =>
								setPaymentMethod(value as PaymentMethod)
							}
							disabled={isProcessing}
							data-testid='payment-method-group'
							aria-label='Select payment method'>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.CASH}
									id='cash'
									data-testid='payment-method-cash'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='cash'
									className='font-normal cursor-pointer'>
									Cash
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.CARD}
									id='card'
									data-testid='payment-method-card'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='card'
									className='font-normal cursor-pointer'>
									Card
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.MOBILE_MONEY}
									id='mobile-money'
									data-testid='payment-method-mobile-money'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='mobile-money'
									className='font-normal cursor-pointer'>
									Mobile Money
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.BANK_TRANSFER}
									id='bank-transfer'
									data-testid='payment-method-bank-transfer'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='bank-transfer'
									className='font-normal cursor-pointer'>
									Bank Transfer
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Amount Paid */}
					<div className='space-y-2'>
						<Label
							htmlFor='amount-paid'
							className='text-brand-main-800'>
							Amount Paid
						</Label>
						<div className='flex gap-2'>
							<Input
								id='amount-paid'
								type='number'
								step='0.01'
								min='0'
								placeholder='Enter amount paid'
								value={amountPaid}
								onChange={(e) => setAmountPaid(Number(e.target.value))}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !isProcessing) {
										e.preventDefault();
										handleSubmit();
									}
								}}
								disabled={isProcessing}
								className='flex-1'
								data-testid='amount-paid-input'
								aria-label='Amount paid by customer'
							/>
							<Button
								type='button'
								variant='outline'
								onClick={handleQuickFill}
								disabled={isProcessing}
								className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50'
								data-testid='quick-fill-button'
								aria-label='Fill exact amount'>
								Exact
							</Button>
						</div>
					</div>

					{/* Change Given */}
					<div className='space-y-2'>
						<Label
							htmlFor='change-given'
							className='text-brand-main-800'>
							Change Given
						</Label>
						<Input
							id='change-given'
							type='text'
							value={formatChange(changeGiven)}
							readOnly
							className='bg-gray-50'
							data-testid='change-given-display'
							aria-label='Change to give to customer'
							aria-readonly='true'
						/>
					</div>

					{/* Receipt Generation */}
					<div className='flex items-center space-x-2'>
						<Checkbox
							id='generate-receipt'
							checked={generateReceipt}
							onCheckedChange={(checked) =>
								setGenerateReceipt(checked as boolean)
							}
							disabled={isProcessing}
							data-testid='generate-receipt-checkbox'
							aria-label='Generate receipt after payment'
						/>
						<Label
							htmlFor='generate-receipt'
							className='font-normal cursor-pointer'>
							Generate receipt
						</Label>
					</div>
				</div>

				<DialogFooter className='gap-2 flex-col sm:flex-row'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isProcessing}
						className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 w-full sm:w-auto'
						data-testid='cancel-button'
						aria-label='Cancel payment and return'>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isProcessing || amountPaid < total}
						className='bg-brand-main-600 hover:bg-brand-main-700 text-white w-full sm:w-auto'
						data-testid='complete-sale-button'
						aria-label='Complete sale and process payment'>
						{isProcessing ? (
							<>
								<Spinner
									className='mr-2'
									aria-hidden='true'
								/>
								Processing...
							</>
						) : (
							"Complete Sale"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
