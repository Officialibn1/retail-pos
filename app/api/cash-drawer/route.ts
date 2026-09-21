import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { openShiftSchema } from "@/lib/validations/cash-drawer.schema";
import { openSession, listSessions } from "@/lib/services/cash-drawer.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/cash-drawer
 * List cash drawer sessions. MANAGER+ can view all; others see their own.
 */
export async function GET(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	try {
		const params = request.nextUrl.searchParams;

		// Non-managers can only see their own sessions
		const isManager = user.roles.some(
			(r) => r === "SUPERADMIN" || r === "MANAGER",
		);
		if (!isManager) {
			params.set("userId", user.id);
		}

		const sessions = await listSessions(params);
		return NextResponse.json({ sessions }, { status: 200 });
	} catch (error) {
		console.error("Error listing cash drawer sessions:", error);
		return NextResponse.json(
			{ error: { message: "Failed to retrieve sessions", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/cash-drawer
 * Open a new shift / cash drawer session.
 */
export async function POST(request: NextRequest) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	const statusCheck = await requireActiveMutation(user.id);
	if (statusCheck) return statusCheck;

	try {
		const body = await request.json();
		const validatedData = openShiftSchema.parse(body);

		const session = await openSession(user.id, validatedData);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SHIFT_OPENED",
			`Opened shift with opening float: ₦${Number(session.openingFloat).toFixed(2)}`,
			ipAddress,
			undefined,
			{ entityType: "CashDrawerSession", entityId: session.id },
		);

		return NextResponse.json(
			{ message: "Shift opened successfully", session },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}
		if (error instanceof Error && error.message.includes("already have an open shift")) {
			return NextResponse.json(
				{ error: { message: error.message, code: "SHIFT_ALREADY_OPEN" } },
				{ status: 409 },
			);
		}
		console.error("Error opening shift:", error);
		return NextResponse.json(
			{ error: { message: "Failed to open shift", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
