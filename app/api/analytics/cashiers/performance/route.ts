import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { CashierPerformanceParams } from "@/lib/types";
import { canViewAllData } from "@/lib/auth";

/**
 * GET /api/analytics/cashiers/performance
 * Get cashier performance analytics with role-based access control
 * Implements requirements 9.5, 9.9, 9.10
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

		// Extract and validate parameters
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const userId = searchParams.get("userId");

		// Validate required parameters
		if (!startDate || !endDate) {
			return NextResponse.json(
				{
					error: {
						message: "startDate and endDate parameters are required",
						code: "MISSING_PARAMETERS",
					},
				},
				{ status: 400 },
			);
		}

		// Role-based access control for cashier data
		const userRoles = user.roles;
		const canAccessAllCashierData = canViewAllData(userRoles);

		// If user cannot view all data and is requesting another user's data, deny access
		if (!canAccessAllCashierData && userId && userId !== user.id) {
			return NextResponse.json(
				{
					error: {
						message:
							"Insufficient permissions to view other users' performance data",
						code: "FORBIDDEN",
					},
				},
				{ status: 403 },
			);
		}

		// If user cannot view all data, restrict to their own data
		const effectiveUserId = canAccessAllCashierData ? userId : user.id;

		// Build parameters object
		const params: CashierPerformanceParams = {
			startDate,
			endDate,
			userId: effectiveUserId || undefined,
		};

		// Get cashier performance data
		const result = await enhancedAnalyticsService.getCashierPerformance(
			params,
			user.id,
			userRoles,
		);

		// Set cache headers for performance optimization
		const response = NextResponse.json(result);
		response.headers.set(
			"Cache-Control",
			"public, max-age=300, stale-while-revalidate=600",
		);

		return response;
	} catch (error) {
		console.error("Cashier performance error:", error);

		// Handle validation errors
		if (error instanceof Error) {
			if (
				error.message.includes("Invalid date") ||
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
					message: "Failed to fetch cashier performance data",
					code: "INTERNAL_SERVER_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
