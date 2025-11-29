import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
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
 * Supports query parameters: status, startDate, endDate, page, limit
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
		// Parse query parameters
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const page = searchParams.get("page");
		const limit = searchParams.get("limit");

		// Build filters object
		const filters: any = {};

		// Validate and add status filter
		if (status) {
			const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
			if (!validStatuses.includes(status)) {
				return NextResponse.json(
					{
						error: {
							message: `Invalid status. Must be one of: ${validStatuses.join(
								", ",
							)}`,
							code: "VALIDATION_ERROR",
						},
					},
					{ status: 400 },
				);
			}
			filters.status = status;
		}

		// Validate and add date filters
		if (startDate) {
			const parsedStartDate = new Date(startDate);
			if (isNaN(parsedStartDate.getTime())) {
				return NextResponse.json(
					{
						error: {
							message:
								"Invalid startDate format. Use ISO 8601 format (e.g., 2024-01-01)",
							code: "VALIDATION_ERROR",
						},
					},
					{ status: 400 },
				);
			}
			filters.startDate = parsedStartDate;
		}

		if (endDate) {
			const parsedEndDate = new Date(endDate);
			if (isNaN(parsedEndDate.getTime())) {
				return NextResponse.json(
					{
						error: {
							message:
								"Invalid endDate format. Use ISO 8601 format (e.g., 2024-01-31)",
							code: "VALIDATION_ERROR",
						},
					},
					{ status: 400 },
				);
			}
			filters.endDate = parsedEndDate;
		}

		// Validate and add pagination
		if (page) {
			const parsedPage = parseInt(page, 10);
			if (isNaN(parsedPage) || parsedPage < 1) {
				return NextResponse.json(
					{
						error: {
							message: "Invalid page number. Must be a positive integer",
							code: "VALIDATION_ERROR",
						},
					},
					{ status: 400 },
				);
			}
			filters.page = parsedPage;
		}

		if (limit) {
			const parsedLimit = parseInt(limit, 10);
			if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
				return NextResponse.json(
					{
						error: {
							message: "Invalid limit. Must be between 1 and 100",
							code: "VALIDATION_ERROR",
						},
					},
					{ status: 400 },
				);
			}
			filters.limit = parsedLimit;
		}

		// List sales with role-based filtering and additional filters
		const sales = await listSales(user.id, user.roles, filters);

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
