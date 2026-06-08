import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { adjustStockSchema } from "@/lib/validations/inventory.schema";
import { adjustStock } from "@/lib/services/inventory.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/inventory/[id]/adjust-stock
 * Adjust stock quantity and create stock movement record (MANAGER+ only)
 */
export async function POST(
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
		const validatedData = adjustStockSchema.parse(body);

		// Get item before adjustment to capture old stock
		const itemBefore = await adjustStock(params.id, validatedData);
		const oldStock = itemBefore.stock - validatedData.quantity;
		const newStock = itemBefore.stock;

		// Log activity
		const user = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		const adjustmentSign = validatedData.quantity > 0 ? "+" : "";
		const detailsText = `Adjusted stock for "${itemBefore.name}" (SKU: ${itemBefore.sku}): ${adjustmentSign}${validatedData.quantity} units (${oldStock} → ${newStock}). Reason: ${validatedData.reason}${validatedData.notes ? `. Notes: ${validatedData.notes}` : ""}`;

		await logActivity(user.id, "STOCK_ADJUSTED", detailsText, ipAddress, undefined, {
			entityType: "InventoryItem",
			entityId: params.id,
			changes: { stock: [oldStock, newStock] },
		});

		return NextResponse.json({
			message: "Stock adjusted successfully",
			item: itemBefore,
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

		// Handle insufficient stock errors
		if (
			error instanceof Error &&
			error.message.includes("Insufficient stock")
		) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "INSUFFICIENT_STOCK",
					},
				},
				{ status: 400 },
			);
		}

		// Handle deleted item errors
		if (
			error instanceof Error &&
			error.message.includes("Cannot adjust stock for deleted item")
		) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "ITEM_DELETED",
					},
				},
				{ status: 400 },
			);
		}

		// Handle not found errors
		if (error instanceof Error && error.message.includes("not found")) {
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
		console.error("Error adjusting stock:", error);
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
