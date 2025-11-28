import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { updateCustomerSchema } from "@/lib/validations/customer.schema";
import {
	getCustomerById,
	updateCustomer,
	deleteCustomer,
} from "@/lib/services/customer.service";
import { ZodError } from "zod";

export const dynamic = 'force-dynamic';

/**
 * GET /api/customers/[id]
 * Get customer by ID with all associated sales
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Get customer with sales history
		const customer = await getCustomerById(params.id);

		if (!customer) {
			return NextResponse.json(
				{
					error: {
						message: "Customer not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			customer,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error fetching customer:", error);
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
 * PUT /api/customers/[id]
 * Update customer
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = updateCustomerSchema.parse(body);

		// Update customer
		const customer = await updateCustomer(params.id, validatedData);

		return NextResponse.json({
			message: "Customer updated successfully",
			customer,
		});
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

		// Handle not found errors
		if (
			error instanceof Error &&
			error.message.includes("Record to update not found")
		) {
			return NextResponse.json(
				{
					error: {
						message: "Customer not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error updating customer:", error);
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
 * DELETE /api/customers/[id]
 * Delete customer (only if no associated sales)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Delete customer
		await deleteCustomer(params.id);

		return NextResponse.json({
			message: "Customer deleted successfully",
		});
	} catch (error) {
		// Handle reference constraint errors
		if (
			error instanceof Error &&
			error.message.includes("Cannot delete customer")
		) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "CUSTOMER_HAS_SALES",
					},
				},
				{ status: 409 },
			);
		}

		// Handle not found errors
		if (error instanceof Error && error.message.includes("not found")) {
			return NextResponse.json(
				{
					error: {
						message: "Customer not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Handle unexpected errors
		console.error("Error deleting customer:", error);
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
