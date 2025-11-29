import cartReducer, {
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
	CartState,
} from "../cartSlice";
import { Prisma } from "@/generated/prisma/client";
import type { InventoryItemWithCategory } from "@/lib/services/inventory.service";

// Helper to create mock inventory item
const createMockInventoryItem = (
	overrides: Partial<InventoryItemWithCategory> = {},
): InventoryItemWithCategory => ({
	id: "item-1",
	name: "Test Product",
	description: "Test description",
	price: new Prisma.Decimal(100),
	stock: 10,
	sku: "TEST-001",
	barcode: null,
	categoryId: "cat-1",
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	category: {
		id: "cat-1",
		name: "Test Category",
	},
	...overrides,
});

describe("cartSlice", () => {
	const initialState: CartState = {
		items: [],
		discount: 0,
	};

	describe("reducers", () => {
		it("should handle addItem for new item", () => {
			const product = createMockInventoryItem();
			const action = addItem({ product, quantity: 2 });
			const state = cartReducer(initialState, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0].inventoryItemId).toBe(product.id);
			expect(state.items[0].quantity).toBe(2);
			expect(state.items[0].product).toBe(product);
		});

		it("should handle addItem for existing item", () => {
			const product = createMockInventoryItem();
			const stateWithItem: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 2,
						price: product.price,
						product,
					},
				],
				discount: 0,
			};

			const action = addItem({ product, quantity: 3 });
			const state = cartReducer(stateWithItem, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0].quantity).toBe(5);
		});

		it("should respect stock limits when adding items", () => {
			const product = createMockInventoryItem({ stock: 5 });
			const action = addItem({ product, quantity: 10 });
			const state = cartReducer(initialState, action);

			expect(state.items[0].quantity).toBe(5); // Limited to stock
		});

		it("should handle updateQuantity", () => {
			const product = createMockInventoryItem();
			const stateWithItem: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 2,
						price: product.price,
						product,
					},
				],
				discount: 0,
			};

			const action = updateQuantity({ itemId: "cart-1", quantity: 5 });
			const state = cartReducer(stateWithItem, action);

			expect(state.items[0].quantity).toBe(5);
		});

		it("should respect stock limits when updating quantity", () => {
			const product = createMockInventoryItem({ stock: 5 });
			const stateWithItem: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 2,
						price: product.price,
						product,
					},
				],
				discount: 0,
			};

			const action = updateQuantity({ itemId: "cart-1", quantity: 10 });
			const state = cartReducer(stateWithItem, action);

			expect(state.items[0].quantity).toBe(5); // Limited to stock
		});

		it("should handle removeItem", () => {
			const product = createMockInventoryItem();
			const stateWithItem: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 2,
						price: product.price,
						product,
					},
				],
				discount: 0,
			};

			const action = removeItem("cart-1");
			const state = cartReducer(stateWithItem, action);

			expect(state.items).toHaveLength(0);
		});

		it("should handle setDiscount", () => {
			const action = setDiscount(15);
			const state = cartReducer(initialState, action);

			expect(state.discount).toBe(15);
		});

		it("should clamp discount between 0 and 100", () => {
			let state = cartReducer(initialState, setDiscount(-10));
			expect(state.discount).toBe(0);

			state = cartReducer(initialState, setDiscount(150));
			expect(state.discount).toBe(100);
		});

		it("should handle clearCart", () => {
			const product = createMockInventoryItem();
			const stateWithData: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 2,
						price: product.price,
						product,
					},
				],
				discount: 15,
			};

			const action = clearCart();
			const state = cartReducer(stateWithData, action);

			expect(state.items).toHaveLength(0);
			expect(state.discount).toBe(0);
		});

		it("should handle validateCart - remove deleted items", () => {
			const product1 = createMockInventoryItem({ id: "item-1" });
			const product2 = createMockInventoryItem({
				id: "item-2",
				deletedAt: new Date(),
			});

			const stateWithItems: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product1.id,
						quantity: 2,
						price: product1.price,
						product: product1,
					},
					{
						id: "cart-2",
						inventoryItemId: product2.id,
						quantity: 1,
						price: product2.price,
						product: product2,
					},
				],
				discount: 0,
			};

			const action = validateCart([product1, product2]);
			const state = cartReducer(stateWithItems, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0].inventoryItemId).toBe(product1.id);
		});

		it("should handle validateCart - adjust quantity for insufficient stock", () => {
			const product = createMockInventoryItem({ id: "item-1", stock: 3 });

			const stateWithItems: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 5,
						price: product.price,
						product: { ...product, stock: 10 },
					},
				],
				discount: 0,
			};

			const action = validateCart([product]);
			const state = cartReducer(stateWithItems, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0].quantity).toBe(3); // Adjusted to available stock
		});

		it("should handle validateCart - remove out of stock items", () => {
			const product = createMockInventoryItem({ id: "item-1", stock: 0 });

			const stateWithItems: CartState = {
				items: [
					{
						id: "cart-1",
						inventoryItemId: product.id,
						quantity: 5,
						price: product.price,
						product: { ...product, stock: 10 },
					},
				],
				discount: 0,
			};

			const action = validateCart([product]);
			const state = cartReducer(stateWithItems, action);

			expect(state.items).toHaveLength(0); // Removed due to no stock
		});
	});

	describe("selectors", () => {
		it("should select cart items", () => {
			const product = createMockInventoryItem();
			const state = {
				cart: {
					items: [
						{
							id: "cart-1",
							inventoryItemId: product.id,
							quantity: 2,
							price: product.price,
							product,
						},
					],
					discount: 0,
				},
			} as any;

			const items = selectCartItems(state);
			expect(items).toHaveLength(1);
		});

		it("should select cart discount", () => {
			const state = {
				cart: {
					items: [],
					discount: 15,
				},
			} as any;

			const discount = selectCartDiscount(state);
			expect(discount).toBe(15);
		});

		it("should calculate cart subtotal", () => {
			const product1 = createMockInventoryItem({
				id: "item-1",
				price: new Prisma.Decimal(100),
			});
			const product2 = createMockInventoryItem({
				id: "item-2",
				price: new Prisma.Decimal(50),
			});

			const state = {
				cart: {
					items: [
						{
							id: "cart-1",
							inventoryItemId: product1.id,
							quantity: 2,
							price: product1.price,
							product: product1,
						},
						{
							id: "cart-2",
							inventoryItemId: product2.id,
							quantity: 3,
							price: product2.price,
							product: product2,
						},
					],
					discount: 0,
				},
			} as any;

			const subtotal = selectCartSubtotal(state);
			expect(subtotal).toBe(350); // (100 * 2) + (50 * 3)
		});

		it("should calculate cart total with discount and tax", () => {
			const product = createMockInventoryItem({
				price: new Prisma.Decimal(100),
			});

			const state = {
				cart: {
					items: [
						{
							id: "cart-1",
							inventoryItemId: product.id,
							quantity: 2,
							price: product.price,
							product,
						},
					],
					discount: 10, // 10% discount
				},
			} as any;

			const total = selectCartTotal(state);
			// Subtotal: 200
			// Discount: 20 (10%)
			// After discount: 180
			// Tax: 18 (10% of 180)
			// Total: 198
			expect(total).toBe(198);
		});

		it("should calculate cart item count", () => {
			const product1 = createMockInventoryItem({ id: "item-1" });
			const product2 = createMockInventoryItem({ id: "item-2" });

			const state = {
				cart: {
					items: [
						{
							id: "cart-1",
							inventoryItemId: product1.id,
							quantity: 2,
							price: product1.price,
							product: product1,
						},
						{
							id: "cart-2",
							inventoryItemId: product2.id,
							quantity: 3,
							price: product2.price,
							product: product2,
						},
					],
					discount: 0,
				},
			} as any;

			const count = selectCartItemCount(state);
			expect(count).toBe(5); // 2 + 3
		});
	});
});
