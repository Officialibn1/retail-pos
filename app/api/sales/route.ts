import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createSaleSchema } from "@/lib/validations/sale.schema";
import { createSale, listSales } from "@/lib/services/sale.service";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/sales
 * Create a new sale with PENDING status
 * Requires authentication
 */
export async function POST(request: NextRequest) {
	// Authenticate user
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	// Check if user can perform mutations (not suspended or blocked)
	const statusCheck = await requireActiveMutation(user.id);
	if (statusCheck) {
		return statusCheck;
	}

	try {
		// Parse request body
		const body = await request.json();

		// Validate input
		const validationResult = createSaleSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid input data",
						code: "VALIDATION_ERROR",
						details: validationResult.error.errors,
					},
				},
				{ status: 400 },
			);
		}

		const data = validationResult.data;

		// Create sale
		const sale = await createSale(data);

		// Log activity
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SALE_CREATED",
			`Created sale ${sale.id} with ${data.items.length} items`,
			ipAddress,
		);

		return NextResponse.json(sale, { status: 201 });
	} catch (error: any) {
		console.error("Error creating sale:", error);

		// Handle specific errors
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

		return NextResponse.json(
			{
				error: {
					message: "Failed to create sale",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}

/**
 * GET /api/sales
 * List sales with role-based filtering
 * CASHIER sees only their sales, MANAGER+ sees all sales
 * Supports query parameters: searchTerm, status
 * Requires authentication
 */
export async function GET(request: NextRequest) {
	// Authenticate user
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	try {
		// Extract searchParams from request URL
		const params = request.nextUrl.searchParams;

		// List sales with role-based filtering and pass searchParams to service
		const sales = await listSales(user.id, user.roles, params);

		return NextResponse.json(sales, { status: 200 });
	} catch (error: any) {
		console.error("Error listing sales:", error);

		return NextResponse.json(
			{
				error: {
					message: "Failed to retrieve sales",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
