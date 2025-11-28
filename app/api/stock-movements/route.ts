import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/stock-movements
 * Get stock movements ordered by date (newest first) with inventory item details (MANAGER+ only)
 * Supports optional filtering by item ID via query parameter
 */
export async function GET(request: NextRequest) {
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

		// Get optional itemId filter from query params
		const { searchParams } = new URL(request.url);
		const itemId = searchParams.get("itemId");

		// Build where clause
		const where = itemId ? { inventoryItemId: itemId } : undefined;

		// Fetch stock movements with inventory item details
		const stockMovements = await prisma.stockMovement.findMany({
			where,
			include: {
				inventoryItem: {
					select: {
						id: true,
						name: true,
						sku: true,
						barcode: true,
						price: true,
						stock: true,
						category: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc", // Newest first
			},
		});

		return NextResponse.json({
			stockMovements,
			count: stockMovements.length,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error fetching stock movements:", error);
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
