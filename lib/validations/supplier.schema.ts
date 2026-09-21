import { z } from "zod";

export const createSupplierSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(200, "Name must not exceed 200 characters"),
	phone: z
		.string()
		.max(30, "Phone must not exceed 30 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
	email: z
		.string()
		.email("Invalid email address")
		.max(255, "Email must not exceed 255 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
	address: z
		.string()
		.max(500, "Address must not exceed 500 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
	notes: z
		.string()
		.max(1000, "Notes must not exceed 1000 characters")
		.optional()
		.nullable()
		.or(z.literal("").transform(() => null)),
	// Optional list of inventory item IDs to associate with this supplier
	inventoryItemIds: z.array(z.string().cuid()).optional().default([]),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
	inventoryItemIds: z.array(z.string().cuid()).optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
