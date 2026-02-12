import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getSalesByDateRange } from "@/lib/services/analytics.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/sales-by-date
 * Get sales grouped by day with totals
 * Requires MANAGER+ role
 * Query params:
 *   - startDate: Start date (ISO format, default: 7 days ago)
 *   - endDate: End date (ISO format, default: today)
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
		// Get date range from query params
		const { searchParams } = new URL(request.url);
		const startDateParam = searchParams.get("startDate");
		const endDateParam = searchParams.get("endDate");

		// Default to last 30 days if not provided
		const endDate = endDateParam ? new Date(endDateParam) : new Date();
		const startDate = startDateParam
			? new Date(startDateParam)
			: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Validate dates
		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid date format. Use ISO format (YYYY-MM-DD)",
						code: "VALIDATION_ERROR",
					},
				},
				{ status: 400 },
			);
		}

		if (startDate > endDate) {
			return NextResponse.json(
				{
					error: {
						message: "Start date must be before or equal to end date",
						code: "VALIDATION_ERROR",
					},
				},
				{ status: 400 },
			);
		}

		// Get sales by date range with role-based filtering
		const salesByDate = await getSalesByDateRange(
			startDate,
			endDate,
			user.id,
			user.roles,
		);

		// Disable caching for real-time analytics data
		const response = NextResponse.json(salesByDate, { status: 200 });
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error: any) {
		console.error("Error getting sales by date:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve sales by date",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
