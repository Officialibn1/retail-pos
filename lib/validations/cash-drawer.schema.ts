import { z } from "zod";

export const openShiftSchema = z.object({
	openingFloat: z
		.number({ required_error: "Opening float is required" })
		.min(0, "Opening float cannot be negative")
		.max(10000000, "Opening float value is too large"),
	notes: z
		.string()
		.max(500, "Notes must not exceed 500 characters")
		.optional(),
});

export const closeShiftSchema = z.object({
	declaredClose: z
		.number({ required_error: "Declared closing amount is required" })
		.min(0, "Declared closing amount cannot be negative")
		.max(10000000, "Declared closing amount is too large"),
	notes: z
		.string()
		.max(500, "Notes must not exceed 500 characters")
		.optional(),
});

export type OpenShiftInput = z.infer<typeof openShiftSchema>;
export type CloseShiftInput = z.infer<typeof closeShiftSchema>;
