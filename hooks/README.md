# Analytics Hooks

This directory contains custom React hooks for the advanced analytics dashboard, providing enhanced data fetching capabilities with error handling, retry logic, loading states, and real-time refresh functionality.

## Overview

The analytics hooks are built on top of RTK Query and provide a higher-level interface for fetching analytics data with additional features like:

- **Error Handling**: Enhanced error parsing with retry capabilities
- **Loading States**: Comprehensive loading and fetching state management
- **Caching**: Built-in caching with configurable cache behavior
- **Real-time Refresh**: Manual and automatic refresh capabilities
- **Retry Logic**: Exponential backoff retry mechanism
- **Preferences**: Persistent refresh preferences with localStorage

## Available Hooks

### Individual Analytics Hooks

Each analytics endpoint has its own dedicated hook:

- `useTopPerformingProducts(params, options)` - Top performing products analytics
- `useCategoryRevenue(params, options)` - Category revenue breakdown
- `useSalesTrends(params, options)` - Sales trends with KPIs
- `usePaymentBreakdown(params, options)` - Payment method analysis
- `useCashierPerformance(params, options)` - Cashier performance metrics
- `useInventoryValue(options)` - Inventory value analysis
- `useTopCustomers(params, options)` - Top customers analytics
- `useCustomerTrends(params, options)` - Customer trend analysis

### Composite Hooks

- `useAnalyticsDashboard(dateRange, options)` - Fetches all analytics data with coordinated loading states
- `useAnalyticsDashboardWithRefresh(dateRange, refreshConfig, options)` - Enhanced dashboard with real-time refresh

### Utility Hooks

- `useRealTimeRefresh(refetchFunctions, config)` - Real-time refresh functionality
- `useRefreshPreferences(key)` - Persistent refresh preferences management

## Usage Examples

### Basic Usage

```typescript
import { useTopPerformingProducts } from "@/hooks/use-analytics";

function ProductAnalytics() {
  const { data, isLoading, isError, error, refetch, retry } = useTopPerformingProducts({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    sortBy: "revenue",
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      {data?.products.map(product => (
        <div key={product.productId}>
          {product.productName}: {product.totalRevenue}
        </div>
      ))}
    </div>
  );
}
```

### With Options

```typescript
const { data, isLoading, error } = useTopPerformingProducts(
	{
		startDate: "2024-01-01",
		endDate: "2024-01-31",
		sortBy: "revenue",
		limit: 10,
	},
	{
		enabled: true,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		pollingInterval: 30000, // Refresh every 30 seconds
	},
);
```

### Dashboard with Real-time Refresh

```typescript
import {
  useAnalyticsDashboardWithRefresh,
  useRefreshPreferences,
  REFRESH_INTERVALS
} from "@/hooks/use-analytics";

function AnalyticsDashboard() {
  const refreshPrefs = useRefreshPreferences();

  const dashboard = useAnalyticsDashboardWithRefresh(
    {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    },
    {
      enabled: refreshPrefs.preferences.enabled,
      interval: refreshPrefs.preferences.interval,
      onRefresh: () => console.log("Data refreshed"),
      onError: (error) => console.error("Refresh failed:", error),
    }
  );

  return (
    <div>
      <button onClick={dashboard.refresh.manualRefresh}>
        Refresh Now
      </button>

      <button onClick={() => refreshPrefs.enableAutoRefresh(REFRESH_INTERVALS.EVERY_MINUTE)}>
        Enable Auto Refresh
      </button>

      {dashboard.isLoading && <div>Loading...</div>}

      <div>
        Top Products: {dashboard.data.topProducts?.products.length || 0}
        Category Revenue: {dashboard.data.categoryRevenue?.totalRevenue || 0}
        {/* ... other data */}
      </div>
    </div>
  );
}
```

### Manual Refresh Control

```typescript
import { useRealTimeRefresh, REFRESH_INTERVALS } from "@/hooks/use-analytics";

function RefreshControls() {
  const refresh = useRealTimeRefresh(
    [refetchFunction1, refetchFunction2], // Array of refetch functions
    {
      enabled: true,
      interval: REFRESH_INTERVALS.EVERY_30_SECONDS,
      onRefresh: () => console.log("Refreshed"),
      onError: (error) => console.error("Error:", error),
    }
  );

  return (
    <div>
      <button onClick={refresh.manualRefresh} disabled={refresh.isRefreshing}>
        {refresh.isRefreshing ? "Refreshing..." : "Refresh"}
      </button>

      <button onClick={refresh.startAutoRefresh}>Start Auto Refresh</button>
      <button onClick={refresh.stopAutoRefresh}>Stop Auto Refresh</button>

      <p>Last refresh: {refresh.formatLastRefresh()}</p>
      <p>Refresh count: {refresh.refreshCount}</p>
    </div>
  );
}
```

## Hook Options

### AnalyticsHookOptions

```typescript
interface AnalyticsHookOptions {
	enabled?: boolean; // Enable/disable the query
	refetchOnMount?: boolean; // Refetch when component mounts
	refetchOnWindowFocus?: boolean; // Refetch when window gains focus
	pollingInterval?: number; // Polling interval in milliseconds
	skip?: boolean; // Skip the query entirely
}
```

### RefreshConfig

```typescript
interface RefreshConfig {
	enabled: boolean; // Enable auto refresh
	interval: number; // Refresh interval in milliseconds
	onRefresh?: () => void; // Callback on successful refresh
	onError?: (error: AnalyticsError) => void; // Callback on refresh error
}
```

## Refresh Intervals

Pre-defined refresh intervals are available:

```typescript
import { REFRESH_INTERVALS } from "@/hooks/use-analytics";

REFRESH_INTERVALS.NEVER; // 0
REFRESH_INTERVALS.EVERY_10_SECONDS; // 10000
REFRESH_INTERVALS.EVERY_30_SECONDS; // 30000
REFRESH_INTERVALS.EVERY_MINUTE; // 60000
REFRESH_INTERVALS.EVERY_5_MINUTES; // 300000
REFRESH_INTERVALS.EVERY_15_MINUTES; // 900000
REFRESH_INTERVALS.EVERY_30_MINUTES; // 1800000
REFRESH_INTERVALS.EVERY_HOUR; // 3600000
```

## Error Handling

All hooks provide enhanced error handling:

```typescript
const { error } = useTopPerformingProducts(params);

if (error) {
	console.log(error.message); // Human-readable error message
	console.log(error.status); // HTTP status code (if available)
	console.log(error.code); // Error code (if available)
	console.log(error.retryable); // Whether the error is retryable
}
```

## Best Practices

1. **Use composite hooks** for dashboard views that need multiple analytics data
2. **Enable caching** for data that doesn't change frequently
3. **Set appropriate refresh intervals** based on data freshness requirements
4. **Handle loading and error states** properly in your UI
5. **Use retry logic** for transient errors
6. **Persist user preferences** for refresh settings

## Demo Component

See `components/analytics/analytics-demo.tsx` for a complete example of how to use all the analytics hooks together with real-time refresh capabilities.
