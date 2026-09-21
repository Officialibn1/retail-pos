import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { cancelPurchaseOrder } from "@/lib/services/purchase-order.service";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/purchase-orders/[id]/cancel
 * Cancel a purchase order (MANAGER+ only)
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const order = await cancelPurchaseOrder(params.id);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"PURCHASE_ORDER_CANCELLED",
			`Cancelled purchase order ID: ${params.id}`,
			ipAddress,
			undefined,
			{ entityType: "PurchaseOrder", entityId: params.id },
		);

		return NextResponse.json({ message: "Purchase order cancelled", order });
	} catch (error) {
		if (error instanceof Error && (error.message.includes("Cannot cancel") || error.message.includes("already cancelled"))) {
			return NextResponse.json(
				{ error: { message: error.message, code: "INVALID_STATE" } },
				{ status: 409 },
			);
		}

		if (error instanceof Error && error.message.includes("not found")) {
			return NextResponse.json(
				{ error: { message: "Purchase order not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		console.error("Error cancelling purchase order:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
