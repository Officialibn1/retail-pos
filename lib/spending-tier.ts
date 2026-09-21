export type SpendingTier = "Bronze" | "Silver" | "Gold";

export interface TierInfo {
	tier: SpendingTier;
	label: string;
	className: string;
	nextTierThreshold: number | null;
}

/**
 * Compute spending tier from total completed-sales spend.
 * Bronze: < 50,000 | Silver: 50,000–199,999 | Gold: ≥ 200,000
 */
export function getSpendingTier(totalSpend: number): TierInfo {
	if (totalSpend >= 200_000) {
		return {
			tier: "Gold",
			label: "🥇 Gold",
			className: "bg-yellow-100 text-yellow-800 border-yellow-300",
			nextTierThreshold: null,
		};
	}
	if (totalSpend >= 50_000) {
		return {
			tier: "Silver",
			label: "🥈 Silver",
			className: "bg-slate-100 text-slate-700 border-slate-300",
			nextTierThreshold: 200_000,
		};
	}
	return {
		tier: "Bronze",
		label: "🥉 Bronze",
		className: "bg-amber-50 text-amber-800 border-amber-300",
		nextTierThreshold: 50_000,
	};
}
