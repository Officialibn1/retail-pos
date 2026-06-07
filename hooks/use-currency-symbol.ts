"use client";

import { useGetStoreSettingsQuery } from "@/lib/store/api";

/**
 * Returns the store's configured currency symbol (e.g. "₦").
 * Falls back to "₦" while the settings are loading.
 */
export function useCurrencySymbol(): string {
	const { data, isLoading } = useGetStoreSettingsQuery();
	return isLoading ? "" : data?.settings?.currencySymbol ?? "₦";
}
