"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tag, X, CheckCircle, AlertCircle } from "lucide-react";
import { useValidatePromotionCodeMutation } from "@/lib/store/api";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";
import { formatNaira } from "@/lib/utils";

export interface AppliedPromotion {
  id: string;
  code: string;
  type: string;
  value: number;
  scope: string;
  description: string | null;
  discountAmount: number;
  appliesTo: string;
}

interface PromoCodeInputProps {
  cartItems: Array<{
    inventoryItemId: string;
    price: number;
    quantity: number;
    product: InventoryItemWithCategory;
  }>;
  subtotal: number;
  appliedPromo: AppliedPromotion | null;
  onApply: (promo: AppliedPromotion) => void;
  onRemove: () => void;
  disabled?: boolean;
  currencySymbol?: string;
}

export function PromoCodeInput({
  cartItems,
  subtotal,
  appliedPromo,
  onApply,
  onRemove,
  disabled = false,
  currencySymbol = "₦",
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validate, { isLoading }] = useValidatePromotionCodeMutation();

  const handleApply = async () => {
    if (!code.trim()) return;
    setError(null);

    try {
      const result = await validate({
        code: code.trim().toUpperCase(),
        subtotal,
        items: cartItems.map((i) => ({
          inventoryItemId: i.inventoryItemId,
          categoryId: i.product.categoryId,
          price: i.price,
          quantity: i.quantity,
        })),
      }).unwrap();

      onApply({
        ...result.promotion,
        discountAmount: result.discountAmount,
        appliesTo: result.appliesTo,
      });
      setCode("");
    } catch (err: any) {
      setError(err.data?.error?.message || "Invalid promo code");
    }
  };

  // Already applied — show the badge
  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between rounded-md bg-green-50 border border-green-200 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-green-800 text-sm">
                {appliedPromo.code}
              </span>
              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                -{formatNaira(appliedPromo.discountAmount, currencySymbol)}
              </Badge>
            </div>
            {appliedPromo.description && (
              <p className="text-xs text-green-700 truncate">
                {appliedPromo.description}
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onRemove}
          className="text-green-700 hover:bg-green-100 h-7 w-7 p-0 shrink-0">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder="Promo code"
            disabled={disabled || isLoading}
            className="pl-8 h-9 font-mono uppercase focus:border-brand-main-400"
            maxLength={50}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!code.trim() || disabled || isLoading}
          onClick={handleApply}
          className="h-9 px-3 text-brand-main-700 hover:bg-brand-main-50 border-brand-main-300">
          {isLoading ? <Spinner className="h-4 w-4" /> : "Apply"}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
