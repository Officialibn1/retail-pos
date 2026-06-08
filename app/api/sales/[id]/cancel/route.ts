import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { cancelSale } from "@/lib/services/sale.service";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/sales/[id]/cancel
 * Cancel a sale and restore inventory stock
 * Updates status to CANCELLED, restores inventory stock, creates stock movements
 * Requires authentication
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	// Authenticate user
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	// Check if user can perform mutations
	const statusCheck = await requireActiveMutation(user.id);
	if (statusCheck) {
		return statusCheck;
	}

	try {
		const { id } = params;

		// Cancel sale
		const sale = await cancelSale(id);

		// Log activity
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SALE_CANCELLED",
			`Cancelled sale ${id}`,
			ipAddress,
			undefined,
			{ entityType: "Sale", entityId: id },
		);

		return NextResponse.json(sale, { status: 200 });
	} catch (error: any) {
		console.error("Error cancelling sale:", error);

		// Handle specific errors
		if (error.message?.includes("not found")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		if (error.message?.includes("already cancelled")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "ALREADY_CANCELLED",
					},
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				error: {
					message: "Failed to cancel sale",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
