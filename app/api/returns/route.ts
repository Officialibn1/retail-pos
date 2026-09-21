import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { listReturns } from "@/lib/services/return.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/returns
 * List returns with role-based filtering
 * CASHIER sees only returns they processed; MANAGER+ sees all
 * Supports query params: searchTerm, refundMethod, startDate, endDate
 */
export async function GET(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	try {
		const params = request.nextUrl.searchParams;
		const returns = await listReturns(user.id, user.roles, params);
		return NextResponse.json(returns, { status: 200 });
	} catch (error: any) {
		console.error("Error listing returns:", error);
		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve returns",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
