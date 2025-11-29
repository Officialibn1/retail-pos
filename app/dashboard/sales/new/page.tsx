"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/sales/product-search";
import { ShoppingCart } from "@/components/sales/shopping-cart";
import { CheckoutDialog } from "@/components/sales/checkout-dialog";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import { PendingOrdersList } from "@/components/sales/pending-orders-list";
import { useAuth } from "@/components/auth/auth-provider";
import type { InventoryItemWithCategory } from "@/lib/services/inventory.service";
import { RefreshCw, Loader2 } from "lucide-react";
import {
	useGetInventoryQuery,
	useCreateSaleMutation,
	useCompleteSaleMutation,
	useGetSalesQuery,
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
import { toast } from "sonner";

export default function NewSalePage() {
	const { user } = useAuth();
	const dispatch = useAppDispatch();

	// RTK Query hooks for data fetching
	const {
		data: inventory = [],
		isLoading: loading,
		isError,
		error: inventoryError,
	} = useGetInventoryQuery();
	const { data: pendingSales = [] } = useGetSalesQuery({ status: "PENDING" });
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
	const [pendingSaleId, setPendingSaleId] = useState<string | null>(null);

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

	const handleCompletePendingOrder = (saleId: string) => {
		setPendingSaleId(saleId);
		setShowCheckout(true);
	};

	// Get selected pending sale for checkout
	const selectedPendingSale = pendingSaleId
		? pendingSales.find((s) => s.id === pendingSaleId)
		: null;

	const handleCompleteSale = async (
		paymentMethod: PaymentMethod,
		shouldShowReceipt = true,
	) => {
		if (!user) return;

		try {
			let saleIdToComplete: string;

			// If completing a pending order, use that ID
			if (pendingSaleId) {
				saleIdToComplete = pendingSaleId;
			} else {
				// Create new sale with PENDING status
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
				saleIdToComplete = createdSale.id;
			}

			// Complete the sale
			const amountToPay = pendingSaleId
				? Number(
						pendingSales.find((s) => s.id === pendingSaleId)?.total || total,
				  )
				: total;

			const completedSaleData = await completeSale({
				id: saleIdToComplete,
				data: {
					paymentMethod,
					amountPaid: amountToPay,
				},
			}).unwrap();

			toast.success("Sale completed successfully");

			setCompletedSale(completedSaleData);
			if (shouldShowReceipt) {
				setShowReceipt(true);
			}

			// Clear cart from Redux if it was a new sale
			if (!pendingSaleId) {
				dispatch(clearCart());
			}

			// Reset pending sale ID
			setPendingSaleId(null);
			setShowCheckout((prev) => !prev);

			// Inventory will automatically refetch due to cache invalidation
		} catch (err: any) {
			console.error("Failed to complete sale:", err);
			toast.error(err?.data?.error?.message || "Failed to complete sale");
		}
	};

	if (!user) return null;

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
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
					<h1 className='text-3xl font-bold text-brand-main-800'>New Sale</h1>
					<p className='text-brand-main-600 mt-1'>
						Create a new sales transaction
					</p>
				</div>
				<Button
					onClick={handleClearCart}
					variant='outline'
					className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 bg-transparent'
					disabled={cartItems.length === 0 || completingSale || creatingSale}>
					<RefreshCw className='h-4 w-4 mr-2' />
					Clear Cart
				</Button>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Product Search */}
				<div className='lg:col-span-2'>
					<Card className='border-brand-main-200 h-full'>
						<CardHeader>
							<CardTitle className='text-brand-main-800'>
								Select Products
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ProductSearch
								creatingSale={creatingSale}
								completingSale={completingSale}
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

			{/* Pending Orders List */}
			<PendingOrdersList
				userId={user.id}
				userRoles={user.roles}
				onComplete={handleCompletePendingOrder}
			/>

			{/* Checkout Dialog */}
			<CheckoutDialog
				open={showCheckout}
				onOpenChange={(open) => {
					setShowCheckout(open);
					if (!open) {
						setPendingSaleId(null);
					}
				}}
				items={
					selectedPendingSale
						? selectedPendingSale.items.map((item) => ({
								id: item.id,
								saleId: selectedPendingSale.id,
								inventoryItemId: item.inventoryItem.id,
								quantity: item.quantity,
								price: Number(item.price),
								name: item.inventoryItem.name,
								sku: item.inventoryItem.sku,
						  }))
						: cartItems.map((item) => ({
								...item,
								saleId: "", // Temporary saleId for checkout dialog
						  }))
				}
				subtotal={
					selectedPendingSale ? Number(selectedPendingSale.total) : subtotal
				}
				discount={selectedPendingSale ? 0 : discountAmount}
				tax={selectedPendingSale ? 0 : taxAmount}
				total={selectedPendingSale ? Number(selectedPendingSale.total) : total}
				onCompleteSale={handleCompleteSale}
				isProcessing={creatingSale || completingSale}
				saleId={pendingSaleId}
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
