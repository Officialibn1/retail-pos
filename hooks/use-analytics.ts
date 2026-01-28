"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
	useGetTopPerformingProductsQuery,
	useGetCategoryRevenueQuery,
	useGetSalesTrendsQuery,
	useGetPaymentBreakdownQuery,
	useGetCashierPerformanceQuery,
	useGetInventoryValueQuery,
	useGetTopCustomersQuery,
	useGetCustomerTrendsQuery,
} from "@/lib/store/api";
import {
	TopProductsParams,
	TopProductsResult,
	CategoryRevenueParams,
	CategoryRevenueResult,
	SalesTrendParams,
	SalesTrendResult,
	PaymentBreakdownParams,
	PaymentBreakdownResult,
	CashierPerformanceParams,
	CashierPerformanceResult,
	InventoryValueResult,
	TopCustomersParams,
	TopCustomersResult,
	CustomerTrendsParams,
	CustomerTrendsResult,
} from "@/lib/types";

// Common analytics hook options
interface AnalyticsHookOptions {
	enabled?: boolean;
	refetchOnMount?: boolean;
	refetchOnWindowFocus?: boolean;
	pollingInterval?: number;
	skip?: boolean;
}

// Enhanced error handling interface
interface AnalyticsError {
	message: string;
	status?: number;
	code?: string;
	retryable: boolean;
}

// Common analytics hook result interface
interface AnalyticsHookResult<T> {
	data: T | undefined;
	isLoading: boolean;
	isError: boolean;
	error: AnalyticsError | null;
	isSuccess: boolean;
	isFetching: boolean;
	refetch: () => void;
	retry: () => void;
}

/**
 * Enhanced error handling for analytics hooks
 */
function parseAnalyticsError(error: any): AnalyticsError {
	if (!error) {
		return {
			message: "Unknown error occurred",
			retryable: true,
		};
	}

	// Handle RTK Query errors
	if ("status" in error) {
		const status = error.status;
		const message =
			error.data?.error?.message || error.data?.message || "Request failed";

		return {
			message,
			status: typeof status === "number" ? status : undefined,
			code: error.data?.error?.code,
			retryable: status !== 401 && status !== 403 && status !== 404,
		};
	}

	// Handle network errors
	if (error.name === "NetworkError" || error.message?.includes("fetch")) {
		return {
			message: "Network error. Please check your connection.",
			retryable: true,
		};
	}

	return {
		message: error.message || "An unexpected error occurred",
		retryable: true,
	};
}

/**
 * Retry logic with exponential backoff
 */
function useRetryLogic(refetch: () => void, maxRetries = 3) {
	const [retryCount, setRetryCount] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);

	const retry = useCallback(async () => {
		if (retryCount >= maxRetries || isRetrying) return;

		setIsRetrying(true);

		// Exponential backoff: 1s, 2s, 4s
		const delay = Math.pow(2, retryCount) * 1000;

		setTimeout(() => {
			setRetryCount((prev) => prev + 1);
			refetch();
			setIsRetrying(false);
		}, delay);
	}, [refetch, retryCount, maxRetries, isRetrying]);

	const resetRetry = useCallback(() => {
		setRetryCount(0);
		setIsRetrying(false);
	}, []);

	return { retry, retryCount, isRetrying, resetRetry };
}

/**
 * Hook for top performing products analytics
 */
export function useTopPerformingProducts(
	params: TopProductsParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<TopProductsResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetTopPerformingProductsQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	// Reset retry count on successful fetch
	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for category revenue analytics
 */
export function useCategoryRevenue(
	params: CategoryRevenueParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<CategoryRevenueResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetCategoryRevenueQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for sales trends analytics
 */
export function useSalesTrends(
	params: SalesTrendParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<SalesTrendResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetSalesTrendsQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for payment method breakdown analytics
 */
export function usePaymentBreakdown(
	params: PaymentBreakdownParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<PaymentBreakdownResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetPaymentBreakdownQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for cashier performance analytics
 */
export function useCashierPerformance(
	params: CashierPerformanceParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<CashierPerformanceResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetCashierPerformanceQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for inventory value analytics
 */
export function useInventoryValue(
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<InventoryValueResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetInventoryValueQuery(undefined, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for top customers analytics
 */
export function useTopCustomers(
	params: TopCustomersParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<TopCustomersResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetTopCustomersQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Hook for customer trends analytics
 */
export function useCustomerTrends(
	params: CustomerTrendsParams,
	options: AnalyticsHookOptions = {},
): AnalyticsHookResult<CustomerTrendsResult> {
	const { user } = useAuth();
	const {
		enabled = true,
		refetchOnMount = true,
		refetchOnWindowFocus = false,
		pollingInterval,
		skip = false,
	} = options;

	const queryResult = useGetCustomerTrendsQuery(params, {
		skip: skip || !enabled || !user,
		refetchOnMountOrArgChange: refetchOnMount,
		refetchOnFocus: refetchOnWindowFocus,
		pollingInterval,
	});

	const { retry, resetRetry } = useRetryLogic(queryResult.refetch);

	useEffect(() => {
		if (queryResult.isSuccess) {
			resetRetry();
		}
	}, [queryResult.isSuccess, resetRetry]);

	const error = useMemo(() => {
		return queryResult.error ? parseAnalyticsError(queryResult.error) : null;
	}, [queryResult.error]);

	return {
		data: queryResult.data,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		retry,
	};
}

/**
 * Composite hook for multiple analytics data with coordinated loading states
 */
export function useAnalyticsDashboard(
	dateRange: { startDate: string; endDate: string },
	options: AnalyticsHookOptions = {},
) {
	const topProducts = useTopPerformingProducts(
		{
			...dateRange,
			sortBy: "revenue",
			limit: 10,
		},
		options,
	);

	const categoryRevenue = useCategoryRevenue(dateRange, options);

	const salesTrends = useSalesTrends(
		{
			...dateRange,
			interval: "daily",
		},
		options,
	);

	const paymentBreakdown = usePaymentBreakdown(dateRange, options);

	const cashierPerformance = useCashierPerformance(dateRange, options);

	const inventoryValue = useInventoryValue(options);

	const topCustomers = useTopCustomers(
		{
			...dateRange,
			sortBy: "revenue",
			limit: 10,
		},
		options,
	);

	const customerTrends = useCustomerTrends(
		{
			...dateRange,
			interval: "month",
		},
		options,
	);

	// Aggregate loading and error states
	const isLoading = [
		topProducts,
		categoryRevenue,
		salesTrends,
		paymentBreakdown,
		cashierPerformance,
		inventoryValue,
		topCustomers,
		customerTrends,
	].some((query) => query.isLoading);

	const isError = [
		topProducts,
		categoryRevenue,
		salesTrends,
		paymentBreakdown,
		cashierPerformance,
		inventoryValue,
		topCustomers,
		customerTrends,
	].some((query) => query.isError);

	const errors = [
		topProducts,
		categoryRevenue,
		salesTrends,
		paymentBreakdown,
		cashierPerformance,
		inventoryValue,
		topCustomers,
		customerTrends,
	]
		.map((query) => query.error)
		.filter(Boolean);

	const refetchAll = useCallback(() => {
		topProducts.refetch();
		categoryRevenue.refetch();
		salesTrends.refetch();
		paymentBreakdown.refetch();
		cashierPerformance.refetch();
		inventoryValue.refetch();
		topCustomers.refetch();
		customerTrends.refetch();
	}, [
		topProducts,
		categoryRevenue,
		salesTrends,
		paymentBreakdown,
		cashierPerformance,
		inventoryValue,
		topCustomers,
		customerTrends,
	]);

	const retryAll = useCallback(() => {
		topProducts.retry();
		categoryRevenue.retry();
		salesTrends.retry();
		paymentBreakdown.retry();
		cashierPerformance.retry();
		inventoryValue.retry();
		topCustomers.retry();
		customerTrends.retry();
	}, [
		topProducts,
		categoryRevenue,
		salesTrends,
		paymentBreakdown,
		cashierPerformance,
		inventoryValue,
		topCustomers,
		customerTrends,
	]);

	return {
		data: {
			topProducts: topProducts.data,
			categoryRevenue: categoryRevenue.data,
			salesTrends: salesTrends.data,
			paymentBreakdown: paymentBreakdown.data,
			cashierPerformance: cashierPerformance.data,
			inventoryValue: inventoryValue.data,
			topCustomers: topCustomers.data,
			customerTrends: customerTrends.data,
		},
		queries: {
			topProducts,
			categoryRevenue,
			salesTrends,
			paymentBreakdown,
			cashierPerformance,
			inventoryValue,
			topCustomers,
			customerTrends,
		},
		isLoading,
		isError,
		errors,
		refetchAll,
		retryAll,
	};
}
// Real-time refresh configuration
interface RefreshConfig {
	enabled: boolean;
	interval: number; // in milliseconds
	onRefresh?: () => void;
	onError?: (error: AnalyticsError) => void;
}

/**
 * Hook for real-time data refresh capabilities
 * Provides manual refresh functionality and automatic refresh options with configurable intervals
 */
export function useRealTimeRefresh(
	refetchFunctions: Array<() => void>,
	config: RefreshConfig = { enabled: false, interval: 30000 },
) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
	const [refreshCount, setRefreshCount] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Manual refresh function
	const manualRefresh = useCallback(async () => {
		if (isRefreshing) return;

		setIsRefreshing(true);
		try {
			// Execute all refetch functions
			await Promise.all(refetchFunctions.map((fn) => fn()));
			setLastRefresh(new Date());
			setRefreshCount((prev) => prev + 1);
			config.onRefresh?.();
		} catch (error) {
			const analyticsError = parseAnalyticsError(error);
			config.onError?.(analyticsError);
		} finally {
			setIsRefreshing(false);
		}
	}, [refetchFunctions, isRefreshing, config]);

	// Auto refresh setup
	useEffect(() => {
		if (config.enabled && config.interval > 0) {
			intervalRef.current = setInterval(() => {
				manualRefresh();
			}, config.interval);

			return () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
			};
		}
	}, [config.enabled, config.interval, manualRefresh]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Start/stop auto refresh
	const startAutoRefresh = useCallback(() => {
		if (!intervalRef.current && config.interval > 0) {
			intervalRef.current = setInterval(() => {
				manualRefresh();
			}, config.interval);
		}
	}, [config.interval, manualRefresh]);

	const stopAutoRefresh = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	// Update refresh interval
	const updateInterval = useCallback(
		(newInterval: number) => {
			stopAutoRefresh();
			if (config.enabled && newInterval > 0) {
				intervalRef.current = setInterval(() => {
					manualRefresh();
				}, newInterval);
			}
		},
		[config.enabled, manualRefresh, stopAutoRefresh],
	);

	return {
		// State
		isRefreshing,
		lastRefresh,
		refreshCount,
		isAutoRefreshActive: intervalRef.current !== null,

		// Actions
		manualRefresh,
		startAutoRefresh,
		stopAutoRefresh,
		updateInterval,

		// Utilities
		getTimeSinceLastRefresh: () => {
			if (!lastRefresh) return null;
			return Date.now() - lastRefresh.getTime();
		},
		formatLastRefresh: () => {
			if (!lastRefresh) return "Never";
			return lastRefresh.toLocaleTimeString();
		},
	};
}

/**
 * Enhanced analytics dashboard hook with real-time refresh capabilities
 */
export function useAnalyticsDashboardWithRefresh(
	dateRange: { startDate: string; endDate: string },
	refreshConfig: RefreshConfig = { enabled: false, interval: 30000 },
	options: AnalyticsHookOptions = {},
) {
	const dashboard = useAnalyticsDashboard(dateRange, options);

	// Real-time refresh setup
	const refresh = useRealTimeRefresh([dashboard.refetchAll], refreshConfig);

	// Enhanced refresh function that includes retry logic
	const smartRefresh = useCallback(async () => {
		if (dashboard.isError) {
			// If there are errors, try retry instead of refetch
			dashboard.retryAll();
		} else {
			// Normal refresh
			await refresh.manualRefresh();
		}
	}, [dashboard.isError, dashboard.retryAll, refresh.manualRefresh]);

	return {
		...dashboard,
		refresh: {
			...refresh,
			smartRefresh,
		},
	};
}

/**
 * Preset refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
	NEVER: 0,
	EVERY_10_SECONDS: 10 * 1000,
	EVERY_30_SECONDS: 30 * 1000,
	EVERY_MINUTE: 60 * 1000,
	EVERY_5_MINUTES: 5 * 60 * 1000,
	EVERY_15_MINUTES: 15 * 60 * 1000,
	EVERY_30_MINUTES: 30 * 60 * 1000,
	EVERY_HOUR: 60 * 60 * 1000,
} as const;

/**
 * Hook for managing refresh preferences with localStorage persistence
 */
export function useRefreshPreferences(key = "analytics-refresh-preferences") {
	const [preferences, setPreferences] = useState<{
		enabled: boolean;
		interval: number;
	}>(() => {
		if (typeof window === "undefined") {
			return { enabled: false, interval: REFRESH_INTERVALS.EVERY_30_SECONDS };
		}

		try {
			const stored = localStorage.getItem(key);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.warn("Failed to load refresh preferences:", error);
		}

		return { enabled: false, interval: REFRESH_INTERVALS.EVERY_30_SECONDS };
	});

	const updatePreferences = useCallback(
		(updates: Partial<typeof preferences>) => {
			setPreferences((prev) => {
				const newPreferences = { ...prev, ...updates };

				try {
					localStorage.setItem(key, JSON.stringify(newPreferences));
				} catch (error) {
					console.warn("Failed to save refresh preferences:", error);
				}

				return newPreferences;
			});
		},
		[key],
	);

	const enableAutoRefresh = useCallback(
		(interval?: number) => {
			updatePreferences({
				enabled: true,
				interval: interval ?? preferences.interval,
			});
		},
		[updatePreferences, preferences.interval],
	);

	const disableAutoRefresh = useCallback(() => {
		updatePreferences({ enabled: false });
	}, [updatePreferences]);

	const setRefreshInterval = useCallback(
		(interval: number) => {
			updatePreferences({ interval });
		},
		[updatePreferences],
	);

	return {
		preferences,
		updatePreferences,
		enableAutoRefresh,
		disableAutoRefresh,
		setRefreshInterval,
	};
}
