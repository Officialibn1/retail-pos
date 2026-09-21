import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updateSupplierSchema } from "@/lib/validations/supplier.schema";
import {
	getSupplierById,
	updateSupplier,
	deleteSupplier,
} from "@/lib/services/supplier.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/suppliers/[id]
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

		const supplier = await getSupplierById(params.id);
		if (!supplier) {
			return NextResponse.json(
				{ error: { message: "Supplier not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		return NextResponse.json({ supplier });
	} catch (error) {
		console.error("Error fetching supplier:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/suppliers/[id]
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const body = await request.json();
		const validatedData = updateSupplierSchema.parse(body);

		const supplier = await updateSupplier(params.id, validatedData);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"SUPPLIER_UPDATED",
			`Updated supplier: ${supplier.name}`,
			ipAddress,
			undefined,
			{ entityType: "Supplier", entityId: supplier.id },
		);

		return NextResponse.json({ message: "Supplier updated successfully", supplier });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002") {
			return NextResponse.json(
				{ error: { message: "A supplier with this phone or email already exists", code: "DUPLICATE_SUPPLIER" } },
				{ status: 409 },
			);
		}

		if (error instanceof Error && error.message.includes("Record to update not found")) {
			return NextResponse.json(
				{ error: { message: "Supplier not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		console.error("Error updating supplier:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/suppliers/[id]
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		await deleteSupplier(params.id);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"SUPPLIER_DELETED",
			`Deleted supplier ID: ${params.id}`,
			ipAddress,
			undefined,
			{ entityType: "Supplier", entityId: params.id },
		);

		return NextResponse.json({ message: "Supplier deleted successfully" });
	} catch (error) {
		if (error instanceof Error && error.message.includes("Cannot delete supplier")) {
			return NextResponse.json(
				{ error: { message: error.message, code: "SUPPLIER_HAS_ACTIVE_ORDERS" } },
				{ status: 409 },
			);
		}

		if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
			return NextResponse.json(
				{ error: { message: "Supplier not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		console.error("Error deleting supplier:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
