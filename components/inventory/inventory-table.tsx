"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import { mockInventoryData } from "@/lib/dummy-data/mock-inventory";

interface InventoryTableProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({ onEdit, onDelete }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredItems = mockInventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
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

  return (
    <Card className="border-lunar-green-200">
      <CardHeader>
        <CardTitle className="text-lunar-green-800">Inventory Items</CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-lunar-green-200 focus:border-lunar-green-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-lunar-green-200">
              <TableHead className="text-lunar-green-700">Product</TableHead>
              <TableHead className="text-lunar-green-700">SKU</TableHead>
              <TableHead className="text-lunar-green-700">Category</TableHead>
              <TableHead className="text-lunar-green-700">Price</TableHead>
              <TableHead className="text-lunar-green-700">Cost</TableHead>
              <TableHead className="text-lunar-green-700">Quantity</TableHead>
              <TableHead className="text-lunar-green-700">Status</TableHead>
              <TableHead className="text-lunar-green-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.quantity);
              return (
                <TableRow key={item.id} className="border-lunar-green-100">
                  <TableCell>
                    <div>
                      <div className="font-medium text-lunar-green-800">
                        {item.name}
                      </div>
                      <div className="text-sm text-lunar-green-600">
                        {item.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    {item.sku}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    ₦{item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    ₦{item.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    <div className="flex items-center gap-2">
                      {item.quantity}
                      {item.quantity < 10 && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lunar-green-600 hover:bg-lunar-green-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(item)}
                          className="text-lunar-green-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-lunar-green-600">
            No items found matching your search criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
