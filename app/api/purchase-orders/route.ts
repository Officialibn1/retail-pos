import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createPurchaseOrderSchema } from "@/lib/validations/purchase-order.schema";
import {
	createPurchaseOrder,
	listPurchaseOrders,
} from "@/lib/services/purchase-order.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/purchase-orders
 * Create a new purchase order (MANAGER+ only)
 */
export async function POST(request: NextRequest) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const body = await request.json();
		const validatedData = createPurchaseOrderSchema.parse(body);

		const order = await createPurchaseOrder(validatedData);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"PURCHASE_ORDER_CREATED",
			`Created purchase order for supplier: ${order.supplier.name}`,
			ipAddress,
			undefined,
			{ entityType: "PurchaseOrder", entityId: order.id },
		);

		return NextResponse.json(
			{ message: "Purchase order created successfully", order },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		console.error("Error creating purchase order:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * GET /api/purchase-orders
 * List all purchase orders (MANAGER+ only)
 */
export async function GET(request: NextRequest) {
	try {
		const params = request.nextUrl.searchParams;

		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const orders = await listPurchaseOrders(params);

		return NextResponse.json({ orders, count: orders.length });
	} catch (error) {
		console.error("Error listing purchase orders:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
