"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, Pencil, X, AlertCircle } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { InventoryItem, SaleItem } from "@/generated/prisma";
import { useAppDispatch } from "@/lib/store";
import { setDiscount, setItemNote } from "@/lib/store/slices/cartSlice";

interface CartItem extends SaleItem {
	product: InventoryItem;
	note?: string;
}

interface ShoppingCartProps {
	items: CartItem[];
	onUpdateQuantity: (itemId: string, quantity: number) => void;
	onRemoveItem: (itemId: string) => void;
	onApplyDiscount: (discount: number) => void;
	discount: number;
	onCheckout: () => void;
	isProcessing: boolean;
	/** When set, the cart is in "edit pending order" mode */
	editingOrderId?: string | null;
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
	editingOrderId,
}: ShoppingCartProps) {
	const dispatch = useAppDispatch();
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
	const [noteInput, setNoteInput] = useState("");

	const subtotal = items.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0,
	);

	const discountAmount = (subtotal * discount) / 100;
	const taxAmount = (subtotal - discountAmount) * Number(taxRate);
	const total = subtotal - discountAmount + taxAmount;

	const handleOpenNote = (item: CartItem) => {
		setEditingNoteId(item.id);
		setNoteInput(item.note ?? "");
	};

	const handleSaveNote = (itemId: string) => {
		dispatch(setItemNote({ itemId, note: noteInput.trim() }));
		setEditingNoteId(null);
		setNoteInput("");
	};

	const isEditing = !!editingOrderId;
	const truncatedId = editingOrderId?.slice(0, 8);

	return (
		<Card className='h-fit'>
			{/* Editing banner */}
			{isEditing && (
				<div className='flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 rounded-t-lg'>
					<AlertCircle className='h-4 w-4 text-amber-600 shrink-0' />
					<p className='text-xs font-medium text-amber-800'>
						Editing Order #{truncatedId} — modify items then click Update Order
					</p>
				</div>
			)}

			<CardHeader>
				<CardTitle className='text-brand-main-800'>
					Shopping Cart ({items.length} items)
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-4 pb-4'>
				{items.length === 0 ? (
					<div className='text-center py-8 text-muted-foreground'>
						Your cart is empty
					</div>
				) : (
					<>
						<div className='space-y-3 h-60 overflow-y-auto border rounded-xl p-1'>
							{items.map((item) => (
								<div
									key={item.id}
									className='flex flex-col gap-1 p-3 bg-brand-main-50 rounded-lg'>
									<div className='flex items-center gap-3 lg:flex-col lg:items-start xl:flex-row xl:items-center'>
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
													onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
												}
												className='h-6 w-6 p-0'>
												<Minus className='h-3 w-3' />
											</Button>
											<span className='text-sm font-medium text-brand-main-800 w-8 text-center'>
												{item.quantity}
											</span>
											<Button
												size='sm'
												variant='outline'
												onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
												className='h-6 w-6 p-0'
												disabled={item.quantity >= item.product.stock || isProcessing}>
												<Plus className='h-3 w-3' />
											</Button>
										</div>

										<div className='flex items-center gap-2 justify-between flex-1'>
											<div className='text-sm font-medium text-brand-main-800 w-16 text-right'>
												{formatNaira(Number(item.price) * item.quantity)}
											</div>
											<div className='flex items-center gap-1'>
												<Button
													size='sm'
													variant='ghost'
													disabled={isProcessing}
													onClick={() => handleOpenNote(item)}
													title='Add note'
													className='h-6 w-6 p-0 text-brand-main-500 hover:text-brand-main-700 hover:bg-brand-main-100'>
													<Pencil className='h-3 w-3' />
												</Button>
												<Button
													size='sm'
													variant='ghost'
													disabled={isProcessing}
													onClick={() => onRemoveItem(item.id)}
													className='h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'>
													<Trash2 className='h-3 w-3' />
												</Button>
											</div>
										</div>
									</div>

									{/* Inline note editor */}
									{editingNoteId === item.id ? (
										<div className='flex gap-1 mt-1'>
											<Input
												autoFocus
												value={noteInput}
												onChange={(e) => setNoteInput(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleSaveNote(item.id);
													if (e.key === "Escape") setEditingNoteId(null);
												}}
												placeholder='e.g. gift wrap, no ice...'
												className='h-7 text-xs focus:border-brand-main-400'
												maxLength={120}
											/>
											<Button
												size='sm'
												className='h-7 px-2 bg-brand-main-900 hover:bg-brand-main-700 text-white'
												onClick={() => handleSaveNote(item.id)}>
												Save
											</Button>
											<Button
												size='sm'
												variant='ghost'
												className='h-7 px-2'
												onClick={() => setEditingNoteId(null)}>
												<X className='h-3 w-3' />
											</Button>
										</div>
									) : item.note ? (
										<button
											onClick={() => handleOpenNote(item)}
											className='text-left text-xs text-brand-main-500 italic pl-0.5 hover:text-brand-main-700 truncate'>
											📝 {item.note}
										</button>
									) : null}
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
									className='w-20 h-8 focus:border-brand-main-400'
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
								variant={"depth-soft"}
								disabled={items.length === 0 || isProcessing}
								className='w-full bg-brand-main-900 hover:bg-brand-main-700 text-white'>
								{isProcessing ? (
									<Spinner />
								) : isEditing ? (
									"Update Order"
								) : (
									"Proceed to Checkout"
								)}
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
