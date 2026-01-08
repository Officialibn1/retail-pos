import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Prisma, Customer } from "@/generated/prisma/client";
import { RootState } from "../index";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";
const taxRate = process.env.NEXT_PUBLIC_TAX_AMOUNT as string;

/**
 * Cart Item Interface
 *
 * Represents an item in the shopping cart with product details
 */
export interface CartItem {
	id: string;
	inventoryItemId: string;
	quantity: number;
	price: Prisma.Decimal;
	product: InventoryItemWithCategory;
}

/**
 * Cart Slice State Interface
 *
 * Manages shopping cart state with persistence
 */
export interface CartState {
	items: CartItem[];
	discount: number;
	customer: Customer | null;
}

/**
 * Initial state for the cart slice
 */
const initialState: CartState = {
	items: [],
	discount: 0,
	customer: null,
};

/**
 * Cart Slice
 *
 * Manages shopping cart state including items, quantities, and discount.
 * Provides actions for cart operations and persistence.
 *
 * Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 8.1, 8.2, 8.3, 8.4
 */
export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		/**
		 * Add item to cart or update quantity if already exists
		 *
		 * @param state - Current cart state
		 * @param action - Action containing product and quantity
		 *
		 * Requirement 3.1: Store cart state in Redux and persist to localStorage
		 */
		addItem: (
			state,
			action: PayloadAction<{
				product: InventoryItemWithCategory;
				quantity: number;
			}>,
		) => {
			const { product, quantity } = action.payload;
			const existingItem = state.items.find(
				(item) => item.inventoryItemId === product.id,
			);

			if (existingItem) {
				// Update quantity, respecting stock limits
				const newQuantity = Math.min(
					existingItem.quantity + quantity,
					product.stock,
				);
				existingItem.quantity = newQuantity;
			} else {
				// Add new item to cart
				const newItem: CartItem = {
					id: `cart-${Date.now()}-${Math.random()}`,
					inventoryItemId: product.id,
					quantity: Math.min(quantity, product.stock),
					price: product.price,
					product,
				};
				state.items.push(newItem);
			}
		},

		/**
		 * Update quantity of an item in the cart
		 *
		 * @param state - Current cart state
		 * @param action - Action containing item ID and new quantity
		 *
		 * Requirement 3.4: Validate against available stock and persist changes
		 * Requirement 3.5: Update Redux state and persist changes to localStorage
		 */
		updateQuantity: (
			state,
			action: PayloadAction<{ itemId: string; quantity: number }>,
		) => {
			const { itemId, quantity } = action.payload;
			const item = state.items.find((item) => item.id === itemId);

			if (item) {
				// Validate quantity against stock
				const newQuantity = Math.min(Math.max(1, quantity), item.product.stock);
				item.quantity = newQuantity;
			}
		},

		/**
		 * Remove item from cart
		 *
		 * @param state - Current cart state
		 * @param action - Action containing item ID to remove
		 *
		 * Requirement 3.5: Update Redux state and persist changes to localStorage
		 */
		removeItem: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((item) => item.id !== action.payload);
		},

		/**
		 * Set discount percentage
		 *
		 * @param state - Current cart state
		 * @param action - Action containing discount percentage (0-100)
		 *
		 * Requirement 3.6: Store discount value in cart slice and persist it
		 */
		setDiscount: (state, action: PayloadAction<number>) => {
			// Clamp discount between 0 and 100
			state.discount = Math.min(Math.max(0, action.payload), 100);
		},

		/**
		 * Set selected customer for the sale
		 *
		 * @param state - Current cart state
		 * @param action - Action containing customer data or null
		 */
		setCustomer: (state, action: PayloadAction<Customer | null>) => {
			state.customer = action.payload;
		},

		/**
		 * Clear selected customer
		 *
		 * @param state - Current cart state
		 */
		clearCustomer: (state) => {
			state.customer = null;
		},

		/**
		 * Clear all items, discount, and customer from cart
		 *
		 * @param state - Current cart state
		 *
		 * Requirement 3.3: Clear cart state from both Redux and localStorage
		 */
		clearCart: (state) => {
			state.items = [];
			state.discount = 0;
			state.customer = null;
		},

		/**
		 * Validate cart items against current inventory
		 * Removes items that no longer exist or have insufficient stock
		 *
		 * @param state - Current cart state
		 * @param action - Action containing current inventory
		 *
		 * Requirement 3.7: Validate that inventory items still exist and have sufficient stock
		 */
		validateCart: (
			state,
			action: PayloadAction<InventoryItemWithCategory[]>,
		) => {
			const inventory = action.payload;
			const inventoryMap = new Map(inventory.map((item) => [item.id, item]));

			// Filter out items that no longer exist or adjust quantities
			state.items = state.items
				.map((cartItem) => {
					const inventoryItem = inventoryMap.get(cartItem.inventoryItemId);

					// Remove item if it no longer exists or is deleted
					if (!inventoryItem || inventoryItem.deletedAt) {
						return null;
					}

					// Adjust quantity if stock is insufficient
					if (cartItem.quantity > inventoryItem.stock) {
						if (inventoryItem.stock === 0) {
							// Remove item if out of stock
							return null;
						}
						// Reduce quantity to available stock
						return {
							...cartItem,
							quantity: inventoryItem.stock,
							product: inventoryItem,
						};
					}

					// Update product data to reflect current inventory
					return {
						...cartItem,
						product: inventoryItem,
					};
				})
				.filter((item): item is CartItem => item !== null);
		},
	},
});

// Export actions
export const {
	addItem,
	updateQuantity,
	removeItem,
	setDiscount,
	setCustomer,
	clearCustomer,
	clearCart,
	validateCart,
} = cartSlice.actions;

// Selectors

/**
 * Select all cart items
 *
 * @param state - Root Redux state
 * @returns Array of cart items
 */
export const selectCartItems = (state: RootState): CartItem[] =>
	state.cart.items;

/**
 * Select discount percentage
 *
 * @param state - Root Redux state
 * @returns Discount percentage (0-100)
 */
export const selectCartDiscount = (state: RootState): number =>
	state.cart.discount;

/**
 * Calculate cart subtotal (before discount and tax)
 *
 * @param state - Root Redux state
 * @returns Subtotal amount
 */
export const selectCartSubtotal = (state: RootState): number => {
	return state.cart.items.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0,
	);
};

/**
 * Calculate discount amount
 *
 * @param state - Root Redux state
 * @returns Discount amount
 */
export const selectCartDiscountAmount = (state: RootState): number => {
	const subtotal = selectCartSubtotal(state);
	return (subtotal * state.cart.discount) / 100;
};

/**
 * Calculate tax amount (10% of subtotal after discount)
 *
 * @param state - Root Redux state
 * @returns Tax amount
 */
export const selectCartTaxAmount = (state: RootState): number => {
	const subtotal = selectCartSubtotal(state);
	const discountAmount = selectCartDiscountAmount(state);
	return (subtotal - discountAmount) * Number(taxRate ? taxRate : 0);
};

/**
 * Calculate cart total (subtotal - discount + tax)
 *
 * @param state - Root Redux state
 * @returns Total amount
 */
export const selectCartTotal = (state: RootState): number => {
	const subtotal = selectCartSubtotal(state);
	const discountAmount = selectCartDiscountAmount(state);
	const taxAmount = selectCartTaxAmount(state);
	return subtotal - discountAmount + taxAmount;
};

/**
 * Get total number of items in cart
 *
 * @param state - Root Redux state
 * @returns Total item count
 */
export const selectCartItemCount = (state: RootState): number => {
	return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Select current customer
 *
 * @param state - Root Redux state
 * @returns Selected customer or null
 */
export const selectCartCustomer = (state: RootState): Customer | null =>
	state.cart.customer;

// Export reducer
export default cartSlice.reducer;
