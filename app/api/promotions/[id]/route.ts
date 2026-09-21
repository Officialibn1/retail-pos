import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updatePromotionSchema } from "@/lib/validations/promotion.schema";
import {
  getPromotionById,
  updatePromotion,
  deletePromotion,
} from "@/lib/services/promotion.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const roleCheck = requireManager()(authResult.request);
    if (roleCheck) return roleCheck;

    const promotion = await getPromotionById(params.id);
    if (!promotion) {
      return NextResponse.json(
        { error: { message: "Promotion not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ promotion });
  } catch (error) {
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
    const data = updatePromotionSchema.parse(body);
    const promotion = await updatePromotion(params.id, data);

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await logActivity(
      authResult.request.user.id,
      "PROMOTION_UPDATED",
      `Updated promotion: ${promotion.code}`,
      ip,
      undefined,
      { entityType: "Promotion", entityId: promotion.id },
    );

    return NextResponse.json({
      message: "Promotion updated successfully",
      promotion,
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
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: { message: "Promotion not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    console.error("Error updating promotion:", error);
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

    await deletePromotion(params.id);

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await logActivity(
      authResult.request.user.id,
      "PROMOTION_DELETED",
      `Deleted promotion ID: ${params.id}`,
      ip,
      undefined,
      { entityType: "Promotion", entityId: params.id },
    );

    return NextResponse.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cannot delete")) {
      return NextResponse.json(
        { error: { message: error.message, code: "PROMOTION_IN_USE" } },
        { status: 409 },
      );
    }
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        { error: { message: "Promotion not found", code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    console.error("Error deleting promotion:", error);
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
