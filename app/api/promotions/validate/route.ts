import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { validatePromotionCodeSchema } from "@/lib/validations/promotion.schema";
import { validatePromoCode } from "@/lib/services/promotion.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/promotions/validate
 * Validate a promo code against the current cart (any authenticated user).
 * Does NOT consume the code — that happens at sale creation.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const data = validatePromotionCodeSchema.parse(body);

    const result = await validatePromoCode(data);

    if (!result.valid) {
      return NextResponse.json(
        { error: { message: result.message, code: "INVALID_PROMO_CODE" } },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      promotion: {
        id: result.promotion.id,
        code: result.promotion.code,
        type: result.promotion.type,
        value: Number(result.promotion.value),
        scope: result.promotion.scope,
        description: result.promotion.description,
      },
      discountAmount: result.discountAmount,
      appliesTo: result.appliesTo,
    });
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
    console.error("Error validating promo code:", error);
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
