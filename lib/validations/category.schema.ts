import { z } from "zod";

// Category validation schemas
export const createCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(100, "Category name must not exceed 100 characters")
		.regex(
			/^[a-zA-Z0-9\s-_&]+$/,
			"Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands",
		),
});

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(100, "Category name must not exceed 100 characters")
		.regex(
			/^[a-zA-Z0-9\s-_&]+$/,
			"Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands",
		),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
