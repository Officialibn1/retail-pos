import { z } from "zod";
import { PaymentMethod } from "@/generated/prisma/client";

// Sale Item schema for nested validation
const saleItemSchema = z.object({
	inventoryItemId: z.string().cuid("Invalid inventory item ID"),
	quantity: z
		.number()
		.int("Quantity must be an integer")
		.positive("Quantity must be positive"),
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
});

// Sale validation schemas
export const createSaleSchema = z.object({
	items: z
		.array(saleItemSchema)
		.min(1, "At least one item is required")
		.max(100, "Cannot have more than 100 items in a sale"),
	customerId: z.string().cuid("Invalid customer ID").optional().nullable(),
	userId: z.string().cuid("Invalid user ID"),
	discountRate: z.number().max(100, "Discount must not be more than 100%"),
});

export const completeSaleSchema = z
	.object({
		paymentMethod: z.nativeEnum(PaymentMethod, {
			errorMap: () => ({ message: "Invalid payment method" }),
		}),
		amountPaid: z.union([
			z
				.number()
				.nonnegative("Amount paid cannot be negative")
				.max(999999999.99, "Amount is too large"),
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
				.transform(Number),
		]),
		total: z.union([
			z
				.number()
				.nonnegative("Amount paid cannot be negative")
				.max(999999999.99, "Amount is too large"),
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
				.transform(Number),
		]),
	})
	.superRefine((data, ctx) => {
		if (Number(data.amountPaid) < Number(data.total)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Amount paid must be equal to or greater than the total amount to be paid",
				path: ["amountPaid"],
			});
		}
	});

export const cancelSaleSchema = z.object({
	reason: z
		.string()
		.min(1, "Cancellation reason is required")
		.max(500, "Reason must not exceed 500 characters")
		.optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CompleteSaleInput = z.infer<typeof completeSaleSchema>;
export type CancelSaleInput = z.infer<typeof cancelSaleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
