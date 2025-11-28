import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getSalesAnalytics } from "@/lib/services/analytics.service";

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/sales
 * Get sales analytics with role-based filtering
 * Requires MANAGER+ role
 */
export async function GET(request: NextRequest) {
	// Authenticate user
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	// Check role permissions
	const roleCheck = requireManager()(authenticatedRequest);
	if (roleCheck) {
		return roleCheck;
	}

	try {
		// Get sales analytics with role-based filtering
		const analytics = await getSalesAnalytics(user.id, user.roles);

		return NextResponse.json(analytics, { status: 200 });
	} catch (error: any) {
		console.error("Error getting sales analytics:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve sales analytics",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
