import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { receivePurchaseOrderSchema } from "@/lib/validations/purchase-order.schema";
import { receivePurchaseOrder } from "@/lib/services/purchase-order.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/purchase-orders/[id]/receive
 * Mark a purchase order as received, auto-adjust inventory stock (MANAGER+ only)
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

		const body = await request.json().catch(() => ({}));
		const validatedData = receivePurchaseOrderSchema.parse(body);

		const order = await receivePurchaseOrder(params.id, validatedData);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"PURCHASE_ORDER_RECEIVED",
			`Marked purchase order as received: ${params.id} (Supplier: ${order.supplier.name})`,
			ipAddress,
			undefined,
			{ entityType: "PurchaseOrder", entityId: params.id },
		);

		return NextResponse.json({ message: "Purchase order marked as received", order });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		if (error instanceof Error && (error.message.includes("already received") || error.message.includes("cancelled"))) {
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

		console.error("Error receiving purchase order:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
