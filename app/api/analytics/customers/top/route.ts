import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { canViewAllData } from "@/lib/auth";
import { TopCustomersParams } from "@/lib/types";

/**
 * GET /api/analytics/customers/top
 * Get top customers with sorting and limit options
 * Implements requirements 9.7, 9.9
 */
export async function GET(request: NextRequest) {
	try {
		// Authenticate user and get roles
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		const { user } = authResult.request;
		const { searchParams } = new URL(request.url);

		// Extract and validate query parameters
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const sortBy = searchParams.get("sortBy") as "revenue" | "frequency";
		const limitParam = searchParams.get("limit");

		// Validate required parameters
		if (!startDate || !endDate) {
			return NextResponse.json(
				{ error: "startDate and endDate parameters are required" },
				{ status: 400 },
			);
		}

		if (!sortBy || !["revenue", "frequency"].includes(sortBy)) {
			return NextResponse.json(
				{ error: "sortBy parameter must be 'revenue' or 'frequency'" },
				{ status: 400 },
			);
		}

		// Parse optional limit parameter
		let limit: number | undefined;
		if (limitParam) {
			limit = parseInt(limitParam, 10);
			if (isNaN(limit) || limit < 1 || limit > 1000) {
				return NextResponse.json(
					{ error: "limit parameter must be a number between 1 and 1000" },
					{ status: 400 },
				);
			}
		}

		// Build parameters object
		const params: TopCustomersParams = {
			startDate,
			endDate,
			sortBy,
			limit,
		};

		// Determine role-based access
		const userId = canViewAllData(user.roles) ? undefined : user.id;
		const userRoles = user.roles;

		// Get top customers analytics
		const topCustomersAnalytics =
			await enhancedAnalyticsService.getTopCustomers(params, userId, userRoles);

		// Disable caching for real-time analytics data
		const response = NextResponse.json(topCustomersAnalytics);
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error) {
		console.error("Error fetching top customers analytics:", error);

		// Handle validation errors
		if (error instanceof Error && error.message.includes("Invalid")) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{
				error: "Internal server error while fetching top customers analytics",
			},
			{ status: 500 },
		);
	}
}
