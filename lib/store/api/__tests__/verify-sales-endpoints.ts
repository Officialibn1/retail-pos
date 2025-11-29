/**
 * Verification test for sales endpoints
 *
 * This test verifies that all sales endpoints are properly defined
 * in the RTK Query API configuration.
 *
 * Requirements: 5.3, 6.1, 10.2
 */

import { api } from "../index";

describe("Sales Endpoints Verification", () => {
	it("should have getSales query endpoint", () => {
		expect(api.endpoints.getSales).toBeDefined();
		expect(api.endpoints.getSales.name).toBe("getSales");
	});

	it("should have getSale query endpoint", () => {
		expect(api.endpoints.getSale).toBeDefined();
		expect(api.endpoints.getSale.name).toBe("getSale");
	});

	it("should have createSale mutation endpoint", () => {
		expect(api.endpoints.createSale).toBeDefined();
		expect(api.endpoints.createSale.name).toBe("createSale");
	});

	it("should have completeSale mutation endpoint", () => {
		expect(api.endpoints.completeSale).toBeDefined();
		expect(api.endpoints.completeSale.name).toBe("completeSale");
	});

	it("should have cancelSale mutation endpoint", () => {
		expect(api.endpoints.cancelSale).toBeDefined();
		expect(api.endpoints.cancelSale.name).toBe("cancelSale");
	});

	it("should export useGetSalesQuery hook", () => {
		const { useGetSalesQuery } = require("../index");
		expect(useGetSalesQuery).toBeDefined();
		expect(typeof useGetSalesQuery).toBe("function");
	});

	it("should export useGetSaleQuery hook", () => {
		const { useGetSaleQuery } = require("../index");
		expect(useGetSaleQuery).toBeDefined();
		expect(typeof useGetSaleQuery).toBe("function");
	});

	it("should export useCreateSaleMutation hook", () => {
		const { useCreateSaleMutation } = require("../index");
		expect(useCreateSaleMutation).toBeDefined();
		expect(typeof useCreateSaleMutation).toBe("function");
	});

	it("should export useCompleteSaleMutation hook", () => {
		const { useCompleteSaleMutation } = require("../index");
		expect(useCompleteSaleMutation).toBeDefined();
		expect(typeof useCompleteSaleMutation).toBe("function");
	});

	it("should export useCancelSaleMutation hook", () => {
		const { useCancelSaleMutation } = require("../index");
		expect(useCancelSaleMutation).toBeDefined();
		expect(typeof useCancelSaleMutation).toBe("function");
	});
});
