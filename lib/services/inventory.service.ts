import { prisma } from "@/lib/prisma";
import { InventoryItem, Prisma } from "@/generated/prisma/client";
import {
	CreateInventoryItemInput,
	UpdateInventoryItemInput,
	AdjustStockInput,
} from "@/lib/validations/inventory.schema";
import { InventoryItemWithCategory } from "../prisma-extended-types";

/**
 * Create a new inventory item with SKU uniqueness check
 * @param data - Inventory item creation data
 * @returns Created inventory item
 * @throws Error if SKU already exists
 */
export async function createInventoryItem(
	data: CreateInventoryItemInput,
): Promise<InventoryItem> {
	// Check if SKU already exists
	const existing = await prisma.inventoryItem.findUnique({
		where: { sku: data.sku },
	});

	if (existing) {
		throw new Error(`Inventory item with SKU "${data.sku}" already exists`);
	}

	// Create inventory item
	const item = await prisma.inventoryItem.create({
		data: {
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock ?? 0,
			reorderLevel: data.reorderLevel ?? 10,
			sku: data.sku,
			barcode: data.barcode || null,
			categoryId: data.categoryId,
		},
	});

	return item;
}

/**
 * Get inventory item by ID (excluding deleted)
 * @param id - Inventory item ID
 * @returns Inventory item with category or null if not found or deleted
 */
export async function getInventoryItemById(
	id: string,
): Promise<InventoryItemWithCategory | null> {
	const item = await prisma.inventoryItem.findFirst({
		where: {
			id,
			deletedAt: null, // Exclude soft-deleted items
		},
		include: {
			category: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return item;
}

/**
 * Update inventory item with validation
 * @param id - Inventory item ID
 * @param data - Inventory item update data
 * @returns Updated inventory item
 * @throws Error if SKU already exists on another item or if stock is provided
 */
export async function updateInventoryItem(
	id: string,
	data: UpdateInventoryItemInput,
): Promise<InventoryItem> {
	// If SKU is being updated, check uniqueness
	if (data.sku) {
		const existing = await prisma.inventoryItem.findFirst({
			where: {
				sku: data.sku,
				id: {
					not: id,
				},
			},
		});

		if (existing) {
			throw new Error(`Inventory item with SKU "${data.sku}" already exists`);
		}
	}

	// Update inventory item (stock is excluded - use adjustStock instead)
	const item = await prisma.inventoryItem.update({
		where: { id },
		data: {
			name: data.name,
			description: data.description,
			price: data.price,
			sku: data.sku,
			barcode: data.barcode || null,
			categoryId: data.categoryId,
			reorderLevel: data.reorderLevel,
		},
	});

	return item;
}

/**
 * Soft delete inventory item by setting deletedAt timestamp
 * @param id - Inventory item ID
 */
export async function softDeleteInventoryItem(id: string): Promise<void> {
	await prisma.inventoryItem.update({
		where: { id },
		data: {
			deletedAt: new Date(),
		},
	});
}

/**
 * List all inventory items (excluding deleted)
 * @param includeDeleted - Whether to include soft-deleted items (default: false)
 * @returns Array of inventory items with categories
 */
export async function listInventoryItems(
	includeDeleted: boolean = false,
	params: URLSearchParams,
): Promise<InventoryItemWithCategory[]> {
	const searchTerm = params.get("searchTerm");
	const category = params.get("category");

	const searchConditions: Prisma.InventoryItemWhereInput[] = [];

	if (searchTerm) {
		searchConditions.push({
			name: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});

		searchConditions.push({
			sku: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});

		searchConditions.push({
			category: {
				name: {
					contains: searchTerm,
					mode: "insensitive" as const,
				},
			},
		});
	}

	if (category) {
		searchConditions.push({
			category: {
				name: {
					contains: category,
					mode: "insensitive" as const,
				},
			},
		});
	}

	const whereCondition =
		searchConditions.length > 0 ? { OR: searchConditions } : {};

	const items = await prisma.inventoryItem.findMany({
		where: {
			deletedAt: null,
			...whereCondition,
		},
		include: {
			category: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: {
			name: "asc",
		},
	});

	return items;
}

/**
 * Adjust stock quantity and create stock movement record
 * @param id - Inventory item ID
 * @param data - Stock adjustment data (quantity, reason, notes)
 * @returns Updated inventory item
 */
export async function adjustStock(
	id: string,
	data: AdjustStockInput,
): Promise<InventoryItem> {
	// Use transaction to ensure atomicity
	const result = await prisma.$transaction(async (tx) => {
		// Get current item
		const item = await tx.inventoryItem.findUnique({
			where: { id },
		});

		if (!item) {
			throw new Error("Inventory item not found");
		}

		if (item.deletedAt) {
			throw new Error("Cannot adjust stock for deleted item");
		}

		// Calculate new stock
		const newStock = item.stock + data.quantity;

		if (newStock < 0) {
			throw new Error(
				`Insufficient stock. Current: ${item.stock}, Adjustment: ${data.quantity}`,
			);
		}

		// Update inventory stock
		const updatedItem = await tx.inventoryItem.update({
			where: { id },
			data: {
				stock: newStock,
			},
		});

		// Create stock movement record
		await tx.stockMovement.create({
			data: {
				inventoryItemId: id,
				quantity: data.quantity,
				reason: data.reason,
				notes: data.notes,
			},
		});

		return updatedItem;
	});

	return result;
}
