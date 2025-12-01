import { calculateChange, formatChange, quickFillAmount } from "../payment";
import * as fc from "fast-check";

/**
 * Unit Tests for Change Calculation
 * Tests change calculation with various inputs (underpayment, exact, overpayment)
 * **Validates: Requirements 4.3, 4.4, 4.5**
 */

describe("calculateChange", () => {
	/**
	 * Test: Exact payment (change = 0)
	 * **Validates: Requirement 4.5**
	 */
	it("should return zero when amount paid equals order total", () => {
		const total = 100.0;
		const amountPaid = 100.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBe(0);
	});

	/**
	 * Test: Overpayment (positive change)
	 * **Validates: Requirement 4.5**
	 */
	it("should return positive change when amount paid exceeds order total", () => {
		const total = 100.0;
		const amountPaid = 150.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBe(50.0);
	});

	/**
	 * Test: Underpayment (negative change)
	 * **Validates: Requirement 4.4**
	 */
	it("should return negative change when amount paid is less than order total", () => {
		const total = 100.0;
		const amountPaid = 80.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBe(-20.0);
	});

	/**
	 * Test: Small overpayment with decimal precision
	 * **Validates: Requirement 4.3, 4.5**
	 */
	it("should handle decimal amounts correctly for small overpayment", () => {
		const total = 247.5;
		const amountPaid = 250.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBeCloseTo(2.5, 2);
	});

	/**
	 * Test: Small underpayment with decimal precision
	 * **Validates: Requirement 4.3, 4.4**
	 */
	it("should handle decimal amounts correctly for small underpayment", () => {
		const total = 247.5;
		const amountPaid = 245.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBeCloseTo(-2.5, 2);
	});

	/**
	 * Test: Large overpayment
	 * **Validates: Requirement 4.5**
	 */
	it("should handle large overpayment amounts", () => {
		const total = 50.0;
		const amountPaid = 1000.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBe(950.0);
	});

	/**
	 * Test: Zero total (edge case)
	 * **Validates: Requirement 4.3**
	 */
	it("should handle zero total correctly", () => {
		const total = 0.0;
		const amountPaid = 100.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBe(100.0);
	});

	/**
	 * Test: Zero amount paid (edge case)
	 * **Validates: Requirement 4.4**
	 */
	it("should handle zero amount paid correctly", () => {
		const total = 100.0;
		const amountPaid = 0.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBe(-100.0);
	});

	/**
	 * Test: Floating point precision
	 * **Validates: Requirement 4.3**
	 */
	it("should handle floating point arithmetic correctly", () => {
		const total = 99.99;
		const amountPaid = 100.0;
		const change = calculateChange(amountPaid, total);
		expect(change).toBeCloseTo(0.01, 2);
	});
});

describe("formatChange", () => {
	/**
	 * Test: Format positive change
	 */
	it("should format positive change with currency symbol", () => {
		const change = 50.0;
		const formatted = formatChange(change);
		expect(formatted).toBe("₦50.00");
	});

	/**
	 * Test: Format negative change
	 */
	it("should format negative change with minus sign and currency symbol", () => {
		const change = -20.0;
		const formatted = formatChange(change);
		expect(formatted).toBe("-₦20.00");
	});

	/**
	 * Test: Format zero change
	 */
	it("should format zero change correctly", () => {
		const change = 0.0;
		const formatted = formatChange(change);
		expect(formatted).toBe("₦0.00");
	});

	/**
	 * Test: Format decimal change
	 */
	it("should format decimal change with two decimal places", () => {
		const change = 2.5;
		const formatted = formatChange(change);
		expect(formatted).toBe("₦2.50");
	});
});

/**
 * Property-Based Tests for Change Calculation
 * **Feature: enhanced-checkout-flow, Property 8: Change calculation correctness**
 * **Validates: Requirements 4.3, 4.4, 4.5**
 */
describe("calculateChange - Property-Based Tests", () => {
	/**
	 * Property 8: Change calculation correctness
	 * For any order total and amount paid, the change given should equal
	 * the difference (amountPaid - total), which may be negative, zero, or positive.
	 * **Feature: enhanced-checkout-flow, Property 8: Change calculation correctness**
	 * **Validates: Requirements 4.3, 4.4, 4.5**
	 */
	it("should always calculate change as amountPaid - total for any valid inputs", () => {
		fc.assert(
			fc.property(
				// Generate valid monetary amounts (0 to 999999.99 with up to 2 decimal places)
				fc.double({ min: 0, max: 999999.99, noNaN: true }),
				fc.double({ min: 0, max: 999999.99, noNaN: true }),
				(total, amountPaid) => {
					// Round to 2 decimal places to match currency precision
					const roundedTotal = Math.round(total * 100) / 100;
					const roundedAmountPaid = Math.round(amountPaid * 100) / 100;

					const change = calculateChange(roundedAmountPaid, roundedTotal);
					const expectedChange = roundedAmountPaid - roundedTotal;

					// Allow for small floating point precision errors
					expect(Math.abs(change - expectedChange)).toBeLessThan(0.01);
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property: Change is negative when underpaid
	 * For any order total and amount paid where amountPaid < total,
	 * the change should be negative.
	 * **Validates: Requirement 4.4**
	 */
	it("should return negative change when amount paid is less than total", () => {
		fc.assert(
			fc.property(
				fc.double({ min: 1, max: 999999.99, noNaN: true }),
				fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
				(total, ratio) => {
					// Ensure amountPaid < total by using a ratio less than 1
					const roundedTotal = Math.round(total * 100) / 100;
					const amountPaid = Math.round(roundedTotal * ratio * 100) / 100;

					// Skip if they end up equal due to rounding
					if (amountPaid >= roundedTotal) return;

					const change = calculateChange(amountPaid, roundedTotal);
					expect(change).toBeLessThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property: Change is zero when exact payment
	 * For any order total, when amountPaid equals total,
	 * the change should be zero.
	 * **Validates: Requirement 4.5**
	 */
	it("should return zero change when amount paid equals total", () => {
		fc.assert(
			fc.property(
				fc.double({ min: 0, max: 999999.99, noNaN: true }),
				(total) => {
					const roundedTotal = Math.round(total * 100) / 100;
					const change = calculateChange(roundedTotal, roundedTotal);
					expect(change).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property: Change is positive when overpaid
	 * For any order total and amount paid where amountPaid > total,
	 * the change should be positive.
	 * **Validates: Requirement 4.5**
	 */
	it("should return positive change when amount paid exceeds total", () => {
		fc.assert(
			fc.property(
				fc.double({ min: 0.01, max: 999999.99, noNaN: true }),
				fc.double({ min: 1.01, max: 2, noNaN: true }),
				(total, ratio) => {
					// Ensure amountPaid > total by using a ratio greater than 1
					const roundedTotal = Math.round(total * 100) / 100;
					const amountPaid = Math.round(roundedTotal * ratio * 100) / 100;

					// Skip if they end up equal due to rounding
					if (amountPaid <= roundedTotal) return;

					const change = calculateChange(amountPaid, roundedTotal);
					expect(change).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

/**
 * Property-Based Tests for Quick-Fill Functionality
 * **Feature: enhanced-checkout-flow, Property 10: Quick-fill idempotence**
 * **Validates: Requirements 5.5**
 */
describe("quickFillAmount - Property-Based Tests", () => {
	/**
	 * Property 10: Quick-fill idempotence
	 * For any order total, clicking the quick-fill button multiple times should
	 * consistently set the amount paid to the same value (the order total).
	 * **Feature: enhanced-checkout-flow, Property 10: Quick-fill idempotence**
	 * **Validates: Requirements 5.5**
	 */
	it("should consistently return the same value when called multiple times with the same total", () => {
		fc.assert(
			fc.property(
				// Generate valid monetary amounts (0 to 999999.99 with up to 2 decimal places)
				fc.double({ min: 0, max: 999999.99, noNaN: true }),
				fc.integer({ min: 2, max: 10 }), // Number of times to call quick-fill
				(total, numCalls) => {
					// Round to 2 decimal places to match currency precision
					const roundedTotal = Math.round(total * 100) / 100;

					// Call quick-fill multiple times
					const results: number[] = [];
					for (let i = 0; i < numCalls; i++) {
						results.push(quickFillAmount(roundedTotal));
					}

					// All results should be identical
					const firstResult = results[0];
					for (const result of results) {
						expect(result).toBe(firstResult);
					}

					// All results should equal the total
					for (const result of results) {
						expect(result).toBe(roundedTotal);
					}
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property: Quick-fill always returns exact total
	 * For any order total, quick-fill should return exactly that total.
	 * **Validates: Requirements 5.2**
	 */
	it("should always return the exact order total", () => {
		fc.assert(
			fc.property(
				fc.double({ min: 0, max: 999999.99, noNaN: true }),
				(total) => {
					const roundedTotal = Math.round(total * 100) / 100;
					const result = quickFillAmount(roundedTotal);
					expect(result).toBe(roundedTotal);
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property: Quick-fill with zero change
	 * For any order total, when quick-fill is used, the change should be zero.
	 * **Validates: Requirements 5.3**
	 */
	it("should result in zero change when used with calculateChange", () => {
		fc.assert(
			fc.property(
				fc.double({ min: 0, max: 999999.99, noNaN: true }),
				(total) => {
					const roundedTotal = Math.round(total * 100) / 100;
					const amountPaid = quickFillAmount(roundedTotal);
					const change = calculateChange(amountPaid, roundedTotal);
					expect(change).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});
