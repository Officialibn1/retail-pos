import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { TopProductsParams } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/products/top-performing
 *
 * Get top performing products with filtering and trend analysis
 *
 * Query Parameters:
 * - startDate: string (required) - Start date in ISO 8601 format
 * - endDate: string (required) - End date in ISO 8601 format
 * - categoryId?: string - Filter by specific category
 * - groupBy?: 'day' | 'week' | 'month' | 'year' - Group data for trend analysis
 * - sortBy: 'revenue' | 'quantity' (required) - Sort products by revenue or quantity
 * - limit?: number - Maximum number of products to return (default: 10, max: 1000)
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 9.1, 9.9
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
		const sortBy = searchParams.get("sortBy");

		if (!startDate || !endDate || !sortBy) {
			return NextResponse.json(
				{
					error: {
						message:
							"Missing required parameters: startDate, endDate, and sortBy are required",
						code: "INVALID_PARAMETERS",
					},
				},
				{ status: 400 },
			);
		}

		// Validate sortBy parameter
		if (!["revenue", "quantity"].includes(sortBy)) {
			return NextResponse.json(
				{
					error: {
						message:
							"Invalid sortBy parameter. Must be 'revenue' or 'quantity'",
						code: "INVALID_PARAMETERS",
					},
				},
				{ status: 400 },
			);
		}

		// Extract optional parameters
		const categoryId = searchParams.get("categoryId") || undefined;
		const groupBy = searchParams.get("groupBy") as
			| "day"
			| "week"
			| "month"
			| "year"
			| undefined;
		const limitParam = searchParams.get("limit");

		// Validate groupBy parameter if provided
		if (groupBy && !["day", "week", "month", "year"].includes(groupBy)) {
			return NextResponse.json(
				{
					error: {
						message:
							"Invalid groupBy parameter. Must be 'day', 'week', 'month', or 'year'",
						code: "INVALID_PARAMETERS",
					},
				},
				{ status: 400 },
			);
		}

		// Validate and parse limit parameter
		let limit: number | undefined;
		if (limitParam) {
			const parsedLimit = parseInt(limitParam, 10);
			if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
				return NextResponse.json(
					{
						error: {
							message:
								"Invalid limit parameter. Must be a number between 1 and 1000",
							code: "INVALID_PARAMETERS",
						},
					},
					{ status: 400 },
				);
			}
			limit = parsedLimit;
		}

		// Build parameters object
		const params: TopProductsParams = {
			startDate,
			endDate,
			sortBy: sortBy as "revenue" | "quantity",
			categoryId,
			groupBy,
			limit,
		};

		// Call analytics service
		const result = await enhancedAnalyticsService.getTopPerformingProducts(
			params,
			user.id,
			user.roles,
		);

		// Disable caching for real-time analytics data
		const response = NextResponse.json(result);
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error) {
		console.error("Error in top performing products analytics:", error);

		// Handle validation errors
		if (error instanceof Error) {
			if (
				error.message.includes("Invalid date format") ||
				error.message.includes("Start date must be") ||
				error.message.includes("Limit must be") ||
				error.message.includes("sortBy must be") ||
				error.message.includes("groupBy must be")
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
