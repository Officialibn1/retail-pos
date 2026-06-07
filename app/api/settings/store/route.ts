import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import {
	getStoreSettings,
	updateStoreSettings,
} from "@/lib/services/store-settings.service";
import { z, ZodError } from "zod";
import { UserRole } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

// Full schema — all fields accepted from SUPERADMIN
const updateSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().or(z.literal("")).optional(),
	taxRate: z.number().min(0).max(1).optional(),
	primaryColor: z.string().optional(),
	secondaryColor: z.string().optional(),
	logoUrl: z.string().optional(),
	currencySymbol: z.string().min(1).max(8).optional(),
});

// Fields that only SUPERADMIN may update
const SUPERADMIN_ONLY_FIELDS = [
	"name",
	"taxRate",
	"primaryColor",
	"secondaryColor",
	"logoUrl",
] as const;

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

		// MANAGER and SUPERADMIN can both reach this route
		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const isSuperAdmin = authResult.request.user.roles.includes(
			UserRole.SUPERADMIN,
		);

		const body = await request.json();
		let data = updateSchema.parse(body);

		// Strip SUPERADMIN-only fields if the caller is only a MANAGER
		if (!isSuperAdmin) {
			const filtered = { ...data };
			for (const field of SUPERADMIN_ONLY_FIELDS) {
				delete (filtered as any)[field];
			}
			data = filtered;
		}

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
