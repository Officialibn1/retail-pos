import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { createCustomerSchema } from "@/lib/validations/customer.schema";
import { createCustomer, listCustomers } from "@/lib/services/customer.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = createCustomerSchema.parse(body);

		// Create customer
		const customer = await createCustomer(validatedData);

		return NextResponse.json(
			{
				message: "Customer created successfully",
				customer,
			},
			{ status: 201 },
		);
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: {
						message: "Validation failed",
						code: "VALIDATION_ERROR",
						details: error.errors,
					},
				},
				{ status: 400 },
			);
		}

		// Handle uniqueness constraint errors
		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "DUPLICATE_PHONE",
					},
				},
				{ status: 409 },
			);
		}

		// Handle unexpected errors
		console.error("Error creating customer:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}

/**
 * GET /api/customers
 * List all customers with sales history
 */
export async function GET(request: NextRequest) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Get all customers with sales history
		const customers = await listCustomers();

		return NextResponse.json({
			customers,
			count: customers.length,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error listing customers:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
