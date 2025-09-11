"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Package, AlertTriangle, DollarSign } from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";
import { EditItemDialog } from "@/components/inventory/edit-item-dialog";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import { mockInventoryData } from "@/lib/dummy-data/mock-inventory";
import type { InventoryItem } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InventoryPage() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const totalItems = mockInventoryData.length;
  const lowStockItems = mockInventoryData.filter(
    (item) => item.quantity < 10,
  ).length;
  const outOfStockItems = mockInventoryData.filter(
    (item) => item.quantity === 0,
  ).length;
  const totalValue = mockInventoryData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleAddItem = (
    newItem: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
  ) => {
    console.log("Adding new item:", newItem);
    // In a real app, this would make an API call to add the item
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (updatedItem: InventoryItem) => {
    console.log("Updating item:", updatedItem);
    // In a real app, this would make an API call to update the item
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      console.log("Deleting item:", selectedItem.id);
      // In a real app, this would make an API call to delete the item
    }
    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={["SuperAdmin", "Manager"]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-lunar-green-800">
              Inventory Management
            </h1>
            <p className="text-lunar-green-600 mt-1">
              Manage your store's product inventory
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-lunar-green-600 hover:bg-lunar-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-lunar-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lunar-green-700">
                Total Items
              </CardTitle>
              <Package className="h-4 w-4 text-lunar-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lunar-green-800">
                {totalItems}
              </div>
              <p className="text-xs text-lunar-green-600">Active products</p>
            </CardContent>
          </Card>

          <Card className="border-lunar-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lunar-green-700">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lunar-green-800">
                {lowStockItems}
              </div>
              <p className="text-xs text-lunar-green-600">
                Items below 10 units
              </p>
            </CardContent>
          </Card>

          <Card className="border-lunar-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lunar-green-700">
                Out of Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lunar-green-800">
                {outOfStockItems}
              </div>
              <p className="text-xs text-lunar-green-600">
                Items with 0 quantity
              </p>
            </CardContent>
          </Card>

          <Card className="border-lunar-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lunar-green-700">
                Total Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-lunar-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lunar-green-800">
                ₦{totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-lunar-green-600">Inventory worth</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
              <CardDescription className="text-amber-700">
                You have {lowStockItems} items running low on stock. Consider
                restocking soon.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Inventory Table */}
        <InventoryTable onEdit={handleEditItem} onDelete={handleDeleteItem} />

        {/* Dialogs */}
        <AddItemDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSave={handleAddItem}
        />

        <EditItemDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          item={selectedItem}
          onSave={handleSaveEdit}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lunar-green-800">
                Delete Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lunar-green-600">
                Are you sure you want to delete "{selectedItem?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
