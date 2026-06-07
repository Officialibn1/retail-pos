"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/sales/product-search";
import { ShoppingCart } from "@/components/sales/shopping-cart";
import { CustomerSelector } from "@/components/sales/customer-selector";
import { CheckoutDialogV2 } from "@/components/sales/checkout-dialog-v2";
import { PaymentDialog } from "@/components/sales/payment-dialog";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import { PendingOrdersList } from "@/components/sales/pending-orders-list";
import { useAuth } from "@/components/auth/auth-provider";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	useGetInventoryQuery,
	useCreateSaleMutation,
	useCompleteSaleMutation,
	useGetSalesQuery,
	useUpdateSaleItemsMutation,
} from "@/lib/store/api";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
	addItem,
	updateQuantity,
	removeItem,
	setDiscount,
	setItemNote,
	clearCart,
	validateCart,
	selectCartItems,
	selectCartDiscount,
	selectCartSubtotal,
	selectCartDiscountAmount,
	selectCartTaxAmount,
	selectCartTotal,
	selectCartCustomer,
} from "@/lib/store/slices/cartSlice";
import { PaymentMethod, SaleItem } from "@/generated/prisma";
import { toast } from "sonner";
import {
	InventoryItemWithCategory,
	SaleItemWithInventoryItem,
} from "@/lib/prisma-extended-types";
import type { SaleWithDetails } from "@/lib/services/sale.service";

export default function NewSalePage() {
	const { user } = useAuth();
	const dispatch = useAppDispatch();

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
	const [updateSaleItems, { isLoading: updatingSale }] =
		useUpdateSaleItemsMutation();

	// Redux cart state
	const cartItems = useAppSelector(selectCartItems);
	const discount = useAppSelector(selectCartDiscount);
	const subtotal = useAppSelector(selectCartSubtotal);
	const discountAmount = useAppSelector(selectCartDiscountAmount);
	const taxAmount = useAppSelector(selectCartTaxAmount);
	const total = useAppSelector(selectCartTotal);
	const selectedCustomer = useAppSelector(selectCartCustomer);

	// Local UI state
	const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [showReceipt, setShowReceipt] = useState(false);
	const [completedSale, setCompletedSale] = useState<any>(null);
	const [pendingSaleId, setPendingSaleId] = useState<string | null>(null);
	const [pendingSaleData, setPendingSaleData] = useState<{
		items: Omit<SaleItemWithInventoryItem, "inventoryItemId" | "saleId">[];
		total: number;
	} | null>(null);
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [paymentError, setPaymentError] = useState<string | null>(null);
	/** ID of the pending order currently being edited, null when not in edit mode */
	const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

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

	const handleAddToCart = (
		product: InventoryItemWithCategory,
		quantity: number,
	) => {
		const convertedProduct = {
			...product,
			price: product.price as any,
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
		setEditingOrderId(null);
	};

	const handleApplyDiscount = (discountValue: number) => {
		dispatch(setDiscount(discountValue));
	};

	/** Load a pending order's items into the cart and enter edit mode */
	const handleEditOrder = (sale: SaleWithDetails) => {
		// Clear any current cart first
		dispatch(clearCart());

		// Restore each item from the sale back into the cart using existing inventory data
		for (const saleItem of sale.items) {
			const inventoryItem = inventory.find(
				(i) => i.id === saleItem.inventoryItem.id,
			);
			if (!inventoryItem) continue;

			const converted = {
				...inventoryItem,
				price: inventoryItem.price as any,
				deletedAt: inventoryItem.deletedAt ? new Date(inventoryItem.deletedAt) : null,
				createdAt: new Date(inventoryItem.createdAt),
				updatedAt: new Date(inventoryItem.updatedAt),
			} as InventoryItemWithCategory;

			dispatch(addItem({ product: converted, quantity: saleItem.quantity, note: saleItem.note ?? undefined }));
		}

		// Restore discount if any
		if (sale.discountAmount && Number(sale.subTotal) > 0) {
			const pct = (Number(sale.discountAmount) / Number(sale.subTotal)) * 100;
			dispatch(setDiscount(Math.round(pct)));
		}

		setEditingOrderId(sale.id);
		// Scroll up so the cashier can see the cart
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	/** Submit the edited item list to the PATCH endpoint */
	const handleUpdateOrder = async () => {
		if (!editingOrderId || !user) return;
		setCheckoutError(null);

		try {
			await updateSaleItems({
				id: editingOrderId,
				data: {
					items: cartItems.map((item) => ({
						inventoryItemId: item.inventoryItemId,
						quantity: item.quantity,
						price: Number(item.price),
						note: item.note ?? null,
					})),
					discountRate: discount,
				},
			}).unwrap();

			toast.success("Order updated successfully");
			dispatch(clearCart());
			setEditingOrderId(null);
		} catch (err: any) {
			const message =
				err?.data?.error?.message || "Failed to update order. Please try again.";
			setCheckoutError(message);
			toast.error(message);
		}
	};

	// Handler to create pending order when checkout is initiated
	const handleCreatePendingOrder = async () => {
		if (!user) return;

		// Clear previous errors
		setCheckoutError(null);

		try {
			// Create new sale with PENDING status
			const saleData = {
				userId: user.id,
				items: cartItems.map((item) => ({
					inventoryItemId: item.inventoryItemId,
					quantity: item.quantity,
					price: Number(item.price),
					note: item.note ?? null,
				})),
				customerId: selectedCustomer?.id || null,
				discountRate: discount,
			};

			const createdSale = await createSale(saleData).unwrap();

			// Store pending sale data
			setPendingSaleId(createdSale.id);
			setPendingSaleData({
				items: cartItems.map((item) => ({
					id: item.id,
					quantity: item.quantity,
					price: Number(item.price),
					note: item.note ?? null,
					inventoryItem: {
						id: item.inventoryItemId,
						name: item.product.name,
						sku: item.product.sku,
					},
				})),
				total,
			});

			// Open checkout dialog
			setShowCheckoutDialog(true);
			// Don't clear cart yet - wait until checkout is closed or payment is completed

			toast.success("Order created successfully");
		} catch (err: any) {
			console.error("Failed to create pending order:", err);

			// Extract error message from API response
			const errorMessage =
				err?.data?.error?.message ||
				"Failed to create order. Please try again.";

			// Set error state for display
			setCheckoutError(errorMessage);

			toast.error(errorMessage);

			// Cart remains intact on error
		}
	};

	// Handler to open payment dialog
	const handleCompletePayment = () => {
		// Close checkout dialog when opening payment dialog
		setShowCheckoutDialog(false);
		// Clear cart now that checkout dialog is closing
		dispatch(clearCart());
		setShowPaymentDialog(true);
	};

	// Handler to complete sale with payment details
	const handleCompleteSale = async (
		saleId: string,
		paymentMethod: PaymentMethod,
		amountPaid: number,
		shouldShowReceipt = true,
	) => {
		if (!user) return;

		// Clear previous errors
		setPaymentError(null);

		try {
			// Complete the sale
			const completedSaleData = await completeSale({
				id: saleId,
				data: {
					paymentMethod,
					amountPaid: amountPaid ?? total,
					total,
				},
			}).unwrap();

			toast.success("Sale completed successfully");

			setCompletedSale(completedSaleData);
			if (shouldShowReceipt) {
				setShowReceipt(true);
			}

			// Close dialogs
			setShowPaymentDialog(false);
			setShowCheckoutDialog(false);

			// Reset pending sale state (cart already cleared when checkout dialog closed)
			setPendingSaleId(null);
			setPendingSaleData(null);

			// Inventory will automatically refetch due to cache invalidation
		} catch (err: any) {
			console.error("Failed to complete sale:", err);
			const errorMessage =
				err?.data?.error?.message ||
				"Failed to complete sale. Please try again.";

			// Set error state for display
			setPaymentError(errorMessage);

			toast.error(errorMessage);
			// Keep dialog open on error so user can retry
		}
	};

	// Handler to close checkout dialog
	const handleCloseCheckout = () => {
		setShowCheckoutDialog(false);
		// Clear cart when closing checkout (user chose not to complete payment now)
		dispatch(clearCart());
		// Reset pending sale state
		setPendingSaleId(null);
		setPendingSaleData(null);
		// Clear errors
		setCheckoutError(null);
	};

	// Handler for completing pending orders from the list
	const handleCompletePendingOrder = (saleId: string, saleTotal: number) => {
		const sale = pendingSales.find((s) => s.id === saleId);
		if (sale) {
			setPendingSaleId(saleId);
			setPendingSaleData({
				items: sale.items,
				total: saleTotal,
			});
			setShowPaymentDialog(true);
		}
	};

	// Handler to close payment dialog
	const handleClosePayment = () => {
		setShowPaymentDialog(false);
		// Reset pending sale state only if not from checkout flow
		// (if checkout dialog is not open, we're completing from pending list)
		if (!showCheckoutDialog) {
			setPendingSaleId(null);
			setPendingSaleData(null);
		}
		// Clear errors
		setPaymentError(null);
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
		const errorMessage =
			(inventoryError as any)?.data?.error?.message ||
			"Failed to load inventory. Please check your connection and try again.";
		const isNetworkError =
			(inventoryError as any)?.status === "FETCH_ERROR" ||
			errorMessage.toLowerCase().includes("network");

		return (
			<div className='space-y-6 p-6'>
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertTitle>Error Loading Inventory</AlertTitle>
					<AlertDescription className='space-y-3'>
						<p>{errorMessage}</p>
						{isNetworkError && (
							<Button
								onClick={() => window.location.reload()}
								variant='outline'
								size='sm'
								className='mt-2'>
								<RefreshCw className='h-4 w-4 mr-2' />
								Retry
							</Button>
						)}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-brand-main-950'>New Sale</h1>
					<p className='text-brand-main-800 mt-1'>
						Create a new sales transaction
					</p>
				</div>
				<Button
					onClick={handleClearCart}
					variant='outline'
					className='  text-brand-main-700 hover:bg-brand-main-50 bg-transparent'
					disabled={cartItems.length === 0 || completingSale || creatingSale || updatingSale}>
					<RefreshCw className='h-4 w-4 mr-2' />
					{editingOrderId ? "Cancel Edit" : "Clear Cart"}
				</Button>
			</div>

			{/* Checkout Error Display */}
			{checkoutError && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertTitle>Checkout Error</AlertTitle>
					<AlertDescription className='space-y-3'>
						<p>{checkoutError}</p>
						<Button
							onClick={handleCreatePendingOrder}
							variant='outline'
							size='sm'
							disabled={creatingSale}
							className='mt-2'>
							<RefreshCw className='h-4 w-4 mr-2' />
							Retry Checkout
						</Button>
					</AlertDescription>
				</Alert>
			)}

			<div className='grid gap-6 xl:grid-cols-3 '>
				<div className='xl:col-span-2 space-y-6'>
					{/* Product Search */}
					<Card className='  h-fit'>
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

				<div className='xl:col-span-1 grid lg:grid-cols-2 gap-6 xl:block xl:space-y-6'>
					<ShoppingCart
						items={cartItems.map((item) => ({
							...item,
							saleId: "", // Temporary saleId for shopping cart
						}))}
						onUpdateQuantity={handleUpdateQuantity}
						onRemoveItem={handleRemoveItem}
						onApplyDiscount={handleApplyDiscount}
						discount={discount}
						onCheckout={editingOrderId ? handleUpdateOrder : handleCreatePendingOrder}
						isProcessing={creatingSale || completingSale || updatingSale}
						editingOrderId={editingOrderId}
					/>

					<CustomerSelector disabled={creatingSale || completingSale} />
				</div>
			</div>

			<PendingOrdersList
				userId={user.id}
				userRoles={user.roles}
				onComplete={handleCompletePendingOrder}
				onEdit={handleEditOrder}
			/>

			{pendingSaleId && pendingSaleData && (
				<CheckoutDialogV2
					open={showCheckoutDialog}
					onOpenChange={setShowCheckoutDialog}
					saleId={pendingSaleId}
					items={pendingSaleData.items.map((item) => ({
						id: item.id,
						saleId: pendingSaleId,
						inventoryItemId: item.inventoryItem.id,
						quantity: item.quantity,
						price: item.price,
						note: item.note ?? null,
					}))}
					subtotal={subtotal}
					discount={discountAmount}
					tax={taxAmount}
					total={pendingSaleData.total}
					onCompletePayment={handleCompletePayment}
					onClose={handleCloseCheckout}
					isProcessing={completingSale}
				/>
			)}

			{/* Payment Dialog */}
			{pendingSaleId && pendingSaleData && (
				<PaymentDialog
					open={showPaymentDialog}
					onOpenChange={handleClosePayment}
					saleId={pendingSaleId}
					total={pendingSaleData.total}
					onCompleteSale={handleCompleteSale}
					isProcessing={completingSale}
					error={paymentError}
				/>
			)}

			{/* Receipt Print Dialog */}
			<ReceiptPrintDialog
				sale={completedSale}
				open={showReceipt}
				onOpenChange={setShowReceipt}
			/>
		</div>
	);
}
