import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireCategoryManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updateCategorySchema } from "@/lib/validations/category.schema";
import {
	getCategoryById,
	updateCategory,
	deleteCategory,
} from "@/lib/services/category.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories/[id]
 * Get category by ID with all inventory items
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

		// Get category with items
		const category = await getCategoryById(params.id);

		if (!category) {
			return NextResponse.json(
				{
					error: {
						message: "Category not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			category,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error fetching category:", error);
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
 * PUT /api/categories/[id]
 * Update category (SUPERADMIN, MANAGER, ADMIN only)
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

		// Check category management permission
		const roleCheck = requireCategoryManager()(authResult.request);
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
		const validatedData = updateCategorySchema.parse(body);

		// Update category
		const category = await updateCategory(params.id, validatedData);

		return NextResponse.json({
			message: "Category updated successfully",
			category,
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

		// Handle uniqueness constraint errors
		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "DUPLICATE_CATEGORY",
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
						message: "Category not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error updating category:", error);
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
 * DELETE /api/categories/[id]
 * Delete category (SUPERADMIN, MANAGER, ADMIN only)
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

		// Check category management permission
		const roleCheck = requireCategoryManager()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Check if user can perform mutations
		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) {
			return statusCheck;
		}

		// Delete category
		await deleteCategory(params.id);

		return NextResponse.json({
			message: "Category deleted successfully",
		});
	} catch (error) {
		// Handle reference constraint errors
		if (
			error instanceof Error &&
			error.message.includes("Cannot delete category")
		) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "CATEGORY_IN_USE",
					},
				},
				{ status: 409 },
			);
		}

		// Handle not found errors
		if (
			error instanceof Error &&
			error.message.includes("Record to delete does not exist")
		) {
			return NextResponse.json(
				{
					error: {
						message: "Category not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error deleting category:", error);
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
