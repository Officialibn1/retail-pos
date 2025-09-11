"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import type { SaleItem } from "@/lib/types";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onCompleteSale: (
    paymentMethod: "cash" | "card" | "digital",
    shouldShowReceipt?: boolean,
  ) => void;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  items,
  subtotal,
  discount,
  tax,
  total,
  onCompleteSale,
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "digital"
  >("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generateReceipt, setGenerateReceipt] = useState(true);

  const handleCompleteSale = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    onCompleteSale(paymentMethod, generateReceipt);
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lunar-green-800">
            Complete Sale
          </DialogTitle>
          <DialogDescription className="text-lunar-green-600">
            Review the order details and select a payment method to complete the
            sale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-medium text-lunar-green-800">Order Summary</h3>
            <div className="bg-lunar-green-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm text-lunar-green-700">
                <span>Items ({items.length}):</span>
                <span>₦{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-lunar-green-700">
                  <span>Discount:</span>
                  <span>-₦{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-lunar-green-700">
                <span>Tax:</span>
                <span>₦{tax.toFixed(2)}</span>
              </div>
              <Separator className="bg-lunar-green-200" />
              <div className="flex justify-between font-medium text-lunar-green-800">
                <span>Total:</span>
                <span>₦{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-medium text-lunar-green-800">Payment Method</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as any)}
            >
              <div className="flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg">
                <RadioGroupItem value="card" id="card" />
                <Label
                  htmlFor="card"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="h-4 w-4 text-lunar-green-600" />
                  <span className="text-lunar-green-700">
                    Credit/Debit Card
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg">
                <RadioGroupItem value="cash" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Banknote className="h-4 w-4 text-lunar-green-600" />
                  <span className="text-lunar-green-700">Cash</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg">
                <RadioGroupItem value="digital" id="digital" />
                <Label
                  htmlFor="digital"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Smartphone className="h-4 w-4 text-lunar-green-600" />
                  <span className="text-lunar-green-700">Digital Wallet</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-lunar-green-800">
              Receipt Options
            </h3>
            <div className="flex items-center space-x-2 p-3 border border-lunar-green-200 rounded-lg">
              <input
                type="checkbox"
                id="generate-receipt"
                checked={generateReceipt}
                onChange={(e) => setGenerateReceipt(e.target.checked)}
                className="rounded border-lunar-green-300 text-lunar-green-600 focus:ring-lunar-green-500"
              />
              <Label
                htmlFor="generate-receipt"
                className="cursor-pointer text-lunar-green-700"
              >
                Generate and print receipt
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteSale}
            disabled={isProcessing}
            className="bg-lunar-green-600 hover:bg-lunar-green-700 text-white"
          >
            {isProcessing
              ? "Processing..."
              : `Complete Sale - ₦${total.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
