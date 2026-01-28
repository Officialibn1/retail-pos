import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { CategoryRevenueParams } from "@/lib/types";

/**
 * GET /api/analytics/revenue/by-category
 *
 * Get revenue summary by category with percentage contributions
 *
 * Query Parameters:
 * - startDate: string (required) - Start date in ISO 8601 format
 * - endDate: string (required) - End date in ISO 8601 format
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.2, 9.9
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

		// Extract and validate required parameters
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		if (!startDate || !endDate) {
			return NextResponse.json(
				{
					error: {
						message:
							"Missing required parameters: startDate and endDate are required",
						code: "INVALID_PARAMETERS",
					},
				},
				{ status: 400 },
			);
		}

		// Build parameters object
		const params: CategoryRevenueParams = {
			startDate,
			endDate,
		};

		// Call analytics service
		const result = await enhancedAnalyticsService.getRevenueSummaryByCategory(
			params,
			user.id,
			user.roles,
		);

		// Set cache headers for performance optimization
		const response = NextResponse.json(result);

		// Cache for 5 minutes for frequently accessed analytics data
		response.headers.set(
			"Cache-Control",
			"public, max-age=300, stale-while-revalidate=600",
		);

		return response;
	} catch (error) {
		console.error("Error in category revenue analytics:", error);

		// Handle validation errors
		if (error instanceof Error) {
			if (
				error.message.includes("Invalid date format") ||
				error.message.includes("Start date must be")
			) {
				return NextResponse.json(
					{
						error: {
							message: error.message,
							code: "INVALID_PARAMETERS",
						},
					},
					{ status: 400 },
				);
			}
		}

		// Handle server errors
		return NextResponse.json(
			{
				error: {
					message:
						"Internal server error occurred while processing analytics request",
					code: "INTERNAL_SERVER_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
