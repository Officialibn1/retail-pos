"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Receipt,
  Wallet,
} from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";
import {
  useGetDashboardStatsQuery,
  useGetExpensesQuery,
} from "@/lib/store/api";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";

interface OverviewMetricsProps {
  onRefresh?: () => void;
}

export function OverviewMetrics({ onRefresh }: OverviewMetricsProps) {
  const c = useCurrencySymbol();
  const {
    data: dashboardStats,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: isFetchingDashboard,
  } = useGetDashboardStatsQuery();

  const { data: expensesData, isLoading: isExpensesLoading } =
    useGetExpensesQuery();

  const isLoading = isDashboardLoading || isExpensesLoading;
  const isError = isDashboardError;
  const error = dashboardError;

  const totalExpenses = (expensesData?.expenses ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const handleRefresh = () => {
    refetchDashboard();
  };

  if (isLoading || isFetchingDashboard) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className=" ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Failed to load overview metrics:{" "}
            {(error as any)?.data?.error?.message ||
              (error as any)?.message ||
              "Unknown error"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="ml-2">
            <RefreshCw
              className={cn("h-3 w-3 mr-1", {
                "animate-spin": isFetchingDashboard,
              })}
            />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardStats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No overview data available at this time.
        </AlertDescription>
      </Alert>
    );
  }

  const netProfit = dashboardStats.totalRevenue - totalExpenses;
  const isProfit = netProfit >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className=" ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-brand-main-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-main-800">
            {formatNaira(dashboardStats.totalRevenue, c)}
          </div>
          <CardDescription className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Total sales revenue
          </CardDescription>
        </CardContent>
      </Card>

      <Card className=" ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Sales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-brand-main-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-main-800">
            {dashboardStats.totalSales}
          </div>
          <CardDescription className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Completed transactions
          </CardDescription>
        </CardContent>
      </Card>

      <Card className=" ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Avg Order Value</CardTitle>
          <DollarSign className="h-4 w-4 text-brand-main-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-main-800">
            {formatNaira(dashboardStats.averageOrderValue, c)}
          </div>
          <CardDescription className="flex items-center mt-1">
            <TrendingDown className="h-3 w-3 mr-1" />
            Per transaction
          </CardDescription>
        </CardContent>
      </Card>

      <Card className=" ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-brand-main-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-main-800">
            {dashboardStats.lowStockCount}
          </div>
          <CardDescription>Items below 10 units</CardDescription>
        </CardContent>
      </Card>

      <Card className=" ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Expenses</CardTitle>
          <Receipt className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">
            {formatNaira(totalExpenses, c)}
          </div>
          <CardDescription>All recorded costs</CardDescription>
        </CardContent>
      </Card>

      <Card
        className={cn(" ", isProfit ? "border-green-200" : "border-red-200")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Net Profit</CardTitle>
          <Wallet
            className={cn(
              "h-4 w-4",
              isProfit ? "text-green-600" : "text-red-500",
            )}
          />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              isProfit ? "text-green-700" : "text-red-700",
            )}>
            {formatNaira(Math.abs(netProfit), c)}
          </div>
          <CardDescription className="flex items-center mt-1">
            {isProfit ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            Revenue minus expenses
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
