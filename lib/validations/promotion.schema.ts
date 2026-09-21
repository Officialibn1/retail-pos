import { z } from "zod";

export const PROMOTION_TYPES = ["PERCENTAGE", "FIXED"] as const;
export const PROMOTION_SCOPES = ["ALL", "CATEGORY", "ITEM"] as const;

// Base object — no superRefine so .partial() / .omit() work on it
const promotionBaseSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code must not exceed 50 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Code can only contain uppercase letters, numbers, hyphens and underscores",
    )
    .transform((v) => v.toUpperCase()),
  description: z
    .string()
    .max(200, "Description must not exceed 200 characters")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  type: z.enum(PROMOTION_TYPES, {
    errorMap: () => ({ message: "Invalid promotion type" }),
  }),
  value: z
    .number()
    .positive("Value must be positive")
    .max(999999, "Value is too large"),
  scope: z.enum(PROMOTION_SCOPES, {
    errorMap: () => ({ message: "Invalid scope" }),
  }),
  targetId: z
    .string()
    .cuid("Invalid target ID")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  isActive: z.boolean().default(true),
  expiresAt: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .transform((v) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }),
  usageLimit: z
    .number()
    .int("Usage limit must be a whole number")
    .positive("Usage limit must be positive")
    .optional()
    .nullable(),
});

// Create schema — superRefine added on top of the base object
export const createPromotionSchema = promotionBaseSchema.superRefine(
  (data, ctx) => {
    if (data.type === "PERCENTAGE" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100%",
        path: ["value"],
      });
    }
    if (
      (data.scope === "CATEGORY" || data.scope === "ITEM") &&
      !data.targetId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A target category or item is required for this scope",
        path: ["targetId"],
      });
    }
  },
);

// Update schema — .partial() and .omit() applied to the base object, then superRefine
export const updatePromotionSchema = promotionBaseSchema
  .partial()
  .omit({ code: true })
  .superRefine((data, ctx) => {
    if (
      data.type === "PERCENTAGE" &&
      data.value !== undefined &&
      data.value > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100%",
        path: ["value"],
      });
    }
    if (
      (data.scope === "CATEGORY" || data.scope === "ITEM") &&
      data.targetId !== undefined &&
      !data.targetId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A target category or item is required for this scope",
        path: ["targetId"],
      });
    }
  });

export const validatePromotionCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((v) => v.toUpperCase()),
  /** Cart items for scope checking */
  items: z.array(
    z.object({
      inventoryItemId: z.string().cuid(),
      categoryId: z.string().cuid(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    }),
  ),
  subtotal: z.number().nonnegative(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type ValidatePromotionCodeInput = z.infer<
  typeof validatePromotionCodeSchema
>;
