import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createPromotionSchema } from "@/lib/validations/promotion.schema";
import {
  createPromotion,
  listPromotions,
} from "@/lib/services/promotion.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/** POST /api/promotions — create a promotion (MANAGER+ only) */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const roleCheck = requireManager()(authResult.request);
    if (roleCheck) return roleCheck;

    const statusCheck = await requireActiveMutation(authResult.request.user.id);
    if (statusCheck) return statusCheck;

    const body = await request.json();
    const data = createPromotionSchema.parse(body);
    const promotion = await createPromotion(data);

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await logActivity(
      authResult.request.user.id,
      "PROMOTION_CREATED",
      `Created promotion: ${promotion.code}`,
      ip,
      undefined,
      { entityType: "Promotion", entityId: promotion.id },
    );

    return NextResponse.json(
      { message: "Promotion created successfully", promotion },
      { status: 201 },
    );
  } catch (error) {
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
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: { message: error.message, code: "DUPLICATE_CODE" } },
        { status: 409 },
      );
    }
    console.error("Error creating promotion:", error);
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

/** GET /api/promotions — list promotions (MANAGER+ only) */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const roleCheck = requireManager()(authResult.request);
    if (roleCheck) return roleCheck;

    const promotions = await listPromotions(request.nextUrl.searchParams);
    return NextResponse.json({ promotions, count: promotions.length });
  } catch (error) {
    console.error("Error listing promotions:", error);
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
