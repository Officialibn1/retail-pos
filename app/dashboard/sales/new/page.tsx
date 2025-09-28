"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/sales/product-search";
import { ShoppingCart } from "@/components/sales/shopping-cart";
import { CheckoutDialog } from "@/components/sales/checkout-dialog";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import type { InventoryItem, SaleItem, Sale } from "@/lib/types";
import { RefreshCw } from "lucide-react";

interface CartItem extends SaleItem {
  product: InventoryItem;
}

export default function NewSalePage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const addToCart = (product: InventoryItem, quantity: number) => {
    const existingItem = cartItems.find(
      (item) => item.inventoryItemId === product.id,
    );

    if (existingItem) {
      const newQuantity = Math.min(
        existingItem.quantity + quantity,
        product.quantity,
      );
      updateQuantity(existingItem.id, newQuantity);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        inventoryItemId: product.id,
        quantity: Math.min(quantity, product.quantity),
        unitPrice: product.price,
        discount: 0,
        total: product.price * Math.min(quantity, product.quantity),
        product,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.min(quantity, item.product.quantity);
          return {
            ...item,
            quantity: newQuantity,
            total: item.unitPrice * newQuantity,
          };
        }
        return item;
      }),
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = (subtotal - discountAmount) * 0.1;
  const total = subtotal - discountAmount + taxAmount;

  const completeSale = (
    paymentMethod: "cash" | "card" | "digital",
    shouldShowReceipt = true,
  ) => {
    if (!user) return;

    const saleNumber = `SAL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber,
      items: cartItems.map((item) => ({
        id: item.id,
        inventoryItemId: item.inventoryItemId,
        name: item.product.name,
        price: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount,
        total: item.total,
        unitPrice: item.unitPrice,
      })),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      paymentMethod,
      salesPersonId: user.id,
      createdAt: new Date(),
      customerId: undefined,
      status: "completed",
    };

    console.log("Sale completed:", newSale);

    if (shouldShowReceipt) {
      setCompletedSale(newSale);
      setShowReceipt(true);
    }

    clearCart();
    // Show success message or redirect
  };

  if (!user) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-lunar-green-800">New Sale</h1>
          <p className="text-lunar-green-600 mt-1">
            Create a new sales transaction
          </p>
        </div>
        <Button
          onClick={clearCart}
          variant="outline"
          className="border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50 bg-transparent"
          disabled={cartItems.length === 0}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Search */}
        <div className="lg:col-span-2">
          <Card className="border-lunar-green-200">
            <CardHeader>
              <CardTitle className="text-lunar-green-800">
                Select Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSearch onAddToCart={addToCart} />
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onApplyDiscount={setDiscount}
            discount={discount}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        items={cartItems}
        subtotal={subtotal}
        discount={discountAmount}
        tax={taxAmount}
        total={total}
        onCompleteSale={completeSale}
      />

      {/* Receipt Print Dialog */}
      <ReceiptPrintDialog
        sale={completedSale}
        open={showReceipt}
        onOpenChange={setShowReceipt}
      />
    </div>
  );
}
