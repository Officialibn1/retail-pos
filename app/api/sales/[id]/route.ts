import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { getSaleById } from "@/lib/services/sale.service";

export const dynamic = 'force-dynamic';

/**
 * GET /api/sales/[id]
 * Get sale by ID with role-based access control
 * CASHIER can only see their own sales
 * Requires authentication
 */
export async function GET(
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

	try {
		const { id } = params;

		// Get sale with role-based filtering
		const sale = await getSaleById(id, user.id, user.roles);

		if (!sale) {
			return NextResponse.json(
				{
					error: {
						message: "Sale not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		return NextResponse.json(sale, { status: 200 });
	} catch (error: any) {
		console.error("Error retrieving sale:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve sale",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
