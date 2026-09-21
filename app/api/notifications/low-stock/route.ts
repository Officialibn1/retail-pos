import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/low-stock
 * Returns inventory items whose stock is at or below their individual reorder level.
 * Fetches all non-deleted items then filters in JS to avoid a column-to-column
 * comparison that Prisma ORM does not support natively.
 * Requires MANAGER+ role.
 */
export async function GET(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;

	const roleCheck = requireManager()(authenticatedRequest);
	if (roleCheck) return roleCheck;

	try {
		// Fetch only items that are candidates: stock is reasonably low.
		// We use stock <= 100 as a broad pre-filter to avoid a full table scan
		// returning thousands of rows; the precise per-item threshold is then
		// applied in JS below.
		const candidates = await prisma.inventoryItem.findMany({
			where: {
				deletedAt: null,
				stock: { lte: 100 },
			},
			select: {
				id: true,
				name: true,
				sku: true,
				stock: true,
				reorderLevel: true,
				category: { select: { name: true } },
			},
			orderBy: { stock: "asc" },
		});

		// Keep only items whose stock is at or below their own reorder level
		const alertItems = candidates.filter(
			(item) => item.stock <= item.reorderLevel,
		);

		const formatted = alertItems.map((item) => ({
			id: item.id,
			name: item.name,
			sku: item.sku,
			stock: item.stock,
			reorderLevel: item.reorderLevel,
			category: item.category.name,
		}));

		return NextResponse.json(
			{ items: formatted, count: formatted.length },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching low-stock notifications:", error);
		return NextResponse.json(
			{
				error: {
					message: "Failed to fetch low-stock items",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
