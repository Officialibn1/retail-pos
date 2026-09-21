import { z } from "zod";
import { ExpenseCategory } from "@/generated/prisma/client";

export const EXPENSE_CATEGORIES = [
	"RENT",
	"SALARIES",
	"UTILITIES",
	"RESTOCKING",
	"MAINTENANCE",
	"MARKETING",
	"OTHER",
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
	RENT: "Rent",
	SALARIES: "Salaries",
	UTILITIES: "Utilities",
	RESTOCKING: "Restocking",
	MAINTENANCE: "Maintenance",
	MARKETING: "Marketing",
	OTHER: "Other",
};

export const createExpenseSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title must not exceed 200 characters"),
	amount: z
		.number()
		.positive("Amount must be positive")
		.max(999999999.99, "Amount is too large")
		.or(
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
				.transform(Number),
		),
	category: z.nativeEnum(ExpenseCategory, {
		errorMap: () => ({ message: "Invalid expense category" }),
	}),
	description: z
		.string()
		.max(1000, "Description must not exceed 1000 characters")
		.optional()
		.nullable(),
	date: z
		.string()
		.datetime({ message: "Invalid date format" })
		.or(z.date().transform((d) => d.toISOString()))
		.optional(),
});

export const updateExpenseSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title must not exceed 200 characters")
		.optional(),
	amount: z
		.number()
		.positive("Amount must be positive")
		.max(999999999.99, "Amount is too large")
		.or(
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
				.transform(Number),
		)
		.optional(),
	category: z
		.nativeEnum(ExpenseCategory, {
			errorMap: () => ({ message: "Invalid expense category" }),
		})
		.optional(),
	description: z
		.string()
		.max(1000, "Description must not exceed 1000 characters")
		.optional()
		.nullable(),
	date: z
		.string()
		.datetime({ message: "Invalid date format" })
		.or(z.date().transform((d) => d.toISOString()))
		.optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
