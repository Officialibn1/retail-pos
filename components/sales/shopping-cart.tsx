"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus } from "lucide-react";
import type { SaleItem, InventoryItem } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface CartItem extends SaleItem {
	product: InventoryItem;
}

interface ShoppingCartProps {
	items: CartItem[];
	onUpdateQuantity: (itemId: string, quantity: number) => void;
	onRemoveItem: (itemId: string) => void;
	onApplyDiscount: (discount: number) => void;
	discount: number;
	onCheckout: () => void;
	isProcessing: boolean;
}

const taxRate = process.env.NEXT_PUBLIC_TAX_AMOUNT as string;

export function ShoppingCart({
	items,
	onUpdateQuantity,
	onRemoveItem,
	onApplyDiscount,
	discount,
	onCheckout,
	isProcessing,
}: ShoppingCartProps) {
	const subtotal = items.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0,
	);
	const discountAmount = (subtotal * discount) / 100;
	const taxAmount = (subtotal - discountAmount) * Number(taxRate);
	const total = subtotal - discountAmount + taxAmount;

	return (
		<Card className='border-brand-main-200 h-full'>
			<CardHeader>
				<CardTitle className='text-brand-main-800'>
					Shopping Cart ({items.length} items)
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{items.length === 0 ? (
					<div className='text-center py-8 text-brand-main-600'>
						Your cart is empty
					</div>
				) : (
					<>
						<div className='space-y-3 h-full max-h-60 overflow-y-auto'>
							{items.map((item) => (
								<div
									key={item.id}
									className='flex items-center gap-3 p-3 bg-brand-main-50 rounded-lg'>
									<div className='flex-1'>
										<h4 className='font-medium text-brand-main-800 text-sm'>
											{item.product.name}
										</h4>
										<p className='text-xs text-brand-main-600'>
											{formatNaira(Number(item.price))} each
										</p>
									</div>
									<div className='flex items-center gap-2'>
										<Button
											size='sm'
											disabled={isProcessing}
											variant='outline'
											onClick={() =>
												onUpdateQuantity(
													item.id,
													Math.max(1, item.quantity - 1),
												)
											}
											className='h-6 w-6 p-0 border-brand-main-200'>
											<Minus className='h-3 w-3' />
										</Button>
										<span className='text-sm font-medium text-brand-main-800 w-8 text-center'>
											{item.quantity}
										</span>
										<Button
											size='sm'
											variant='outline'
											onClick={() =>
												onUpdateQuantity(item.id, item.quantity + 1)
											}
											className='h-6 w-6 p-0 border-brand-main-200'
											disabled={
												item.quantity >= item.product.stock || isProcessing
											}>
											<Plus className='h-3 w-3' />
										</Button>
									</div>
									<div className='text-sm font-medium text-brand-main-800 w-16 text-right'>
										{formatNaira(Number(item.price) * item.quantity)}
									</div>
									<Button
										size='sm'
										variant='ghost'
										disabled={isProcessing}
										onClick={() => onRemoveItem(item.id)}
										className='h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'>
										<Trash2 className='h-3 w-3' />
									</Button>
								</div>
							))}
						</div>

						<Separator className='bg-brand-main-200' />

						<div className='space-y-3'>
							<div className='flex items-center gap-2'>
								<label className='text-sm text-brand-main-700'>
									Discount (%):
								</label>
								<Input
									type='number'
									min='0'
									max='100'
									value={discount}
									disabled={isProcessing}
									onChange={(e) => onApplyDiscount(Number(e.target.value) || 0)}
									className='w-20 h-8 border-brand-main-200 focus:border-brand-main-400'
								/>
							</div>

							<div className='space-y-2 text-sm'>
								<div className='flex justify-between text-brand-main-700'>
									<span>Subtotal:</span>
									<span>{formatNaira(subtotal)}</span>
								</div>
								{discount > 0 && (
									<div className='flex justify-between text-brand-main-700'>
										<span>Discount ({discount}%):</span>
										<span>-{formatNaira(discountAmount)}</span>
									</div>
								)}
								<div className='flex justify-between text-brand-main-700'>
									<span>Tax ({Number(taxRate) * 100}%):</span>
									<span>{formatNaira(taxAmount)}</span>
								</div>
								<Separator className='bg-brand-main-200' />
								<div className='flex justify-between font-medium text-brand-main-800'>
									<span>Total:</span>
									<span>{formatNaira(total)}</span>
								</div>
							</div>

							<Button
								onClick={onCheckout}
								disabled={items.length === 0 || isProcessing}
								className='w-full bg-brand-main-600 hover:bg-brand-main-700 text-white'>
								{isProcessing ? <Spinner /> : "Proceed to Checkout"}
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
