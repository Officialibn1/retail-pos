import { SaleWithDetails } from "./services/sale.service";
import { formatNaira } from "./utils";

/**
 * Convert sales data to CSV format
 */
export function exportSalesToCSV(sales: SaleWithDetails[]): string {
	// CSV headers
	const headers = [
		"Sale ID",
		"Date",
		"Time",
		"Status",
		"Payment Method",
		"Customer Name",
		"Customer Phone",
		"Cashier",
		"Items Count",
		"Subtotal",
		"Tax",
		"Discount",
		"Total",
		"Amount Paid",
		"Change Given",
	];

	// Convert sales to CSV rows
	const rows = sales.map((sale) => {
		const date = new Date(sale.createdAt);
		return [
			sale.id.slice(0, 8).toUpperCase(),
			date.toLocaleDateString(),
			date.toLocaleTimeString(),
			sale.status,
			sale.paymentMethod || "N/A",
			sale.customer?.name || "Walk-in",
			sale.customer?.phone || "N/A",
			sale.user?.name || "Unknown",
			sale.items?.length || 0,
			Number(sale.subTotal).toFixed(2),
			sale.taxAmount ? Number(sale.taxAmount).toFixed(2) : "0.00",
			sale.discountAmount ? Number(sale.discountAmount).toFixed(2) : "0.00",
			Number(sale.total).toFixed(2),
			sale.amountPaid ? Number(sale.amountPaid).toFixed(2) : "0.00",
			sale.changeGiven ? Number(sale.changeGiven).toFixed(2) : "0.00",
		];
	});

	// Combine headers and rows
	const csvContent = [
		headers.join(","),
		...rows.map((row) =>
			row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
		),
	].join("\n");

	return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Export sales to CSV and trigger download
 */
export function exportSales(sales: SaleWithDetails[]): void {
	const csvContent = exportSalesToCSV(sales);
	const timestamp = new Date().toISOString().split("T")[0];
	const filename = `sales-export-${timestamp}.csv`;

	downloadCSV(csvContent, filename);
}
