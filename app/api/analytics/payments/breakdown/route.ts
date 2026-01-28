import { NextRequest, NextResponse } from "next/server";
import { enhancedAnalyticsService } from "@/lib/services/analytics.service";
import { requireAuth } from "@/lib/middleware/auth";
import { PaymentBreakdownParams } from "@/lib/types";

/**
 * GET /api/analytics/payments/breakdown
 * Get payment method breakdown analytics
 * Implements requirements 9.4, 9.9, 9.10
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

		// Build parameters object
		const params: PaymentBreakdownParams = {
			startDate,
			endDate,
		};

		// Get payment method breakdown data
		const result = await enhancedAnalyticsService.getPaymentMethodBreakdown(
			params,
			user.id,
			user.roles,
		);

		// Set cache headers for performance optimization
		const response = NextResponse.json(result);
		response.headers.set(
			"Cache-Control",
			"public, max-age=300, stale-while-revalidate=600",
		);

		return response;
	} catch (error) {
		console.error("Payment method breakdown error:", error);

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
					message: "Failed to fetch payment method breakdown",
					code: "INTERNAL_SERVER_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
