"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
	CreditCard,
	Banknote,
	Smartphone,
	BanknoteIcon,
	SmartphoneNfc,
} from "lucide-react";
import type { PaymentMethod, SaleItem } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

interface CheckoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	items: SaleItem[];
	subtotal: number;
	discount: number;
	tax: number;
	total: number;
	onCompleteSale: (
		paymentMethod: PaymentMethod,
		shouldShowReceipt?: boolean,
	) => void;
	isProcessing: boolean;
}

export function CheckoutDialog({
	open,
	onOpenChange,
	items,
	subtotal,
	discount,
	tax,
	total,
	onCompleteSale,
	isProcessing,
}: CheckoutDialogProps) {
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");

	const [generateReceipt, setGenerateReceipt] = useState(true);

	const handleCompleteSale = async () => {
		onCompleteSale(paymentMethod, generateReceipt);
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-lunar-green-800'>
						Complete Sale
					</DialogTitle>
					<DialogDescription className='text-lunar-green-600'>
						Review the order details and select a payment method to complete the
						sale.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Order Summary */}
					<div className='space-y-3'>
						<h3 className='font-medium text-lunar-green-800'>Order Summary</h3>
						<div className='bg-lunar-green-50 p-3 rounded-lg space-y-2'>
							<div className='flex justify-between text-sm text-lunar-green-700'>
								<span>Items ({items.length}):</span>
								<span>{formatNaira(subtotal)}</span>
							</div>
							{discount > 0 && (
								<div className='flex justify-between text-sm text-lunar-green-700'>
									<span>Discount:</span>
									<span>-{formatNaira(discount)}</span>
								</div>
							)}
							<div className='flex justify-between text-sm text-lunar-green-700'>
								<span>Tax:</span>
								<span>{formatNaira(tax)}</span>
							</div>
							<Separator className='bg-lunar-green-200' />
							<div className='flex justify-between font-medium text-lunar-green-800'>
								<span>Total:</span>
								<span>{formatNaira(total)}</span>
							</div>
						</div>
					</div>

					{/* Payment Method */}
					<div className='space-y-3'>
						<h3 className='font-medium text-lunar-green-800'>Payment Method</h3>
						<RadioGroup
							value={paymentMethod}
							onValueChange={(value) => setPaymentMethod(value as any)}>
							<div className='flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg'>
								<RadioGroupItem
									value='CARD'
									id='CARD'
								/>
								<Label
									htmlFor='CARD'
									className='flex items-center gap-2 cursor-pointer flex-1'>
									<CreditCard className='h-4 w-4 text-lunar-green-600' />
									<span className='text-lunar-green-700'>
										Credit/Debit Card
									</span>
								</Label>
							</div>
							<div className='flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg'>
								<RadioGroupItem
									value='CASH'
									id='CASH'
								/>
								<Label
									htmlFor='CASH'
									className='flex items-center gap-2 cursor-pointer flex-1'>
									<Banknote className='h-4 w-4 text-lunar-green-600' />
									<span className='text-lunar-green-700'>Cash</span>
								</Label>
							</div>
							<div className='flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg'>
								<RadioGroupItem
									value='MOBILE_MONEY'
									id='MOBILE_MONEY'
								/>
								<Label
									htmlFor='MOBILE_MONEY'
									className='flex items-center gap-2 cursor-pointer flex-1'>
									<Smartphone className='h-4 w-4 text-lunar-green-600' />
									<span className='text-lunar-green-700'>
										Mobile Wallet Transfer
									</span>
								</Label>
							</div>
							<div className='flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg'>
								<RadioGroupItem
									value='BANK_TRANSFER'
									id='BANK_TRANSFER'
								/>
								<Label
									htmlFor='BANK_TRANSFER'
									className='flex items-center gap-2 cursor-pointer flex-1'>
									<SmartphoneNfc className='h-4 w-4 text-lunar-green-600' />
									<span className='text-lunar-green-700'>Bank Transfer</span>
								</Label>
							</div>
						</RadioGroup>
					</div>

					<div className='space-y-3'>
						<h3 className='font-medium text-lunar-green-800'>
							Receipt Options
						</h3>
						<div className='flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg'>
							<input
								type='checkbox'
								id='generate-receipt'
								checked={generateReceipt}
								onChange={(e) => setGenerateReceipt(e.target.checked)}
								className='rounded border-lunar-green-300 text-lunar-green-600 focus:ring-lunar-green-500'
							/>
							<Label
								htmlFor='generate-receipt'
								className='cursor-pointer text-lunar-green-700'>
								Generate and print receipt
							</Label>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50'
						disabled={isProcessing}>
						Cancel
					</Button>
					<Button
						onClick={handleCompleteSale}
						disabled={isProcessing}
						className='bg-lunar-green-600 hover:bg-lunar-green-700 text-white'>
						{isProcessing
							? "Processing..."
							: `Complete Sale - ${formatNaira(total)}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
