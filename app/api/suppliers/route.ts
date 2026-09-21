import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createSupplierSchema } from "@/lib/validations/supplier.schema";
import { createSupplier, listSuppliers } from "@/lib/services/supplier.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/suppliers
 * Create a new supplier (MANAGER+ only)
 */
export async function POST(request: NextRequest) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const body = await request.json();
		const validatedData = createSupplierSchema.parse(body);

		const supplier = await createSupplier(validatedData);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			authResult.request.user.id,
			"SUPPLIER_CREATED",
			`Created supplier: ${supplier.name}`,
			ipAddress,
			undefined,
			{ entityType: "Supplier", entityId: supplier.id },
		);

		return NextResponse.json(
			{ message: "Supplier created successfully", supplier },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json(
				{ error: { message: error.message, code: "DUPLICATE_SUPPLIER" } },
				{ status: 409 },
			);
		}

		// Prisma unique constraint
		if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002") {
			return NextResponse.json(
				{ error: { message: "A supplier with this phone or email already exists", code: "DUPLICATE_SUPPLIER" } },
				{ status: 409 },
			);
		}

		console.error("Error creating supplier:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * GET /api/suppliers
 * List all suppliers (MANAGER+ only)
 */
export async function GET(request: NextRequest) {
	try {
		const params = request.nextUrl.searchParams;

		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const suppliers = await listSuppliers(params);

		return NextResponse.json({ suppliers, count: suppliers.length });
	} catch (error) {
		console.error("Error listing suppliers:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
