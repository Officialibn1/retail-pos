"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, Receipt, Plus, Printer } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { dummySales } from "@/lib/dummy-data/dummy-sales";
import { mockUsers } from "@/lib/dummy-data/mock-users";
import { ReceiptPrintDialog } from "@/components/receipts/receipt-print-dialog";
import type { Sale } from "@/lib/types";
import Link from "next/link";

export default function SalesHistoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [viewingSale, setViewingSale] = useState<any>(null);

  if (!user) return null;

  const canSeeAll = canViewAllData(user.role);
  const filteredSales = dummySales.filter((sale) => {
    if (!canSeeAll && sale.salesPersonId !== user.id) {
      return false;
    }

    const matchesSearch =
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewSale = (sale: any) => {
    setViewingSale(sale);
    setShowSaleDetails(true);
  };

  const handlePrintReceipt = (sale: any) => {
    const receiptSale: Sale = {
      id: sale.id,
      saleNumber: sale.saleNumber,
      items: sale.items.map((item: any) => ({
        id: item.id,
        inventoryItemId: item.inventoryItemId,
        name: item.name || `Item ${item.inventoryItemId}`,
        price: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount || 0,
        total: item.total,
      })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      salesperson: getSalesPersonName(sale.salesPersonId),
      date: sale.createdAt.toISOString(),
      customer: undefined,
    };

    setSelectedSale(receiptSale);
    setShowReceipt(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-lunar-green-100 text-lunar-green-800 hover:bg-lunar-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Cancelled
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-700">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSalesPersonName = (salesPersonId: string) => {
    const salesPerson = mockUsers.find((u) => u.id === salesPersonId);
    return salesPerson?.name || "Unknown";
  };

  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = filteredSales.filter(
    (sale) => sale.status === "completed",
  ).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-lunar-green-800">
            Sales History
          </h1>
          <p className="text-lunar-green-600 mt-1">
            {canSeeAll
              ? "View all store sales transactions"
              : "View your sales transactions"}
          </p>
        </div>
        <Button
          asChild
          className="bg-lunar-green-600 hover:bg-lunar-green-700 text-white"
        >
          <Link href="/dashboard/sales/new">
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Total Sales
            </CardTitle>
            <Receipt className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {totalSales}
            </div>
            <p className="text-xs text-lunar-green-600">
              {completedSales} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Total Revenue
            </CardTitle>
            <Receipt className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              ₦{totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-lunar-green-600">
              From {canSeeAll ? "all sales" : "your sales"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Avg Order Value
            </CardTitle>
            <Receipt className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              ₦
              {totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-lunar-green-600">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-lunar-green-200">
        <CardHeader>
          <CardTitle className="text-lunar-green-800">
            Sales Transactions
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-lunar-green-200 focus:border-lunar-green-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-lunar-green-200 rounded-md text-sm focus:border-lunar-green-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-lunar-green-200">
                <TableHead className="text-lunar-green-700">
                  Sale Number
                </TableHead>
                <TableHead className="text-lunar-green-700">Date</TableHead>
                {canSeeAll && (
                  <TableHead className="text-lunar-green-700">
                    Sales Person
                  </TableHead>
                )}
                <TableHead className="text-lunar-green-700">Items</TableHead>
                <TableHead className="text-lunar-green-700">Payment</TableHead>
                <TableHead className="text-lunar-green-700">Total</TableHead>
                <TableHead className="text-lunar-green-700">Status</TableHead>
                <TableHead className="text-lunar-green-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id} className="border-lunar-green-100">
                  <TableCell className="font-medium text-lunar-green-800">
                    {sale.saleNumber}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    {sale.createdAt.toLocaleDateString()}{" "}
                    {sale.createdAt.toLocaleTimeString()}
                  </TableCell>
                  {canSeeAll && (
                    <TableCell className="text-lunar-green-700">
                      {getSalesPersonName(sale.salesPersonId)}
                    </TableCell>
                  )}
                  <TableCell className="text-lunar-green-700">
                    {sale.items.length} items
                  </TableCell>
                  <TableCell className="text-lunar-green-700 capitalize">
                    {sale.paymentMethod}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    ₦{sale.total.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-lunar-green-600 hover:bg-lunar-green-100"
                        onClick={() => handleViewSale(sale)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-lunar-green-600 hover:bg-lunar-green-100"
                        onClick={() => handlePrintReceipt(sale)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-lunar-green-600">
              No sales found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lunar-green-800">
              Sale Details
            </DialogTitle>
          </DialogHeader>
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-lunar-green-700">
                    Sale Number
                  </p>
                  <p className="text-lunar-green-800">
                    {viewingSale.saleNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-lunar-green-700">
                    Date
                  </p>
                  <p className="text-lunar-green-800">
                    {viewingSale.createdAt.toLocaleDateString()}{" "}
                    {viewingSale.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-lunar-green-700">
                    Sales Person
                  </p>
                  <p className="text-lunar-green-800">
                    {getSalesPersonName(viewingSale.salesPersonId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-lunar-green-700">
                    Payment Method
                  </p>
                  <p className="text-lunar-green-800 capitalize">
                    {viewingSale.paymentMethod}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-lunar-green-700 mb-2">
                  Items
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingSale.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.name || `Item ₦{item.inventoryItemId}`}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₦{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>₦{item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lunar-green-700">Subtotal:</span>
                  <span className="text-lunar-green-800">
                    ₦{viewingSale.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lunar-green-700">Tax:</span>
                  <span className="text-lunar-green-800">
                    ₦{viewingSale.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lunar-green-700">Discount:</span>
                  <span className="text-lunar-green-800">
                    -₦{viewingSale.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-lunar-green-700">Total:</span>
                  <span className="text-lunar-green-800">
                    ₦{viewingSale.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ReceiptPrintDialog
        sale={selectedSale}
        open={showReceipt}
        onOpenChange={setShowReceipt}
      />
    </div>
  );
}
