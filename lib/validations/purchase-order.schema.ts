import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
	inventoryItemId: z.string().cuid("Invalid inventory item ID"),
	quantity: z
		.number()
		.int("Quantity must be an integer")
		.positive("Quantity must be positive"),
	unitCost: z
		.number()
		.positive("Unit cost must be positive")
		.max(999999999.99, "Unit cost is too large")
		.or(
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid unit cost format")
				.transform(Number),
		),
});

export const createPurchaseOrderSchema = z.object({
	supplierId: z.string().cuid("Invalid supplier ID"),
	notes: z
		.string()
		.max(1000, "Notes must not exceed 1000 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
	items: z
		.array(purchaseOrderItemSchema)
		.min(1, "At least one item is required"),
});

export const updatePurchaseOrderSchema = z.object({
	notes: z
		.string()
		.max(1000, "Notes must not exceed 1000 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
	status: z
		.enum(["PENDING", "ORDERED", "RECEIVED", "CANCELLED"])
		.optional(),
	items: z.array(purchaseOrderItemSchema).min(1).optional(),
});

export const receivePurchaseOrderSchema = z.object({
	notes: z
		.string()
		.max(1000, "Notes must not exceed 1000 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
});

export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>;
