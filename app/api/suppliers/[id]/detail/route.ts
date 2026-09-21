import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { getSupplierDetail } from "@/lib/services/supplier.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/suppliers/[id]/detail
 * Returns full supplier detail: counts + inventory items + purchase orders
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

		const supplier = await getSupplierDetail(params.id);

		if (!supplier) {
			return NextResponse.json(
				{ error: { message: "Supplier not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		return NextResponse.json({ supplier });
	} catch (error) {
		console.error("Error fetching supplier detail:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
