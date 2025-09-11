"use client";

import { useState, useRef } from "react"; // Import useRef
import { BarcodeScanner } from "react-barcode-scanner"; // Import BarcodeScanner
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Camera } from "lucide-react"; // Import Camera icon
import { mockInventoryData } from "@/lib/dummy-data/mock-inventory";
import type { InventoryItem } from "@/lib/types";

interface ProductSearchProps {
  onAddToCart: (item: InventoryItem, quantity: number) => void;
}

export function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isScanning, setIsScanning] = useState(false); // State to control scanner visibility
  const scannerRef = useRef(null); // Ref for the scanner component

  const filteredProducts = mockInventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory && item.quantity > 0;
  });

  const categories = Array.from(
    new Set(mockInventoryData.map((item) => item.category)),
  );

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const handleScan = (decodedText: string) => {
    setSearchTerm(decodedText); // Set the scanned barcode as the search term
    setIsScanning(false); // Stop scanning after a successful scan
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500" />
          <Input
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 border-lunar-green-200 focus:border-lunar-green-400"
            disabled={isScanning} // Disable input while scanning
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsScanning(!isScanning)}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50"
            aria-label="Scan Barcode"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-lunar-green-200 rounded-md text-sm focus:border-lunar-green-400 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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

      <div className="border border-lunar-green-200 rounded-lg max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-lunar-green-200">
              <TableHead className="text-lunar-green-700">Product</TableHead>
              <TableHead className="text-lunar-green-700">SKU</TableHead>
              <TableHead className="text-lunar-green-700">Price</TableHead>
              <TableHead className="text-lunar-green-700">Stock</TableHead>
              <TableHead className="text-lunar-green-700">Status</TableHead>
              <TableHead className="text-lunar-green-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity);
              return (
                <TableRow
                  key={product.id}
                  className="border-lunar-green-100 hover:bg-lunar-green-50"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-lunar-green-800 text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs text-lunar-green-600 truncate max-w-xs">
                        {product.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-lunar-green-700 text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell className="text-lunar-green-800 font-medium">
                    ₦{product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    {product.quantity}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stockStatus.variant}
                      className={
                        stockStatus.variant === "destructive"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : stockStatus.variant === "secondary"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            : "bg-green-100 text-green-800 hover:bg-green-100"
                      }
                    >
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => onAddToCart(product, 1)}
                      className="bg-lunar-green-600 hover:bg-lunar-green-700 text-white"
                      disabled={product.quantity === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-lunar-green-600">
          {searchTerm || selectedCategory !== "all"
            ? "No products found matching your search criteria."
            : "No products available."}
        </div>
      )}
    </div>
  );
}
