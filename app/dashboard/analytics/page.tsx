"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { getSalesAnalytics, getInventoryAnalytics } from "@/lib/analytics";
import { SalesChart } from "@/components/analytics/sales-chart";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { PaymentMethodsChart } from "@/components/analytics/payment-methods-chart";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { canViewAllData } from "@/lib/auth";

export default function AnalyticsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const salesAnalytics = getSalesAnalytics(user);
  const inventoryAnalytics = getInventoryAnalytics();
  const canSeeAll = canViewAllData(user.role);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-lunar-green-800">
            Analytics Dashboard
          </h1>
          <p className="text-lunar-green-600 mt-1">
            {canSeeAll
              ? "Store-wide analytics and insights"
              : "Your personal sales analytics"}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-lunar-green-100 text-lunar-green-800"
        >
          {canSeeAll ? "All Data" : "Personal Data"}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              ₦{salesAnalytics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-lunar-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Total Sales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {salesAnalytics.totalSales}
            </div>
            <p className="text-xs text-lunar-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Avg Order Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              ₦{salesAnalytics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-lunar-green-600 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {inventoryAnalytics.lowStockCount}
            </div>
            <p className="text-xs text-lunar-green-600">Items below 10 units</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">Sales Trend</CardTitle>
            <CardDescription className="text-lunar-green-600">
              Daily sales over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesAnalytics.salesByDay} />
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-lunar-green-600">
              Daily revenue over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={salesAnalytics.salesByDay} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">
              Payment Methods
            </CardTitle>
            <CardDescription className="text-lunar-green-600">
              Sales distribution by payment type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodsChart data={salesAnalytics.salesByPaymentMethod} />
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">Top Products</CardTitle>
            <CardDescription className="text-lunar-green-600">
              Best selling items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesAnalytics.topSellingProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lunar-green-100 text-xs font-medium text-lunar-green-800">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-lunar-green-800">
                        {product.productName}
                      </p>
                      <p className="text-xs text-lunar-green-600">
                        {product.quantitySold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-lunar-green-800">
                    ₦{product.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">Recent Sales</CardTitle>
            <CardDescription className="text-lunar-green-600">
              Latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesAnalytics.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-lunar-green-800">
                      {sale.saleNumber}
                    </p>
                    <p className="text-xs text-lunar-green-600">
                      {sale.createdAt.toLocaleDateString()} •{" "}
                      {sale.paymentMethod}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-lunar-green-800">
                    ₦{sale.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
