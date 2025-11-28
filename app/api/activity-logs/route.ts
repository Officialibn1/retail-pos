import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getActivityLogs } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/activity-logs
 * Get activity logs with role-based filtering
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
		// Get query parameters
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "100");

		// Get activity logs with role-based filtering
		const logs = await getActivityLogs(user.id, user.roles, limit);

		return NextResponse.json(logs, { status: 200 });
	} catch (error: any) {
		console.error("Error getting activity logs:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve activity logs",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
