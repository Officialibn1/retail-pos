import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updatePurchaseOrderSchema } from "@/lib/validations/purchase-order.schema";
import {
	getPurchaseOrderById,
	updatePurchaseOrder,
	cancelPurchaseOrder,
} from "@/lib/services/purchase-order.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/purchase-orders/[id]
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const order = await getPurchaseOrderById(params.id);
		if (!order) {
			return NextResponse.json(
				{ error: { message: "Purchase order not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		return NextResponse.json({ order });
	} catch (error) {
		console.error("Error fetching purchase order:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/purchase-orders/[id]
 * Update notes/status/items (only when PENDING)
 */
export async function PUT(
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

		const body = await request.json();
		const validatedData = updatePurchaseOrderSchema.parse(body);

		const order = await updatePurchaseOrder(params.id, validatedData);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"PURCHASE_ORDER_UPDATED",
			`Updated purchase order ID: ${params.id}`,
			ipAddress,
			undefined,
			{ entityType: "PurchaseOrder", entityId: params.id },
		);

		return NextResponse.json({ message: "Purchase order updated successfully", order });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		if (error instanceof Error && (error.message.includes("Cannot edit") || error.message.includes("not found"))) {
			return NextResponse.json(
				{ error: { message: error.message, code: "INVALID_STATE" } },
				{ status: 409 },
			);
		}

		console.error("Error updating purchase order:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
