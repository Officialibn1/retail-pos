import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { completeSaleSchema } from "@/lib/validations/sale.schema";
import { completeSale } from "@/lib/services/sale.service";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/sales/[id]/complete
 * Complete a sale with payment details
 * Updates status to COMPLETED, reduces inventory stock, creates stock movements
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
		const validationResult = completeSaleSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid payment data",
						code: "VALIDATION_ERROR",
						details: validationResult.error.errors,
					},
				},
				{ status: 400 },
			);
		}

		const paymentData = validationResult.data;

		// Complete sale
		const sale = await completeSale(id, paymentData);

		// Log activity
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SALE_COMPLETED",
			`Completed sale ${id} - Total: ₦${Number(sale.total).toFixed(
				2,
			)} - Payment: ${paymentData.paymentMethod}`,
			ipAddress,
		);

		return NextResponse.json(sale, { status: 200 });
	} catch (error: any) {
		console.error("Error completing sale:", error);

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

		if (error.message?.includes("Insufficient stock")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "INSUFFICIENT_STOCK",
					},
				},
				{ status: 400 },
			);
		}

		if (error.message?.includes("Cannot complete sale")) {
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

		return NextResponse.json(
			{
				error: {
					message: "Failed to complete sale",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
