import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updateUserSchema } from "@/lib/validations/user.schema";
import {
	getUserById,
	updateUser,
	deleteUser,
} from "@/lib/services/user.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/[id]
 * Get user by ID (SUPERADMIN only)
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check SUPERADMIN role
		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Get user by ID
		const user = await getUserById(params.id);

		if (!user) {
			return NextResponse.json(
				{
					error: {
						message: "User not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({ user });
	} catch (error) {
		// Handle unexpected errors
		console.error("Error getting user:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/users/[id]
 * Update user by ID (SUPERADMIN only)
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check SUPERADMIN role
		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Check if user can perform mutations
		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) {
			return statusCheck;
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = updateUserSchema.parse(body);

		// Update user
		const user = await updateUser(params.id, validatedData);

		return NextResponse.json({
			message: "User updated successfully",
			user,
		});
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: {
						message: "Validation failed",
						code: "VALIDATION_ERROR",
						details: error.errors,
					},
				},
				{ status: 400 },
			);
		}

		// Handle Prisma unique constraint violations
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return NextResponse.json(
				{
					error: {
						message: "User with this email or username already exists",
						code: "DUPLICATE_USER",
					},
				},
				{ status: 409 },
			);
		}

		// Handle not found errors
		if (
			error instanceof Error &&
			error.message.includes("Record to update not found")
		) {
			return NextResponse.json(
				{
					error: {
						message: "User not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error updating user:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/users/[id]
 * Delete user by ID (SUPERADMIN only)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check SUPERADMIN role
		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Check if user can perform mutations
		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) {
			return statusCheck;
		}

		// Delete user (cascade deletes sessions)
		await deleteUser(params.id);

		return NextResponse.json({
			message: "User deleted successfully",
		});
	} catch (error) {
		// Handle not found errors
		if (
			error instanceof Error &&
			error.message.includes("Record to delete does not exist")
		) {
			return NextResponse.json(
				{
					error: {
						message: "User not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
