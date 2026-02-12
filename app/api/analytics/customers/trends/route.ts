import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { canViewAllData } from "@/lib/auth";
import { CustomerTrendsParams } from "@/lib/types";

/**
 * GET /api/analytics/customers/trends
 * Get customer purchase trend analysis with growth classification
 * Implements requirements 9.8, 9.9
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
		const interval = searchParams.get("interval") as "week" | "month";
		const customerIdsParam = searchParams.get("customerIds");

		// Validate required parameters
		if (!startDate || !endDate) {
			return NextResponse.json(
				{ error: "startDate and endDate parameters are required" },
				{ status: 400 },
			);
		}

		if (!interval || !["week", "month"].includes(interval)) {
			return NextResponse.json(
				{ error: "interval parameter must be 'week' or 'month'" },
				{ status: 400 },
			);
		}

		// Parse optional customerIds parameter
		let customerIds: string[] | undefined;
		if (customerIdsParam) {
			try {
				customerIds = customerIdsParam
					.split(",")
					.filter((id) => id.trim().length > 0);
			} catch (error) {
				return NextResponse.json(
					{
						error:
							"customerIds parameter must be a comma-separated list of customer IDs",
					},
					{ status: 400 },
				);
			}
		}

		// Build parameters object
		const params: CustomerTrendsParams = {
			startDate,
			endDate,
			interval,
			customerIds,
		};

		// Determine role-based access
		const userId = canViewAllData(user.roles) ? undefined : user.id;
		const userRoles = user.roles;

		// Get customer trends analytics
		const customerTrendsAnalytics =
			await enhancedAnalyticsService.getCustomerTrends(
				params,
				userId,
				userRoles,
			);

		// Disable caching for real-time analytics data
		const response = NextResponse.json(customerTrendsAnalytics);
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error) {
		console.error("Error fetching customer trends analytics:", error);

		// Handle validation errors
		if (error instanceof Error && error.message.includes("Invalid")) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{
				error: "Internal server error while fetching customer trends analytics",
			},
			{ status: 500 },
		);
	}
}
