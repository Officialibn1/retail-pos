import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { closeShiftSchema } from "@/lib/validations/cash-drawer.schema";
import { closeSession } from "@/lib/services/cash-drawer.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/cash-drawer/[id]/close
 * Close an open shift session, recording declared cash and computing variance.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	const statusCheck = await requireActiveMutation(user.id);
	if (statusCheck) return statusCheck;

	try {
		const { id } = params;
		const body = await request.json();
		const validatedData = closeShiftSchema.parse(body);

		const session = await closeSession(id, user.id, validatedData);

		const variance = Number(session.variance ?? 0);
		const varianceLabel =
			variance === 0
				? "no variance"
				: variance > 0
					? `surplus of ₦${Math.abs(variance).toFixed(2)}`
					: `shortage of ₦${Math.abs(variance).toFixed(2)}`;

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SHIFT_CLOSED",
			`Closed shift — declared: ₦${Number(session.declaredClose).toFixed(2)}, expected: ₦${Number(session.expectedClose).toFixed(2)}, ${varianceLabel}`,
			ipAddress,
			undefined,
			{ entityType: "CashDrawerSession", entityId: id, variance: Number(session.variance ?? 0) },
		);

		return NextResponse.json(
			{ message: "Shift closed successfully", session },
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}
		if (error instanceof Error) {
			if (error.message === "Shift session not found.") {
				return NextResponse.json(
					{ error: { message: error.message, code: "NOT_FOUND" } },
					{ status: 404 },
				);
			}
			if (
				error.message === "You can only close your own shift." ||
				error.message === "This shift is already closed."
			) {
				return NextResponse.json(
					{ error: { message: error.message, code: "FORBIDDEN" } },
					{ status: 403 },
				);
			}
		}
		console.error("Error closing shift:", error);
		return NextResponse.json(
			{ error: { message: "Failed to close shift", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
