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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatNaira } from "@/lib/utils";
import { PaymentMethod } from "@/lib/types";
import { SaleWithDetails } from "@/lib/services/sale.service";
import { RotateCcw } from "lucide-react";

interface ReturnItem {
	inventoryItemId: string;
	name: string;
	sku: string;
	maxQuantity: number;
	unitPrice: number;
	selected: boolean;
	quantity: number;
}

interface ReturnDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sale: SaleWithDetails | null;
	onProcessReturn: (data: {
		items: { inventoryItemId: string; quantity: number }[];
		reason: string;
		refundMethod: string;
	}) => void;
	isProcessing: boolean;
}

export function ReturnDialog({
	open,
	onOpenChange,
	sale,
	onProcessReturn,
	isProcessing,
}: ReturnDialogProps) {
	const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
	const [reason, setReason] = useState("");
	const [refundMethod, setRefundMethod] = useState<PaymentMethod>(
		PaymentMethod.CASH,
	);

	// Initialise items whenever the sale changes or dialog opens
	useEffect(() => {
		if (sale && open) {
			setReturnItems(
				sale.items.map((item) => ({
					inventoryItemId: item.inventoryItem.id,
					name: item.inventoryItem.name,
					sku: item.inventoryItem.sku,
					maxQuantity: item.quantity,
					unitPrice: Number(item.price),
					selected: false,
					quantity: item.quantity,
				})),
			);
			setReason("");
			setRefundMethod(PaymentMethod.CASH);
		}
	}, [sale, open]);

	const handleToggleItem = (inventoryItemId: string, checked: boolean) => {
		setReturnItems((prev) =>
			prev.map((item) =>
				item.inventoryItemId === inventoryItemId
					? { ...item, selected: checked }
					: item,
			),
		);
	};

	const handleQuantityChange = (inventoryItemId: string, value: number) => {
		setReturnItems((prev) =>
			prev.map((item) =>
				item.inventoryItemId === inventoryItemId
					? {
							...item,
							quantity: Math.min(
								Math.max(1, Math.floor(value)),
								item.maxQuantity,
							),
						}
					: item,
			),
		);
	};

	const selectedItems = returnItems.filter((item) => item.selected);
	const refundAmount = selectedItems.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	);
	const canSubmit =
		selectedItems.length > 0 && reason.trim().length > 0 && !isProcessing;

	const handleSubmit = () => {
		if (!canSubmit) return;
		onProcessReturn({
			items: selectedItems.map((item) => ({
				inventoryItemId: item.inventoryItemId,
				quantity: item.quantity,
			})),
			reason: reason.trim(),
			refundMethod,
		});
	};

	if (!sale) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className='sm:max-w-[560px] max-h-[90vh] overflow-y-auto'
				aria-describedby='return-description'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800 flex items-center gap-2'>
						<RotateCcw className='h-5 w-5' />
						Process Return
					</DialogTitle>
					<DialogDescription
						id='return-description'
						className='text-brand-main-600'>
						Select items to return and provide a reason. Stock will be restocked
						automatically.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-5'>
					{/* Sale reference */}
					<div className='bg-brand-main-50 p-3 rounded-lg text-sm text-brand-main-700'>
						<span className='font-medium'>Sale #{sale.id.slice(0, 8)}</span>
						{sale.customer?.name && (
							<span className='ml-2 text-brand-main-600'>
								— {sale.customer.name}
							</span>
						)}
					</div>

					{/* Item selection */}
					<div className='space-y-2'>
						<Label className='text-brand-main-800'>Select Items to Return</Label>
						<div className='border rounded-lg divide-y'>
							{returnItems.map((item) => (
								<div
									key={item.inventoryItemId}
									className='flex items-center gap-3 p-3'>
									<Checkbox
										id={`return-item-${item.inventoryItemId}`}
										checked={item.selected}
										onCheckedChange={(checked) =>
											handleToggleItem(item.inventoryItemId, checked as boolean)
										}
										disabled={isProcessing}
										aria-label={`Select ${item.name} for return`}
									/>
									<div className='flex-1'>
										<Label
											htmlFor={`return-item-${item.inventoryItemId}`}
											className='font-medium text-brand-main-800 cursor-pointer'>
											{item.name}
										</Label>
										<p className='text-xs text-brand-main-500'>
											{item.sku} · {formatNaira(item.unitPrice)} each · Max{" "}
											{item.maxQuantity}
										</p>
									</div>
									{item.selected && (
										<div className='flex items-center gap-2'>
											<Label className='text-xs text-brand-main-600 sr-only'>
												Qty
											</Label>
											<Input
												type='number'
												min={1}
												max={item.maxQuantity}
												value={item.quantity}
												onChange={(e) =>
													handleQuantityChange(
														item.inventoryItemId,
														Number(e.target.value),
													)
												}
												disabled={isProcessing}
												className='w-16 h-8 text-sm border-brand-main-200'
												aria-label={`Return quantity for ${item.name}`}
											/>
										</div>
									)}
									{!item.selected && (
										<span className='text-xs text-brand-main-400 w-16 text-right'>
											{item.maxQuantity} pcs
										</span>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Refund amount preview */}
					{selectedItems.length > 0 && (
						<div className='bg-brand-main-50 p-3 rounded-lg flex justify-between items-center'>
							<span className='text-sm text-brand-main-700'>
								Estimated Refund ({selectedItems.length} item
								{selectedItems.length > 1 ? "s" : ""}):
							</span>
							<span className='text-lg font-semibold text-brand-main-800'>
								{formatNaira(refundAmount)}
							</span>
						</div>
					)}

					<Separator className='bg-brand-main-200' />

					{/* Reason */}
					<div className='space-y-2'>
						<Label
							htmlFor='return-reason'
							className='text-brand-main-800'>
							Reason for Return <span className='text-red-500'>*</span>
						</Label>
						<Textarea
							id='return-reason'
							placeholder='e.g. Defective product, wrong item, customer changed mind…'
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							disabled={isProcessing}
							className='border-brand-main-200 focus:border-brand-main-400 resize-none'
							rows={3}
							maxLength={500}
							aria-required='true'
						/>
						<p className='text-xs text-brand-main-500 text-right'>
							{reason.length}/500
						</p>
					</div>

					{/* Refund method */}
					<div className='space-y-3'>
						<Label className='text-brand-main-800'>Refund Method</Label>
						<RadioGroup
							value={refundMethod}
							onValueChange={(value) => setRefundMethod(value as PaymentMethod)}
							disabled={isProcessing}
							aria-label='Select refund method'>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.CASH}
									id='refund-cash'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='refund-cash'
									className='font-normal cursor-pointer'>
									Cash
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.CARD}
									id='refund-card'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='refund-card'
									className='font-normal cursor-pointer'>
									Card
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.MOBILE_MONEY}
									id='refund-mobile-money'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='refund-mobile-money'
									className='font-normal cursor-pointer'>
									Mobile Money
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem
									value={PaymentMethod.BANK_TRANSFER}
									id='refund-bank-transfer'
									disabled={isProcessing}
								/>
								<Label
									htmlFor='refund-bank-transfer'
									className='font-normal cursor-pointer'>
									Bank Transfer
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>

				<DialogFooter className='gap-2 flex-col sm:flex-row'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isProcessing}
						className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 w-full sm:w-auto'>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!canSubmit}
						className='bg-brand-main-600 hover:bg-brand-main-700 text-white w-full sm:w-auto'>
						{isProcessing ? (
							<>
								<Spinner
									className='mr-2'
									aria-hidden='true'
								/>
								Processing…
							</>
						) : (
							<>
								<RotateCcw className='h-4 w-4 mr-2' />
								Process Return
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
