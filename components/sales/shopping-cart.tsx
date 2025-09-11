"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Minus, Plus } from "lucide-react"
import type { SaleItem, InventoryItem } from "@/lib/types"

interface CartItem extends SaleItem {
  product: InventoryItem
}

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onApplyDiscount: (discount: number) => void
  discount: number
  onCheckout: () => void
}

export function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onApplyDiscount,
  discount,
  onCheckout,
}: ShoppingCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * discount) / 100
  const taxRate = 0.1 // 10% tax
  const taxAmount = (subtotal - discountAmount) * taxRate
  const total = subtotal - discountAmount + taxAmount

  return (
    <Card className="border-lunar-green-200">
      <CardHeader>
        <CardTitle className="text-lunar-green-800">Shopping Cart ({items.length} items)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-lunar-green-600">Your cart is empty</div>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-lunar-green-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-lunar-green-800 text-sm">{item.product.name}</h4>
                    <p className="text-xs text-lunar-green-600">${item.unitPrice.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="h-6 w-6 p-0 border-lunar-green-200"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium text-lunar-green-800 w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0 border-lunar-green-200"
                      disabled={item.quantity >= item.product.quantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm font-medium text-lunar-green-800 w-16 text-right">
                    ${item.total.toFixed(2)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="bg-lunar-green-200" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-lunar-green-700">Discount (%):</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => onApplyDiscount(Number(e.target.value) || 0)}
                  className="w-20 h-8 border-lunar-green-200 focus:border-lunar-green-400"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-lunar-green-700">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-lunar-green-700">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lunar-green-700">
                  <span>Tax (10%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator className="bg-lunar-green-200" />
                <div className="flex justify-between font-medium text-lunar-green-800">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={onCheckout}
                disabled={items.length === 0}
                className="w-full bg-lunar-green-600 hover:bg-lunar-green-700 text-white"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
