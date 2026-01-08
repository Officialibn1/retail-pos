import { z } from "zod";

// Customer validation schema (used for both create and update operations)
export const customerSchema = z.object({
	name: z
		.union([
			z.string().max(200, "Name must not exceed 200 characters").min(1),
			z.literal(""),
		])
		.transform((val) => val.trim()),
	phone: z
		.string()
		.min(1, "Phone number is required")
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
		.max(20, "Phone number must not exceed 20 characters")
		.transform((val) => val.trim()),
	email: z
		.union([
			z
				.string()
				.email("Invalid email address")
				.max(100, "Email must not exceed 100 characters"),
			z.literal(""),
		])
		.transform((val) => val.trim()),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// Legacy type aliases for backward compatibility
export type CreateCustomerInput = CustomerInput;
export type UpdateCustomerInput = CustomerInput;
