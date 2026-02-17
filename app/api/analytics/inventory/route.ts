import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { canViewAllData } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/inventory
 * Get current inventory value analysis
 * Implements requirements 9.6, 9.9
 */
export async function GET(request: NextRequest) {
	try {
		// Authenticate user and get roles
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		const { user } = authResult.request;

		// Check if user has permission to view analytics data
		if (!canViewAllData(user.roles)) {
			return NextResponse.json(
				{ error: "Insufficient permissions to access inventory analytics" },
				{ status: 403 },
			);
		}

		// Get inventory value analysis
		const inventoryAnalytics =
			await enhancedAnalyticsService.getInventoryValue();

		// Disable caching for real-time analytics data
		const response = NextResponse.json(inventoryAnalytics);
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error) {
		console.error("Error fetching inventory analytics:", error);

		// Handle validation errors
		if (error instanceof Error && error.message.includes("Invalid")) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Internal server error while fetching inventory analytics" },
			{ status: 500 },
		);
	}
}
