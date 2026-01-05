import { prisma } from "@/lib/prisma";
import { InventoryItemCategory } from "@/generated/prisma/client";
import {
	CreateCategoryInput,
	UpdateCategoryInput,
} from "@/lib/validations/category.schema";
import { CategoryWithCount, CategoryWithItems } from "../prisma-extended-types";

/**
 * Create a new category with uniqueness check
 * @param data - Category creation data
 * @returns Created category
 * @throws Error if category name already exists
 */
export async function createCategory(
	data: CreateCategoryInput,
): Promise<InventoryItemCategory> {
	// Check if category name already exists
	const existing = await prisma.inventoryItemCategory.findFirst({
		where: {
			name: {
				equals: data.name,
				mode: "insensitive",
			},
		},
	});

	if (existing) {
		throw new Error(`Category with name "${data.name}" already exists`);
	}

	// Create category
	const category = await prisma.inventoryItemCategory.create({
		data: {
			name: data.name,
		},
	});

	return category;
}

/**
 * Get category by ID with inventory items
 * @param id - Category ID
 * @returns Category with items or null if not found
 */
export async function getCategoryById(
	id: string,
): Promise<CategoryWithItems | null> {
	const category = await prisma.inventoryItemCategory.findUnique({
		where: { id },
		include: {
			inventoryItems: {
				where: {
					deletedAt: null, // Only include non-deleted items
				},
				orderBy: {
					name: "asc",
				},
			},
		},
	});

	return category;
}

/**
 * Update category with uniqueness check
 * @param id - Category ID
 * @param data - Category update data
 * @returns Updated category
 * @throws Error if category name already exists on another category
 */
export async function updateCategory(
	id: string,
	data: UpdateCategoryInput,
): Promise<InventoryItemCategory> {
	// Check if category name already exists on another category
	const existing = await prisma.inventoryItemCategory.findFirst({
		where: {
			name: {
				equals: data.name,
				mode: "insensitive",
			},
			id: {
				not: id,
			},
		},
	});

	if (existing) {
		throw new Error(`Category with name "${data.name}" already exists`);
	}

	// Update category
	const category = await prisma.inventoryItemCategory.update({
		where: { id },
		data: {
			name: data.name,
		},
	});

	return category;
}

/**
 * Delete category with reference check
 * @param id - Category ID
 * @throws Error if category has associated inventory items
 */
export async function deleteCategory(id: string): Promise<void> {
	// Check if category has associated inventory items
	const itemCount = await prisma.inventoryItem.count({
		where: {
			categoryId: id,
			deletedAt: null, // Only count non-deleted items
		},
	});

	if (itemCount > 0) {
		throw new Error(
			`Cannot delete category: ${itemCount} inventory item(s) are associated with this category`,
		);
	}

	// Delete category
	await prisma.inventoryItemCategory.delete({
		where: { id },
	});
}

/**
 * List all categories with item counts
 * @returns Array of categories with item counts
 */
export async function listCategories(): Promise<CategoryWithCount[]> {
	const categories = await prisma.inventoryItemCategory.findMany({
		include: {
			_count: {
				select: {
					inventoryItems: {
						where: {
							deletedAt: null, // Only count non-deleted items
						},
					},
				},
			},
		},
		orderBy: {
			name: "asc",
		},
	});

	return categories;
}
