import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getTopSellingProducts } from "@/lib/services/analytics.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/top-products
 * Get top selling products ordered by quantity sold
 * Requires MANAGER+ role
 * Query params:
 *   - limit: Number of products to return (default: 5)
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
		// Get limit from query params
		const { searchParams } = new URL(request.url);
		const limitParam = searchParams.get("limit");
		const limit = limitParam ? parseInt(limitParam, 10) : 5;

		// Validate limit
		if (isNaN(limit) || limit < 1 || limit > 100) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid limit parameter. Must be between 1 and 100",
						code: "VALIDATION_ERROR",
					},
				},
				{ status: 400 },
			);
		}

		// Get top selling products with role-based filtering
		const topProducts = await getTopSellingProducts(limit, user.id, user.roles);

		// Disable caching for real-time analytics data
		const response = NextResponse.json(topProducts, { status: 200 });
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, max-age=0",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		return response;
	} catch (error: any) {
		console.error("Error getting top selling products:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve top selling products",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
