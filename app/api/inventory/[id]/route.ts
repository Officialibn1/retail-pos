import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import {
	updateInventoryItemSchema,
	adjustStockSchema,
} from "@/lib/validations/inventory.schema";
import {
	getInventoryItemById,
	updateInventoryItem,
	softDeleteInventoryItem,
	adjustStock,
} from "@/lib/services/inventory.service";
import { ZodError } from "zod";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/[id]
 * Get inventory item by ID (excluding deleted)
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

		// Get inventory item (excluding deleted)
		const item = await getInventoryItemById(params.id);

		if (!item) {
			return NextResponse.json(
				{
					error: {
						message: "Inventory item not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			item,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error fetching inventory item:", error);
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
 * PUT /api/inventory/[id]
 * Update inventory item (MANAGER+ only)
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

		// Check MANAGER+ role
		const roleCheck = requireManager()(authResult.request);
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
		const validatedData = updateInventoryItemSchema.parse(body);

		// Update inventory item
		const item = await updateInventoryItem(params.id, validatedData);

		// Log activity
		const user = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"INVENTORY_UPDATED",
			`Updated inventory item: ${item.name} (SKU: ${item.sku})`,
			ipAddress,
		);

		return NextResponse.json({
			message: "Inventory item updated successfully",
			item,
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
						code: "DUPLICATE_SKU",
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
						message: "Inventory item not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error updating inventory item:", error);
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
 * DELETE /api/inventory/[id]
 * Soft delete inventory item (MANAGER+ only)
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

		// Check MANAGER+ role
		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Check if user can perform mutations
		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) {
			return statusCheck;
		}

		// Soft delete inventory item
		await softDeleteInventoryItem(params.id);

		return NextResponse.json({
			message: "Inventory item deleted successfully",
		});
	} catch (error) {
		// Handle not found errors
		if (
			error instanceof Error &&
			error.message.includes("Record to update not found")
		) {
			return NextResponse.json(
				{
					error: {
						message: "Inventory item not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error deleting inventory item:", error);
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
