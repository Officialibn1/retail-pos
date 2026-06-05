import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/low-stock
 * Returns inventory items whose stock is at or below their individual reorder level.
 * Requires MANAGER+ role.
 */
export async function GET(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;

	const roleCheck = requireManager()(authenticatedRequest);
	if (roleCheck) return roleCheck;

	try {
		// Use raw query to compare stock <= reorderLevel column-to-column
		const items = await prisma.$queryRaw<
			Array<{
				id: string;
				name: string;
				sku: string;
				stock: number;
				reorder_level: number;
				category_name: string | null;
			}>
		>(
			Prisma.sql`
				SELECT
					i.id,
					i.name,
					i.sku,
					i.stock,
					i.reorder_level,
					c.name AS category_name
				FROM inventory_items i
				LEFT JOIN inventory_item_categories c ON c.id = i.category_id
				WHERE i.deleted_at IS NULL
					AND i.stock <= i.reorder_level
				ORDER BY i.stock ASC
			`,
		);

		const formatted = items.map((item) => ({
			id: item.id,
			name: item.name,
			sku: item.sku,
			stock: item.stock,
			reorderLevel: item.reorder_level,
			category: item.category_name ?? "Uncategorised",
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
