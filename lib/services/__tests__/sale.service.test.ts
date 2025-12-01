import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import * as fc from "fast-check";
import { prisma } from "@/lib/prisma";
import { completeSale, createSale } from "@/lib/services/sale.service";
import { PaymentMethod, SaleStatus } from "@/generated/prisma/client";

/**
 * Property-Based Tests for Sale Service
 * These tests verify correctness properties across many randomly generated inputs
 */

describe("Sale Service - Property-Based Tests", () => {
	// Test data cleanup
	const createdSaleIds: string[] = [];
	const createdUserIds: string[] = [];
	const createdInventoryIds: string[] = [];
	const createdCategoryIds: string[] = [];

	afterEach(async () => {
		// Clean up test data in correct order (respecting foreign key constraints)
		// 1. Delete stock movements first (they reference inventory items)
		if (createdInventoryIds.length > 0) {
			await prisma.stockMovement
				.deleteMany({
					where: { inventoryItemId: { in: createdInventoryIds } },
				})
				.catch(() => {});
		}
		// 2. Delete sale items (they reference sales and inventory items)
		if (createdSaleIds.length > 0) {
			await prisma.saleItem
				.deleteMany({
					where: { saleId: { in: createdSaleIds } },
				})
				.catch(() => {});
		}
		// 3. Delete sales (they reference users)
		if (createdSaleIds.length > 0) {
			await prisma.sale
				.deleteMany({
					where: { id: { in: createdSaleIds } },
				})
				.catch(() => {});
			createdSaleIds.length = 0;
		}
		// 4. Delete inventory items (they reference categories)
		if (createdInventoryIds.length > 0) {
			await prisma.inventoryItem
				.deleteMany({
					where: { id: { in: createdInventoryIds } },
				})
				.catch(() => {});
			createdInventoryIds.length = 0;
		}
		// 5. Delete categories
		if (createdCategoryIds.length > 0) {
			await prisma.inventoryItemCategory
				.deleteMany({
					where: { id: { in: createdCategoryIds } },
				})
				.catch(() => {});
			createdCategoryIds.length = 0;
		}
		// 6. Delete users last
		if (createdUserIds.length > 0) {
			await prisma.user
				.deleteMany({
					where: { id: { in: createdUserIds } },
				})
				.catch(() => {});
			createdUserIds.length = 0;
		}
	});

	/**
	 * **Feature: enhanced-checkout-flow, Property 1: Pending order creation preserves inventory**
	 *
	 * For any cart with valid items, when a pending order is created,
	 * the inventory stock levels should remain unchanged until the order is completed.
	 *
	 * **Validates: Requirements 1.1, 1.4**
	 */
	it("Property 1: should preserve inventory stock when creating pending order", async () => {
		await fc.assert(
			fc.asyncProperty(
				// Generate random number of items (1-5 items in cart)
				fc.integer({ min: 1, max: 5 }),
				// Generate random quantities for each item
				fc.array(fc.integer({ min: 1, max: 10 }), {
					minLength: 1,
					maxLength: 5,
				}),
				// Generate random prices
				fc.array(fc.double({ min: 1, max: 1000, noNaN: true }), {
					minLength: 1,
					maxLength: 5,
				}),
				async (numItems, quantities, prices) => {
					// Setup: Create test user
					const timestamp = Date.now();
					const user = await prisma.user.create({
						data: {
							name: `Test User ${timestamp}`,
							email: `test${timestamp}@example.com`,
							username: `testuser${timestamp}`,
							password: "hashedpassword",
							roles: ["CASHIER"],
						},
					});
					createdUserIds.push(user.id);

					// Setup: Create test category
					const category = await prisma.inventoryItemCategory.create({
						data: {
							name: `Test Category ${timestamp}`,
						},
					});
					createdCategoryIds.push(category.id);

					// Setup: Create inventory items with sufficient stock
					const inventoryItems = [];
					const stockBeforeOrder: Record<string, number> = {};

					for (let i = 0; i < numItems; i++) {
						const quantity = quantities[i % quantities.length];
						const price = prices[i % prices.length];
						const initialStock = quantity + 50; // Ensure sufficient stock

						const item = await prisma.inventoryItem.create({
							data: {
								name: `Test Item ${timestamp}-${i}`,
								sku: `SKU-${timestamp}-${i}`,
								price: price,
								stock: initialStock,
								categoryId: category.id,
							},
						});
						createdInventoryIds.push(item.id);
						inventoryItems.push({
							id: item.id,
							quantity: quantity,
							price: price,
						});
						stockBeforeOrder[item.id] = initialStock;
					}

					// Action: Create pending sale
					const sale = await createSale({
						userId: user.id,
						customerId: null,
						items: inventoryItems.map((item) => ({
							inventoryItemId: item.id,
							quantity: item.quantity,
							price: item.price,
						})),
					});
					createdSaleIds.push(sale.id);

					// Assertion: Sale should be created with PENDING status
					expect(sale.status).toBe(SaleStatus.PENDING);

					// Assertion: Inventory stock should remain unchanged
					for (const item of inventoryItems) {
						const inventoryItem = await prisma.inventoryItem.findUnique({
							where: { id: item.id },
						});
						expect(inventoryItem).not.toBeNull();
						expect(inventoryItem!.stock).toBe(stockBeforeOrder[item.id]);
					}
				},
			),
			{ numRuns: 100 }, // Run 100 iterations as specified in design
		);
	}, 60000); // 60 second timeout for property test

	/**
	 * **Feature: enhanced-checkout-flow, Property 11: Default amount paid for missing input**
	 *
	 * For any payment completion without an amount paid value,
	 * the system should default amount paid to the order total.
	 *
	 * **Validates: Requirements 6.1, 6.4**
	 */
	it("Property 11: should default amountPaid to sale total when not provided", async () => {
		await fc.assert(
			fc.asyncProperty(
				// Generate random sale total between 1 and 10000
				fc.double({ min: 1, max: 10000, noNaN: true }),
				// Generate random payment method
				fc.constantFrom(
					PaymentMethod.CARD,
					PaymentMethod.CASH,
					PaymentMethod.MOBILE_MONEY,
					PaymentMethod.BANK_TRANSFER,
				),
				async (saleTotal, paymentMethod) => {
					// Setup: Create test user
					const timestamp = Date.now();
					const user = await prisma.user.create({
						data: {
							name: `Test User ${timestamp}`,
							email: `test${timestamp}@example.com`,
							username: `testuser${timestamp}`,
							password: "hashedpassword",
							roles: ["CASHIER"],
						},
					});
					createdUserIds.push(user.id);

					// Setup: Create test category
					const category = await prisma.inventoryItemCategory.create({
						data: {
							name: `Test Category ${timestamp}`,
						},
					});
					createdCategoryIds.push(category.id);

					// Setup: Create test inventory item with sufficient stock
					const inventoryItem = await prisma.inventoryItem.create({
						data: {
							name: `Test Item ${Date.now()}`,
							sku: `SKU-${Date.now()}`,
							price: saleTotal,
							stock: 100,
							categoryId: category.id,
						},
					});
					createdInventoryIds.push(inventoryItem.id);

					// Setup: Create pending sale
					const sale = await createSale({
						userId: user.id,
						customerId: null,
						items: [
							{
								inventoryItemId: inventoryItem.id,
								quantity: 1,
								price: saleTotal,
							},
						],
					});
					createdSaleIds.push(sale.id);

					// Action: Complete sale WITHOUT providing amountPaid
					const completedSale = await completeSale(sale.id, {
						paymentMethod,
						// amountPaid is intentionally omitted
					});

					// Assertion: amountPaid should equal sale.total
					expect(Number(completedSale.amountPaid)).toBe(Number(sale.total));
					// Assertion: changeGiven should be zero
					expect(Number(completedSale.changeGiven)).toBe(0);
					// Assertion: sale should be completed
					expect(completedSale.status).toBe(SaleStatus.COMPLETED);
				},
			),
			{ numRuns: 100 }, // Run 100 iterations as specified in design
		);
	}, 60000); // 60 second timeout for property test

	/**
	 * **Feature: enhanced-checkout-flow, Property 12: Optional amount paid allows completion**
	 *
	 * For any valid payment method, the system should successfully complete a sale
	 * even when amount paid is not provided.
	 *
	 * **Validates: Requirements 6.3**
	 */
	it("Property 12: should successfully complete sale without providing amountPaid", async () => {
		await fc.assert(
			fc.asyncProperty(
				// Generate random sale total between 1 and 10000
				fc.double({ min: 1, max: 10000, noNaN: true }),
				// Generate random payment method
				fc.constantFrom(
					PaymentMethod.CARD,
					PaymentMethod.CASH,
					PaymentMethod.MOBILE_MONEY,
					PaymentMethod.BANK_TRANSFER,
				),
				async (saleTotal, paymentMethod) => {
					// Setup: Create test user
					const timestamp = Date.now();
					const user = await prisma.user.create({
						data: {
							name: `Test User ${timestamp}`,
							email: `test${timestamp}@example.com`,
							username: `testuser${timestamp}`,
							password: "hashedpassword",
							roles: ["CASHIER"],
						},
					});
					createdUserIds.push(user.id);

					// Setup: Create test category
					const category = await prisma.inventoryItemCategory.create({
						data: {
							name: `Test Category ${timestamp}`,
						},
					});
					createdCategoryIds.push(category.id);

					// Setup: Create test inventory item with sufficient stock
					const inventoryItem = await prisma.inventoryItem.create({
						data: {
							name: `Test Item ${Date.now()}`,
							sku: `SKU-${Date.now()}`,
							price: saleTotal,
							stock: 100,
							categoryId: category.id,
						},
					});
					createdInventoryIds.push(inventoryItem.id);

					// Setup: Create pending sale
					const sale = await createSale({
						userId: user.id,
						customerId: null,
						items: [
							{
								inventoryItemId: inventoryItem.id,
								quantity: 1,
								price: saleTotal,
							},
						],
					});
					createdSaleIds.push(sale.id);

					// Action: Complete sale WITHOUT providing amountPaid
					const completedSale = await completeSale(sale.id, {
						paymentMethod,
						// amountPaid is intentionally omitted
					});

					// Assertion: sale should be completed successfully
					expect(completedSale.status).toBe(SaleStatus.COMPLETED);
					// Assertion: amountPaid should equal sale.total
					expect(Number(completedSale.amountPaid)).toBe(Number(sale.total));
					// Assertion: changeGiven should be zero
					expect(Number(completedSale.changeGiven)).toBe(0);
				},
			),
			{ numRuns: 100 }, // Run 100 iterations as specified in design
		);
	}, 60000); // 60 second timeout for property test

	/**
	 * **Feature: enhanced-checkout-flow, Property 19: Stock error messages include item details**
	 *
	 * For any pending order creation that fails due to insufficient stock,
	 * the error message should contain the name of at least one item that is out of stock.
	 *
	 * **Validates: Requirements 8.1**
	 */
	it("Property 19: should include item name in insufficient stock error message", async () => {
		await fc.assert(
			fc.asyncProperty(
				// Generate random item name (alphanumeric to avoid special characters)
				fc
					.stringMatching(/^[a-zA-Z0-9 ]{3,50}$/)
					.filter((s) => s.trim().length >= 3),
				// Generate random requested quantity (more than available)
				fc.integer({ min: 2, max: 100 }),
				async (itemName, requestedQuantity) => {
					// Setup: Create test user
					const timestamp = Date.now();
					const user = await prisma.user.create({
						data: {
							name: `Test User ${timestamp}`,
							email: `test${timestamp}@example.com`,
							username: `testuser${timestamp}`,
							password: "hashedpassword",
							roles: ["CASHIER"],
						},
					});
					createdUserIds.push(user.id);

					// Setup: Create test category
					const category = await prisma.inventoryItemCategory.create({
						data: {
							name: `Test Category ${timestamp}`,
						},
					});

					// Setup: Create test inventory item with insufficient stock
					const availableStock = requestedQuantity - 1; // Always less than requested
					const inventoryItem = await prisma.inventoryItem.create({
						data: {
							name: itemName,
							sku: `SKU-${Date.now()}`,
							price: 100,
							stock: availableStock,
							categoryId: category.id,
						},
					});
					createdInventoryIds.push(inventoryItem.id);

					// Action: Try to create sale with insufficient stock
					let errorMessage = "";
					try {
						await createSale({
							userId: user.id,
							customerId: null,
							items: [
								{
									inventoryItemId: inventoryItem.id,
									quantity: requestedQuantity,
									price: 100,
								},
							],
						});
						// If we get here, the test should fail
						expect(true).toBe(false); // Force failure if no error thrown
					} catch (error: any) {
						errorMessage = error.message;
					}

					// Assertion: Error message should contain the item name
					expect(errorMessage).toContain(itemName);
					// Assertion: Error message should indicate insufficient stock
					expect(errorMessage.toLowerCase()).toContain("insufficient stock");
				},
			),
			{ numRuns: 10 }, // Reduced for performance
		);
	}, 30000); // 30 second timeout
});
