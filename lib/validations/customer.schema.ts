import { z } from "zod";

// Customer validation schemas
export const createCustomerSchema = z
	.object({
		name: z
			.string()
			.min(1, "Name is required")
			.max(200, "Name must not exceed 200 characters")
			.optional()
			.nullable(),
		phone: z
			.string()
			.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
			.max(20, "Phone number must not exceed 20 characters")
			.optional()
			.nullable(),
		email: z
			.string()
			.email("Invalid email address")
			.max(100, "Email must not exceed 100 characters")
			.optional()
			.nullable(),
	})
	.refine((data) => data.name || data.phone || data.email, {
		message: "At least one of name, phone, or email must be provided",
	});

export const updateCustomerSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(200, "Name must not exceed 200 characters")
		.optional()
		.nullable(),
	phone: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
		.max(20, "Phone number must not exceed 20 characters")
		.optional()
		.nullable(),
	email: z
		.string()
		.email("Invalid email address")
		.max(100, "Email must not exceed 100 characters")
		.optional()
		.nullable(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
