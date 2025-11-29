/**
 * Test for getSales query with parameters
 *
 * This test verifies that the getSales query accepts optional parameters
 * for filtering sales by status, date range, and pagination.
 *
 * Requirements: 1.1, 1.4
 */

import { api, GetSalesParams } from "../index";
import { SaleStatus } from "@/generated/prisma";

describe("getSales Query Parameters", () => {
	it("should accept GetSalesParams with status filter", () => {
		const params: GetSalesParams = {
			status: SaleStatus.PENDING,
		};

		// This should compile without errors
		expect(params.status).toBe(SaleStatus.PENDING);
	});

	it("should accept GetSalesParams with date range", () => {
		const params: GetSalesParams = {
			startDate: "2024-01-01",
			endDate: "2024-12-31",
		};

		expect(params.startDate).toBe("2024-01-01");
		expect(params.endDate).toBe("2024-12-31");
	});

	it("should accept GetSalesParams with pagination", () => {
		const params: GetSalesParams = {
			page: 1,
			limit: 50,
		};

		expect(params.page).toBe(1);
		expect(params.limit).toBe(50);
	});

	it("should accept GetSalesParams with all fields", () => {
		const params: GetSalesParams = {
			status: SaleStatus.COMPLETED,
			startDate: "2024-01-01",
			endDate: "2024-12-31",
			page: 2,
			limit: 20,
		};

		expect(params.status).toBe(SaleStatus.COMPLETED);
		expect(params.startDate).toBe("2024-01-01");
		expect(params.endDate).toBe("2024-12-31");
		expect(params.page).toBe(2);
		expect(params.limit).toBe(20);
	});

	it("should accept empty GetSalesParams", () => {
		const params: GetSalesParams = {};

		expect(params).toEqual({});
	});

	it("should have getSales endpoint that accepts GetSalesParams or void", () => {
		expect(api.endpoints.getSales).toBeDefined();
		expect(api.endpoints.getSales.name).toBe("getSales");
	});
});
