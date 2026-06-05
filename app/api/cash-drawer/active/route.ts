import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { getActiveSession } from "@/lib/services/cash-drawer.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/cash-drawer/active
 * Get the current user's active (open) shift session, if any.
 * Returns { session: null } when no shift is open.
 */
export async function GET(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	try {
		const session = await getActiveSession(user.id);
		return NextResponse.json({ session }, { status: 200 });
	} catch (error) {
		console.error("Error fetching active session:", error);
		return NextResponse.json(
			{ error: { message: "Failed to fetch active session", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
