import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getDashboardStats } from "@/lib/services/analytics.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard statistics with role-based filtering
 * All authenticated users can access (data is filtered by role in service)
 */
export async function GET(request: NextRequest) {
	// Authenticate user
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	try {
		// Get dashboard statistics with role-based filtering
		// SUPERADMIN and MANAGER see all data
		// ADMIN and CASHIER see only their own data
		const stats = await getDashboardStats(user.id, user.roles);

		// Disable caching for real-time analytics data
		const response = NextResponse.json(stats, { status: 200 });
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error: any) {
		console.error("Error getting dashboard stats:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve dashboard statistics",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
