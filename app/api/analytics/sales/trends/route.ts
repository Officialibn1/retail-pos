import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { SalesTrendParams } from "@/lib/types";

/**
 * GET /api/analytics/sales/trends
 * Get sales trends with KPI calculations and time-based aggregation
 *
 * Query Parameters:
 * - startDate: string (ISO 8601 format, required)
 * - endDate: string (ISO 8601 format, required)
 * - interval: "hourly" | "daily" | "weekly" (optional, defaults to "daily")
 *
 * Requirements: 9.3, 9.9
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
						message: "startDate and endDate parameters are required",
						code: "MISSING_REQUIRED_PARAMS",
					},
				},
				{ status: 400 },
			);
		}

		// Extract optional parameters
		const interval = searchParams.get("interval") as
			| "hourly"
			| "daily"
			| "weekly"
			| null;

		// Validate interval parameter
		if (interval && !["hourly", "daily", "weekly"].includes(interval)) {
			return NextResponse.json(
				{
					error: {
						message: "interval must be 'hourly', 'daily', or 'weekly'",
						code: "INVALID_INTERVAL",
					},
				},
				{ status: 400 },
			);
		}

		// Build parameters object
		const params: SalesTrendParams = {
			startDate,
			endDate,
			interval: interval || "daily",
		};

		// Validate date format
		try {
			new Date(startDate).toISOString();
			new Date(endDate).toISOString();
		} catch (error) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
						code: "INVALID_DATE_FORMAT",
					},
				},
				{ status: 400 },
			);
		}

		// Get sales trends data
		const result = await enhancedAnalyticsService.getSalesTrends(
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
		console.error("Error fetching sales trends:", error);

		// Handle validation errors
		if (error instanceof Error) {
			if (
				error.message.includes("Invalid date format") ||
				error.message.includes("Start date must be") ||
				error.message.includes("interval must be")
			) {
				return NextResponse.json(
					{
						error: {
							message: error.message,
							code: "VALIDATION_ERROR",
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
					message: "Internal server error while fetching sales trends",
					code: "INTERNAL_SERVER_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
