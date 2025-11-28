"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/sales/product-search";
import { ShoppingCart } from "@/components/sales/shopping-cart";
import { CheckoutDialog } from "@/components/sales/checkout-dialog";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import type { SaleItem } from "@/lib/types";
import type { InventoryItemWithCategory } from "@/lib/services/inventory.service";
import { RefreshCw, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface CartItem extends SaleItem {
	product: InventoryItemWithCategory;
}

export default function NewSalePage() {
	const { user } = useAuth();
	const { toast } = useToast();
	const [inventory, setInventory] = useState<InventoryItemWithCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [discount, setDiscount] = useState(0);
	const [showCheckout, setShowCheckout] = useState(false);
	const [showReceipt, setShowReceipt] = useState(false);
	const [completedSale, setCompletedSale] = useState<any>(null);
	const [processing, setProcessing] = useState(false);

	const fetchInventory = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.get<InventoryItemWithCategory[]>("/api/inventory");
			setInventory(data);
		} catch (err: any) {
			console.error("Failed to fetch inventory:", err);
			setError(err.message || "Failed to load inventory");
			toast({
				title: "Error",
				description: err.message || "Failed to load inventory",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchInventory();
		}
	}, [user]);

	const addToCart = (product: InventoryItemWithCategory, quantity: number) => {
		const existingItem = cartItems.find(
			(item) => item.inventoryItemId === product.id,
		);

		if (existingItem) {
			const newQuantity = Math.min(
				existingItem.quantity + quantity,
				product.stock,
			);
			updateQuantity(existingItem.id, newQuantity);
		} else {
			const newItem: CartItem = {
				id: `cart-${Date.now()}-${Math.random()}`,
				inventoryItemId: product.id,
				quantity: Math.min(quantity, product.stock),
				price: product.price,
				saleId: "",
				product,
			};
			setCartItems([...cartItems, newItem]);
		}
	};

	const updateQuantity = (itemId: string, quantity: number) => {
		setCartItems(
			cartItems.map((item) => {
				if (item.id === itemId) {
					const newQuantity = Math.min(quantity, item.product.stock);
					return {
						...item,
						quantity: newQuantity,
					};
				}
				return item;
			}),
		);
	};

	const removeItem = (itemId: string) => {
		setCartItems(cartItems.filter((item) => item.id !== itemId));
	};

	const clearCart = () => {
		setCartItems([]);
		setDiscount(0);
	};

	const subtotal = cartItems.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0,
	);
	const discountAmount = (subtotal * discount) / 100;
	const taxAmount = (subtotal - discountAmount) * 0.1;
	const total = subtotal - discountAmount + taxAmount;

	const completeSale = async (
		paymentMethod: "cash" | "card" | "digital",
		shouldShowReceipt = true,
	) => {
		// Convert to uppercase for API
		const apiPaymentMethod = paymentMethod.toUpperCase() as
			| "CASH"
			| "CARD"
			| "DIGITAL";
		if (!user) return;

		try {
			setProcessing(true);

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

			const createdSale = await api.post<any>("/api/sales", saleData);

			// Complete the sale
			const completedSaleData = await api.post<any>(
				`/api/sales/${createdSale.id}/complete`,
				{
					paymentMethod: apiPaymentMethod,
					amountPaid: total,
					changeGiven: 0,
				},
			);

			toast({
				title: "Success",
				description: "Sale completed successfully",
			});

			if (shouldShowReceipt) {
				const receiptSale = {
					id: completedSaleData.id,
					saleNumber: completedSaleData.saleNumber,
					items: cartItems.map((item) => ({
						id: item.id,
						inventoryItemId: item.inventoryItemId,
						name: item.product.name,
						unitPrice: Number(item.price),
						quantity: item.quantity,
						discount: 0,
						total: Number(item.price) * item.quantity,
					})),
					subtotal,
					tax: taxAmount,
					discount: discountAmount,
					total,
					paymentMethod: apiPaymentMethod,
					salesPersonId: user.id,
					salesperson: user.name,
					createdAt: new Date().toISOString(),
					customer: undefined,
				};

				setCompletedSale(receiptSale);
				setShowReceipt(true);
			}

			clearCart();

			// Refresh inventory to get updated stock levels
			await fetchInventory();
		} catch (err: any) {
			console.error("Failed to complete sale:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to complete sale",
				variant: "destructive",
			});
		} finally {
			setProcessing(false);
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

	if (error) {
		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Inventory
						</CardTitle>
						<p className='text-red-700'>{error}</p>
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
					onClick={clearCart}
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
								inventory={inventory}
								onAddToCart={addToCart}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Shopping Cart */}
				<div className='lg:col-span-1'>
					<ShoppingCart
						items={cartItems}
						onUpdateQuantity={updateQuantity}
						onRemoveItem={removeItem}
						onApplyDiscount={setDiscount}
						discount={discount}
						onCheckout={() => setShowCheckout(true)}
					/>
				</div>
			</div>

			{/* Checkout Dialog */}
			<CheckoutDialog
				open={showCheckout}
				onOpenChange={setShowCheckout}
				items={cartItems}
				subtotal={subtotal}
				discount={discountAmount}
				tax={taxAmount}
				total={total}
				onCompleteSale={completeSale}
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
