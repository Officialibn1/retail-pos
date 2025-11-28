import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getInventoryAnalytics } from "@/lib/services/analytics.service";

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/inventory
 * Get inventory analytics including total value, low stock items, and category distribution
 * Requires MANAGER+ role
 */
export async function GET(request: NextRequest) {
	// Authenticate user
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;

	// Check role permissions
	const roleCheck = requireManager()(authenticatedRequest);
	if (roleCheck) {
		return roleCheck;
	}

	try {
		// Get inventory analytics
		const analytics = await getInventoryAnalytics();

		return NextResponse.json(analytics, { status: 200 });
	} catch (error: any) {
		console.error("Error getting inventory analytics:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve inventory analytics",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
