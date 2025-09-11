"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { getSalesAnalytics } from "@/lib/analytics";
import { SalesChart } from "@/components/analytics/sales-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const canSeeAllData = canViewAllData(user.role);
  const salesAnalytics = getSalesAnalytics(user);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-lunar-green-800">
            Welcome back, {user.name}
          </h1>
          <p className="text-lunar-green-600 mt-1">
            {canSeeAllData
              ? "Here's an overview of your store performance"
              : "Here's your personal dashboard"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-lunar-green-100 text-lunar-green-800"
          >
            {user.role}
          </Badge>
          <Button
            asChild
            variant="outline"
            className="border-lunar-green-200 text-lunar-green-700 hover:bg-lunar-green-50 bg-transparent"
          >
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Total Sales
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-lunar-green-600"
            >
              <path d="M12 2v20m9-9H3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              ₦{salesAnalytics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-lunar-green-600">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Orders
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-lunar-green-600"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {salesAnalytics.totalSales}
            </div>
            <p className="text-xs text-lunar-green-600">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Avg Order Value
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-lunar-green-600"
            >
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              ₦{salesAnalytics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-lunar-green-600">+19% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Active Now
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-lunar-green-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-3-3m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {canSeeAllData ? "+573" : "1"}
            </div>
            <p className="text-xs text-lunar-green-600">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">
              Sales Overview
            </CardTitle>
            <CardDescription className="text-lunar-green-600">
              Daily sales for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart data={salesAnalytics.salesByDay} />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-lunar-green-200">
          <CardHeader>
            <CardTitle className="text-lunar-green-800">Recent Sales</CardTitle>
            <CardDescription className="text-lunar-green-600">
              {canSeeAllData
                ? "Latest store transactions"
                : "Your recent sales"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {salesAnalytics.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-lunar-green-800">
                      {sale.saleNumber}
                    </p>
                    <p className="text-sm text-lunar-green-600">
                      {sale.createdAt.toLocaleDateString()} •{" "}
                      {sale.paymentMethod}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-lunar-green-800">
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
