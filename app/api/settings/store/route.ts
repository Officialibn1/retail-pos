import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin } from "@/lib/middleware/auth";
import {
	getStoreSettings,
	updateStoreSettings,
} from "@/lib/services/store-settings.service";
import { z, ZodError } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().or(z.literal("")).optional(),
	taxRate: z.number().min(0).max(1).optional(),
	primaryColor: z.string().optional(),
	secondaryColor: z.string().optional(),
	logoUrl: z.string().optional(),
});

export async function GET() {
	try {
		const settings = await getStoreSettings();
		return NextResponse.json({ settings });
	} catch (error) {
		console.error("GET /api/settings/store:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) return roleCheck;

		const body = await request.json();
		const data = updateSchema.parse(body);

		const settings = await updateStoreSettings(data);
		return NextResponse.json({ settings });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}
		console.error("PUT /api/settings/store:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
