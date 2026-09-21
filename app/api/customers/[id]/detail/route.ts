import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/customers/[id]/detail
 * Returns a customer with full sales detail (items + category), returns, and
 * any return items needed for the customer detail page analytics.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	try {
		const customer = await prisma.customer.findUnique({
			where: { id: params.id },
			include: {
				sales: {
					include: {
						items: {
							include: {
								inventoryItem: {
									select: {
										id: true,
										name: true,
										sku: true,
										category: { select: { id: true, name: true } },
									},
								},
							},
						},
						returns: {
							include: {
								items: {
									include: {
										inventoryItem: {
											select: { id: true, name: true, sku: true },
										},
									},
								},
								processedBy: { select: { id: true, name: true } },
							},
						},
						user: { select: { id: true, name: true } },
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});

		if (!customer) {
			return NextResponse.json(
				{ error: { message: "Customer not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		return NextResponse.json({ customer }, { status: 200 });
	} catch (error) {
		console.error("Error fetching customer detail:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
