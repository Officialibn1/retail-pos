import { z } from "zod";
import { UserRole, Shift } from "@/generated/prisma/client";

// User validation schemas
export const createUserSchema = z.object({
	email: z.string().email("Invalid email address"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must not exceed 50 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores, and hyphens",
		),
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must not exceed 100 characters"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must not exceed 100 characters"),
	roles: z.array(z.nativeEnum(UserRole)).optional().default([UserRole.CASHIER]),
	shift: z.nativeEnum(Shift).optional().default(Shift.MORNING),
});

export const updateUserSchema = z.object({
	email: z.string().email("Invalid email address").optional(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must not exceed 50 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores, and hyphens",
		)
		.optional(),
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must not exceed 100 characters")
		.optional(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must not exceed 100 characters")
		.optional(),
	roles: z.array(z.nativeEnum(UserRole)).optional(),
	shift: z.nativeEnum(Shift).optional(),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
