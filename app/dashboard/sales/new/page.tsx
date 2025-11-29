"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/sales/product-search";
import { ShoppingCart } from "@/components/sales/shopping-cart";
import { CheckoutDialog } from "@/components/sales/checkout-dialog";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import type { InventoryItemWithCategory } from "@/lib/services/inventory.service";
import { RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	useGetInventoryQuery,
	useCreateSaleMutation,
	useCompleteSaleMutation,
	type InventoryItemWithCategory as ApiInventoryItem,
} from "@/lib/store/api";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
	addItem,
	updateQuantity,
	removeItem,
	setDiscount,
	clearCart,
	validateCart,
	selectCartItems,
	selectCartDiscount,
	selectCartSubtotal,
	selectCartDiscountAmount,
	selectCartTaxAmount,
	selectCartTotal,
} from "@/lib/store/slices/cartSlice";
import { PaymentMethod } from "@/generated/prisma";

export default function NewSalePage() {
	const { user } = useAuth();
	const { toast } = useToast();
	const dispatch = useAppDispatch();

	// RTK Query hooks for data fetching
	const {
		data: inventory = [],
		isLoading: loading,
		isError,
		error: inventoryError,
	} = useGetInventoryQuery();
	const [createSale, { isLoading: creatingSale }] = useCreateSaleMutation();
	const [completeSale, { isLoading: completingSale }] =
		useCompleteSaleMutation();

	// Redux cart state
	const cartItems = useAppSelector(selectCartItems);
	const discount = useAppSelector(selectCartDiscount);
	const subtotal = useAppSelector(selectCartSubtotal);
	const discountAmount = useAppSelector(selectCartDiscountAmount);
	const taxAmount = useAppSelector(selectCartTaxAmount);
	const total = useAppSelector(selectCartTotal);

	// Local UI state
	const [showCheckout, setShowCheckout] = useState(false);
	const [showReceipt, setShowReceipt] = useState(false);
	const [completedSale, setCompletedSale] = useState<any>(null);

	// Validate cart when inventory changes
	useEffect(() => {
		if (inventory.length > 0) {
			// Convert API inventory to the format expected by cart slice
			const convertedInventory = inventory.map((item) => ({
				...item,
				price: item.price as any, // Prisma.Decimal compatibility
				deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
				createdAt: new Date(item.createdAt),
				updatedAt: new Date(item.updatedAt),
			})) as InventoryItemWithCategory[];
			dispatch(validateCart(convertedInventory));
		}
	}, [inventory, dispatch]);

	const handleAddToCart = (product: ApiInventoryItem, quantity: number) => {
		// Convert API inventory item to the format expected by cart slice
		const convertedProduct = {
			...product,
			price: product.price as any, // Prisma.Decimal compatibility
			deletedAt: product.deletedAt ? new Date(product.deletedAt) : null,
			createdAt: new Date(product.createdAt),
			updatedAt: new Date(product.updatedAt),
		} as InventoryItemWithCategory;
		dispatch(addItem({ product: convertedProduct, quantity }));
	};

	const handleUpdateQuantity = (itemId: string, quantity: number) => {
		dispatch(updateQuantity({ itemId, quantity }));
	};

	const handleRemoveItem = (itemId: string) => {
		dispatch(removeItem(itemId));
	};

	const handleClearCart = () => {
		dispatch(clearCart());
	};

	const handleApplyDiscount = (discountValue: number) => {
		dispatch(setDiscount(discountValue));
	};

	const handleCompleteSale = async (
		paymentMethod: PaymentMethod,
		shouldShowReceipt = true,
	) => {
		// Convert to uppercase for API
		if (!user) return;

		try {
			// Create sale with PENDING status
			const saleData = {
				userId: user.id,
				items: cartItems.map((item) => ({
					inventoryItemId: item.inventoryItemId,
					quantity: item.quantity,
					price: Number(item.price),
				})),
				customerId: null,
			};

			const createdSale = await createSale(saleData).unwrap();

			// Complete the sale
			const completedSaleData = await completeSale({
				id: createdSale.id,
				data: {
					paymentMethod,
					amountPaid: total,
				},
			}).unwrap();

			toast({
				title: "Success",
				description: "Sale completed successfully",
			});

			setCompletedSale(completedSaleData);
			setShowReceipt(true);

			// Clear cart from Redux
			dispatch(clearCart());

			// Inventory will automatically refetch due to cache invalidation
		} catch (err: any) {
			console.error("Failed to complete sale:", err);
			toast({
				title: "Error",
				description: err?.data?.error?.message || "Failed to complete sale",
				variant: "destructive",
			});
		}
	};

	if (!user) return null;

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-lunar-green-600' />
			</div>
		);
	}

	if (isError) {
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Inventory
						</CardTitle>
						<p className='text-red-700'>
							{(inventoryError as any)?.data?.error?.message ||
								"Failed to load inventory"}
						</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-lunar-green-800'>New Sale</h1>
					<p className='text-lunar-green-600 mt-1'>
						Create a new sales transaction
					</p>
				</div>
				<Button
					onClick={handleClearCart}
					variant='outline'
					className='border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50 bg-transparent'
					disabled={cartItems.length === 0}>
					<RefreshCw className='h-4 w-4 mr-2' />
					Clear Cart
				</Button>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Product Search */}
				<div className='lg:col-span-2'>
					<Card className='border-lunar-green-200'>
						<CardHeader>
							<CardTitle className='text-lunar-green-800'>
								Select Products
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ProductSearch
								inventory={
									inventory.map((item) => ({
										...item,
										price: item.price as any,
										deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
										createdAt: new Date(item.createdAt),
										updatedAt: new Date(item.updatedAt),
									})) as InventoryItemWithCategory[]
								}
								onAddToCart={handleAddToCart as any}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Shopping Cart */}
				<div className='lg:col-span-1'>
					<ShoppingCart
						items={cartItems.map((item) => ({
							...item,
							saleId: "", // Temporary saleId for shopping cart
						}))}
						onUpdateQuantity={handleUpdateQuantity}
						onRemoveItem={handleRemoveItem}
						onApplyDiscount={handleApplyDiscount}
						discount={discount}
						onCheckout={() => setShowCheckout(true)}
						isProcessing={creatingSale || completingSale}
					/>
				</div>
			</div>

			{/* Checkout Dialog */}
			<CheckoutDialog
				open={showCheckout}
				onOpenChange={setShowCheckout}
				items={cartItems.map((item) => ({
					...item,
					saleId: "", // Temporary saleId for checkout dialog
				}))}
				subtotal={subtotal}
				discount={discountAmount}
				tax={taxAmount}
				total={total}
				onCompleteSale={handleCompleteSale}
				isProcessing={creatingSale}
			/>

			{/* Receipt Print Dialog */}
			<ReceiptPrintDialog
				sale={completedSale}
				open={showReceipt}
				onOpenChange={setShowReceipt}
			/>
		</div>
	);
}
