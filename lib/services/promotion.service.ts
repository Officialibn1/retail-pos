import { prisma } from "@/lib/prisma";
import { Promotion } from "@/generated/prisma/client";
import {
  CreatePromotionInput,
  UpdatePromotionInput,
  ValidatePromotionCodeInput,
} from "@/lib/validations/promotion.schema";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PromotionValidationResult {
  valid: true;
  promotion: Promotion;
  /** Computed discount amount in currency units */
  discountAmount: number;
  /** Human-readable description of what the promo applies to */
  appliesTo: string;
}

export interface PromotionValidationError {
  valid: false;
  message: string;
}

export type PromotionValidation =
  | PromotionValidationResult
  | PromotionValidationError;

// ─────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────

export async function createPromotion(
  data: CreatePromotionInput,
): Promise<Promotion> {
  const existing = await prisma.promotion.findUnique({
    where: { code: data.code },
  });
  if (existing) throw new Error(`Promotion code "${data.code}" already exists`);

  return prisma.promotion.create({
    data: {
      code: data.code,
      description: data.description || null,
      type: data.type,
      value: data.value,
      scope: data.scope,
      targetId: data.targetId || null,
      isActive: data.isActive ?? true,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      usageLimit: data.usageLimit ?? null,
    },
  });
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  return prisma.promotion.findUnique({ where: { id } });
}

export async function listPromotions(
  params: URLSearchParams,
): Promise<Promotion[]> {
  const searchTerm = params.get("searchTerm");
  const activeOnly = params.get("active") === "true";

  return prisma.promotion.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(searchTerm
        ? {
            OR: [
              { code: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updatePromotion(
  id: string,
  data: UpdatePromotionInput,
): Promise<Promotion> {
  return prisma.promotion.update({
    where: { id },
    data: {
      description:
        data.description !== undefined ? data.description || null : undefined,
      type: data.type,
      value: data.value,
      scope: data.scope,
      targetId: data.targetId !== undefined ? data.targetId || null : undefined,
      isActive: data.isActive,
      expiresAt:
        data.expiresAt !== undefined
          ? data.expiresAt
            ? new Date(data.expiresAt)
            : null
          : undefined,
      usageLimit:
        data.usageLimit !== undefined ? (data.usageLimit ?? null) : undefined,
    },
  });
}

export async function deletePromotion(id: string): Promise<void> {
  const inUse = await prisma.sale.count({ where: { promotionId: id } });
  if (inUse > 0) {
    throw new Error(
      "Cannot delete a promotion that has been used in sales. Deactivate it instead.",
    );
  }
  await prisma.promotion.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────
// Validation (public endpoint + used inside createSale)
// ─────────────────────────────────────────────────────────────

/**
 * Validate a promo code against a cart and compute the discount.
 * Does NOT increment usageCount — that happens at sale creation time.
 */
export async function validatePromoCode(
  input: ValidatePromotionCodeInput,
): Promise<PromotionValidation> {
  const promotion = await prisma.promotion.findUnique({
    where: { code: input.code },
  });

  if (!promotion) {
    return { valid: false, message: "Promo code not found" };
  }

  if (!promotion.isActive) {
    return { valid: false, message: "This promo code is no longer active" };
  }

  if (promotion.expiresAt && promotion.expiresAt < new Date()) {
    return { valid: false, message: "This promo code has expired" };
  }

  if (
    promotion.usageLimit !== null &&
    promotion.usageCount >= promotion.usageLimit
  ) {
    return {
      valid: false,
      message: "This promo code has reached its usage limit",
    };
  }

  // ── Compute discount amount based on scope ──────────────────
  let discountAmount = 0;
  let appliesTo = "all items";

  if (promotion.scope === "ALL") {
    discountAmount = computeDiscount(
      promotion.type,
      Number(promotion.value),
      input.subtotal,
    );
    appliesTo = "all items";
  } else if (promotion.scope === "CATEGORY" && promotion.targetId) {
    const eligibleSubtotal = input.items
      .filter((i) => i.categoryId === promotion.targetId)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (eligibleSubtotal === 0) {
      return {
        valid: false,
        message: "No items in your cart qualify for this promotion",
      };
    }

    discountAmount = computeDiscount(
      promotion.type,
      Number(promotion.value),
      eligibleSubtotal,
    );
    appliesTo = "eligible category items";
  } else if (promotion.scope === "ITEM" && promotion.targetId) {
    const eligibleSubtotal = input.items
      .filter((i) => i.inventoryItemId === promotion.targetId)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (eligibleSubtotal === 0) {
      return {
        valid: false,
        message: "The specific item for this promotion is not in your cart",
      };
    }

    discountAmount = computeDiscount(
      promotion.type,
      Number(promotion.value),
      eligibleSubtotal,
    );
    appliesTo = "the specific promotional item";
  }

  return {
    valid: true,
    promotion,
    discountAmount: Math.min(discountAmount, input.subtotal), // never exceed subtotal
    appliesTo,
  };
}

/**
 * Atomically increment usageCount when a sale is completed.
 * Call this inside the sale creation transaction.
 */
export async function incrementPromotionUsage(
  promotionId: string,
  tx: any,
): Promise<void> {
  await tx.promotion.update({
    where: { id: promotionId },
    data: { usageCount: { increment: 1 } },
  });
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function computeDiscount(type: string, value: number, base: number): number {
  if (type === "PERCENTAGE") {
    return (base * value) / 100;
  }
  // FIXED — cap at the base amount
  return Math.min(value, base);
}
