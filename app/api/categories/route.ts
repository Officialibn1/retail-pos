import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireCategoryManager } from "@/lib/middleware/auth";
import { createCategorySchema } from "@/lib/validations/category.schema";
import {
	createCategory,
	listCategories,
} from "@/lib/services/category.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/categories
 * Create a new category (SUPERADMIN, MANAGER, ADMIN only)
 */
export async function POST(request: NextRequest) {
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

		// Parse and validate request body
		const body = await request.json();
		const validatedData = createCategorySchema.parse(body);

		// Create category
		const category = await createCategory(validatedData);

		return NextResponse.json(
			{
				message: "Category created successfully",
				category,
			},
			{ status: 201 },
		);
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

		// Handle unexpected errors
		console.error("Error creating category:", error);
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
 * GET /api/categories
 * List all categories with item counts
 */
export async function GET(request: NextRequest) {
	try {
		// Extract search params from request URL
		const params = request.nextUrl.searchParams;

		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Get all categories with item counts
		const categories = await listCategories(params);

		return NextResponse.json({
			categories,
			count: categories.length,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error listing categories:", error);
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
