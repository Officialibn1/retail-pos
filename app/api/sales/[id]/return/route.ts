import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createReturnSchema } from "@/lib/validations/sale.schema";
import { createReturn } from "@/lib/services/sale.service";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/sales/[id]/return
 * Process a return for a completed sale
 * Restocks returned items, creates SaleReturn record, and logs activity
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

		// Parse request body
		const body = await request.json();

		// Validate input
		const validationResult = createReturnSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid return data",
						code: "VALIDATION_ERROR",
						details: validationResult.error.errors,
					},
				},
				{ status: 400 },
			);
		}

		const returnData = validationResult.data;

		// Process return
		const saleReturn = await createReturn(id, returnData, user.id);

		// Log activity
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SALE_RETURNED",
			`Processed return for sale ${id} — Refund: ₦${saleReturn.refundAmount.toFixed(2)} via ${returnData.refundMethod}`,
			ipAddress,
		);

		return NextResponse.json(saleReturn, { status: 201 });
	} catch (error: any) {
		console.error("Error processing return:", error);

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

		if (error.message?.includes("Cannot process return")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "INVALID_STATUS",
					},
				},
				{ status: 400 },
			);
		}

		if (
			error.message?.includes("was not part of the original sale") ||
			error.message?.includes("Cannot return")
		) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "INVALID_RETURN_ITEM",
					},
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				error: {
					message: "Failed to process return",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
