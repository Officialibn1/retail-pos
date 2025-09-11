"use client";

import type React from "react";
import { useState, useRef } from "react"; // Import useRef
import { BarcodeScanner } from "react-barcode-scanner"; // Import BarcodeScanner
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryItem } from "@/lib/types";
import { Camera } from "lucide-react"; // Import Camera icon

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  onSave,
}: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    cost: "",
    quantity: "",
    category: "",
    barcode: "",
  });
  const [isScanning, setIsScanning] = useState(false); // State to control scanner visibility
  const scannerRef = useRef(null); // Ref for the scanner component

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem = {
      name: formData.name,
      description: formData.description,
      sku: formData.sku,
      price: Number.parseFloat(formData.price),
      cost: Number.parseFloat(formData.cost),
      quantity: Number.parseInt(formData.quantity),
      category: formData.category,
      barcode: formData.barcode || undefined,
    };

    onSave(newItem);

    // Reset form
    setFormData({
      name: "",
      description: "",
      sku: "",
      price: "",
      cost: "",
      quantity: "",
      category: "",
      barcode: "",
    });

    onOpenChange(false);
    setIsScanning(false); // Close scanner when dialog is closed or form is saved
  };

  const handleScan = (decodedText: string) => {
    setFormData({ ...formData, barcode: decodedText });
    setIsScanning(false); // Stop scanning after a successful scan
  };

  const categories = [
    "Electronics",
    "Accessories",
    "Clothing",
    "Books",
    "Home & Garden",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lunar-green-800">
            Add New Item
          </DialogTitle>
          <DialogDescription className="text-lunar-green-600">
            Add a new item to your inventory. Fill in all the required
            information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lunar-green-700">
                Product Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border-lunar-green-200 focus:border-lunar-green-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-lunar-green-700">
                SKU *
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="border-lunar-green-200 focus:border-lunar-green-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-lunar-green-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border-lunar-green-200 focus:border-lunar-green-400"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-lunar-green-700">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="border-lunar-green-200 focus:border-lunar-green-400">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-lunar-green-700">
                Barcode
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="border-lunar-green-200 focus:border-lunar-green-400 flex-grow"
                  disabled={isScanning} // Disable input while scanning
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsScanning(!isScanning)}
                  className="border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50 h-9 w-9 p-0"
                  aria-label="Scan Barcode"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isScanning && (
            <div className="relative w-full h-64 border border-lunar-green-200 rounded-lg overflow-hidden">
              <BarcodeScanner
                ref={scannerRef}
                onSuccess={handleScan}
                onError={() => setIsScanning(false)} // Stop scanning on error
                width={300} // Adjust width as needed
                height={200} // Adjust height as needed
                constraints={{ facingMode: "environment" }} // Use back camera
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-lunar-green-700">
                Selling Price *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="border-lunar-green-200 focus:border-lunar-green-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-lunar-green-700">
                Cost Price *
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                className="border-lunar-green-200 focus:border-lunar-green-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-lunar-green-700">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="border-lunar-green-200 focus:border-lunar-green-400"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setIsScanning(false); // Ensure scanner is off when dialog closes
              }}
              className="border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-lunar-green-600 hover:bg-lunar-green-700 text-white"
            >
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
