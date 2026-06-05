import { z } from "zod";

// Inventory Item validation schemas
export const createInventoryItemSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(200, "Name must not exceed 200 characters"),
	description: z
		.string()
		.max(1000, "Description must not exceed 1000 characters")
		.optional()
		.nullable(),
	price: z
		.number()
		.positive("Price must be positive")
		.max(999999999.99, "Price is too large")
		.or(
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
				.transform(Number),
		),
	stock: z
		.number()
		.int("Stock must be an integer")
		.min(0, "Stock cannot be negative")
		.optional()
		.default(0),
	reorderLevel: z
		.number()
		.int("Reorder level must be an integer")
		.min(0, "Reorder level cannot be negative")
		.optional()
		.default(10),
	sku: z
		.string()
		.min(1, "SKU is required")
		.max(100, "SKU must not exceed 100 characters")
		.regex(
			/^[a-zA-Z0-9-_]+$/,
			"SKU can only contain letters, numbers, hyphens, and underscores",
		),
	barcode: z
		.string()
		.max(100, "Barcode must not exceed 100 characters")
		.regex(
			/^[a-zA-Z0-9-]+$/,
			"Barcode can only contain letters, numbers, and hyphens",
		)
		.or(z.literal(""))
		.optional()
		.nullable(),
	categoryId: z.string().cuid("Invalid category ID"),
});

export const updateInventoryItemSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(200, "Name must not exceed 200 characters")
		.optional(),
	description: z
		.string()
		.max(1000, "Description must not exceed 1000 characters")
		.optional()
		.nullable(),
	price: z
		.number()
		.positive("Price must be positive")
		.max(999999999.99, "Price is too large")
		.or(
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
				.transform(Number),
		)
		.optional(),
	sku: z
		.string()
		.min(1, "SKU is required")
		.max(100, "SKU must not exceed 100 characters")
		.regex(
			/^[a-zA-Z0-9-_]+$/,
			"SKU can only contain letters, numbers, hyphens, and underscores",
		)
		.optional(),
	barcode: z
		.string()
		.max(100, "Barcode must not exceed 100 characters")
		.regex(
			/^[a-zA-Z0-9-]+$/,
			"Barcode can only contain letters, numbers, and hyphens",
		)
		.or(z.literal(""))
		.optional()
		.nullable(),
	reorderLevel: z
		.number()
		.int("Reorder level must be an integer")
		.min(0, "Reorder level cannot be negative")
		.optional(),
	categoryId: z.string().cuid("Invalid category ID").optional(),
});

export const adjustStockSchema = z.object({
	quantity: z
		.number()
		.int("Quantity must be an integer")
		.refine((val) => val !== 0, {
			message: "Quantity adjustment cannot be zero",
		}),
	reason: z
		.string()
		.min(5, "Reason is required")
		.max(200, "Reason must not exceed 200 characters")
		.refine(
			(val) =>
				["RESTOCK", "DAMAGE", "THEFT", "ADJUSTMENT", "RETURN"].includes(val),
			{
				message: "Invalid reason",
			},
		),
	notes: z.string().max(500, "Notes must not exceed 500 characters"),
});

export type CreateInventoryItemInput = z.infer<
	typeof createInventoryItemSchema
>;
export type UpdateInventoryItemInput = z.infer<
	typeof updateInventoryItemSchema
>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
