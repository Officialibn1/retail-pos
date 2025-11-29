/**
 * Example usage of cart slice in React components
 *
 * This file demonstrates how to use the cart slice actions and selectors
 * in React components.
 */

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
	selectCartTotal,
	selectCartItemCount,
} from "../cartSlice";
import type { InventoryItemWithCategory } from "@/lib/services/inventory.service";
import React from "react";

/**
 * Example component showing cart operations
 */
export function CartExample() {
	const dispatch = useAppDispatch();

	// Select cart state
	const cartItems = useAppSelector(selectCartItems);
	const discount = useAppSelector(selectCartDiscount);
	const subtotal = useAppSelector(selectCartSubtotal);
	const total = useAppSelector(selectCartTotal);
	const itemCount = useAppSelector(selectCartItemCount);

	// Add item to cart
	const handleAddToCart = (
		product: InventoryItemWithCategory,
		quantity: number,
	) => {
		dispatch(addItem({ product, quantity }));
	};

	// Update item quantity
	const handleUpdateQuantity = (itemId: string, quantity: number) => {
		dispatch(updateQuantity({ itemId, quantity }));
	};

	// Remove item from cart
	const handleRemoveItem = (itemId: string) => {
		dispatch(removeItem(itemId));
	};

	// Apply discount
	const handleApplyDiscount = (discountPercent: number) => {
		dispatch(setDiscount(discountPercent));
	};

	// Clear cart
	const handleClearCart = () => {
		dispatch(clearCart());
	};

	// Validate cart against current inventory
	const handleValidateCart = (inventory: InventoryItemWithCategory[]) => {
		dispatch(validateCart(inventory));
	};

	return (
		<div>
			<h2>Cart ({itemCount} items)</h2>
			<p>Subtotal: ₦{subtotal}</p>
			<p>Discount: {discount}%</p>
			<p>Total: ₦{total}</p>

			{cartItems.map((item) => (
				<div key={item.id}>
					<span>{item.product.name}</span>
					<span>Qty: {item.quantity}</span>
					<button
						onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
						+
					</button>
					<button
						onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
						-
					</button>
					<button onClick={() => handleRemoveItem(item.id)}>Remove</button>
				</div>
			))}

			<button onClick={handleClearCart}>Clear Cart</button>
		</div>
	);
}

/**
 * Example: Validate cart on page load
 */
export function useCartValidation(inventory: InventoryItemWithCategory[]) {
	const dispatch = useAppDispatch();

	// Validate cart when inventory changes
	React.useEffect(() => {
		if (inventory.length > 0) {
			dispatch(validateCart(inventory));
		}
	}, [inventory, dispatch]);
}

/**
 * Example: Clear cart after successful sale
 */
export function useClearCartOnSale() {
	const dispatch = useAppDispatch();

	const handleSaleComplete = async () => {
		// ... complete sale logic ...

		// Clear cart after successful sale
		// Requirement 3.3: Clear cart state from both Redux and localStorage
		// Requirement 8.5, 8.6: Clear persisted cart state
		dispatch(clearCart());
	};

	return { handleSaleComplete };
}
