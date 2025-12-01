/**
 * Payment utility functions for the POS system
 */

/**
 * Calculate change given based on amount paid and total
 * @param amountPaid - The amount paid by the customer
 * @param total - The order total
 * @returns The change to be given (can be negative for underpayment, zero for exact, or positive for overpayment)
 */
export function calculateChange(amountPaid: number, total: number): number {
	return amountPaid - total;
}

/**
 * Format change for display
 * @param change - The change amount
 * @returns Formatted change string with currency symbol
 */
export function formatChange(change: number): string {
	const absChange = Math.abs(change);
	const formatted = `₦${absChange.toFixed(2)}`;

	if (change < 0) {
		return `-${formatted}`;
	}
	return formatted;
}

/**
 * Quick-fill function to set amount paid to exact order total
 * @param total - The order total
 * @returns The exact order total (for idempotent behavior)
 */
export function quickFillAmount(total: number): number {
	return total;
}
