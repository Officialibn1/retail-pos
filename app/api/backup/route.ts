import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { requireAuth, requireSuperAdmin } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check SUPERADMIN role
		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Fetch all data from database
		const [
			users,
			customers,
			categories,
			inventoryItems,
			sales,
			saleItems,
			stockMovements,
			activityLogs,
		] = await Promise.all([
			prisma.user.findMany({
				select: {
					id: true,
					email: true,
					username: true,
					name: true,
					roles: true,
					status: true,
					shift: true,
					createdAt: true,
					updatedAt: true,
				},
			}),
			prisma.customer.findMany(),
			prisma.inventoryItemCategory.findMany(),
			prisma.inventoryItem.findMany({
				include: {
					category: true,
				},
			}),
			prisma.sale.findMany({
				include: {
					user: {
						select: {
							name: true,
							username: true,
						},
					},
					customer: {
						select: {
							name: true,
							phone: true,
						},
					},
				},
			}),
			prisma.saleItem.findMany({
				include: {
					inventoryItem: {
						select: {
							name: true,
							sku: true,
						},
					},
				},
			}),
			prisma.stockMovement.findMany({
				include: {
					inventoryItem: {
						select: {
							name: true,
							sku: true,
						},
					},
				},
			}),
			prisma.activityLog.findMany({
				include: {
					user: {
						select: {
							name: true,
							username: true,
						},
					},
				},
			}),
		]);

		// Create workbook
		const workbook = XLSX.utils.book_new();

		// Add Users sheet
		const usersData = users.map((user) => ({
			ID: user.id,
			Email: user.email,
			Username: user.username,
			Name: user.name,
			Roles: user.roles.join(", "),
			Status: user.status,
			Shift: user.shift,
			"Created At": user.createdAt.toISOString(),
			"Updated At": user.updatedAt.toISOString(),
		}));
		const usersSheet = XLSX.utils.json_to_sheet(usersData);
		XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

		// Add Customers sheet
		const customersData = customers.map((customer) => ({
			ID: customer.id,
			Name: customer.name || "",
			Phone: customer.phone,
			Email: customer.email || "",
			"Created At": customer.createdAt.toISOString(),
			"Updated At": customer.updatedAt.toISOString(),
		}));
		const customersSheet = XLSX.utils.json_to_sheet(customersData);
		XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");

		// Add Categories sheet
		const categoriesData = categories.map((category) => ({
			ID: category.id,
			Name: category.name,
		}));
		const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
		XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categories");

		// Add Inventory Items sheet
		const inventoryData = inventoryItems.map((item) => ({
			ID: item.id,
			Name: item.name,
			Description: item.description || "",
			Price: Number(item.price),
			Stock: item.stock,
			SKU: item.sku,
			Barcode: item.barcode || "",
			Category: item.category.name,
			"Deleted At": item.deletedAt ? item.deletedAt.toISOString() : "",
			"Created At": item.createdAt.toISOString(),
			"Updated At": item.updatedAt.toISOString(),
		}));
		const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
		XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");

		// Add Sales sheet
		const salesData = sales.map((sale) => ({
			ID: sale.id,
			"Sub Total": Number(sale.subTotal),
			Total: Number(sale.total),
			Status: sale.status,
			"Payment Method": sale.paymentMethod || "",
			"Amount Paid": sale.amountPaid ? Number(sale.amountPaid) : "",
			"Change Given": sale.changeGiven ? Number(sale.changeGiven) : "",
			"Tax Amount": sale.taxAmount || "",
			"Discount Amount": sale.discountAmount || "",
			Cashier: sale.user.name,
			"Cashier Username": sale.user.username,
			"Customer Name": sale.customer?.name || "",
			"Customer Phone": sale.customer?.phone || "",
			"Completed At": sale.completedAt ? sale.completedAt.toISOString() : "",
			"Cancelled At": sale.cancelledAt ? sale.cancelledAt.toISOString() : "",
			"Created At": sale.createdAt.toISOString(),
			"Updated At": sale.updatedAt.toISOString(),
		}));
		const salesSheet = XLSX.utils.json_to_sheet(salesData);
		XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

		// Add Sale Items sheet
		const saleItemsData = saleItems.map((item) => ({
			ID: item.id,
			"Sale ID": item.saleId,
			"Product Name": item.inventoryItem.name,
			SKU: item.inventoryItem.sku,
			Quantity: item.quantity,
			Price: Number(item.price),
			Total: Number(item.price) * item.quantity,
		}));
		const saleItemsSheet = XLSX.utils.json_to_sheet(saleItemsData);
		XLSX.utils.book_append_sheet(workbook, saleItemsSheet, "Sale Items");

		// Add Stock Movements sheet
		const stockMovementsData = stockMovements.map((movement) => ({
			ID: movement.id,
			"Product Name": movement.inventoryItem.name,
			SKU: movement.inventoryItem.sku,
			Quantity: movement.quantity,
			Reason: movement.reason,
			Notes: movement.notes || "",
			"Created At": movement.createdAt.toISOString(),
		}));
		const stockMovementsSheet = XLSX.utils.json_to_sheet(stockMovementsData);
		XLSX.utils.book_append_sheet(
			workbook,
			stockMovementsSheet,
			"Stock Movements",
		);

		// Add Activity Logs sheet
		const activityLogsData = activityLogs.map((log) => ({
			ID: log.id,
			User: log.user.name,
			Username: log.user.username,
			Action: log.action,
			Details: log.details,
			"IP Address": log.ipAddress || "",
			"User Agent": log.userAgent || "",
			"Created At": log.createdAt.toISOString(),
		}));
		const activityLogsSheet = XLSX.utils.json_to_sheet(activityLogsData);
		XLSX.utils.book_append_sheet(workbook, activityLogsSheet, "Activity Logs");

		// Generate Excel file buffer
		const excelBuffer = XLSX.write(workbook, {
			type: "buffer",
			bookType: "xlsx",
		});

		// Create filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `database-backup-${timestamp}.xlsx`;

		// Return the file
		return new NextResponse(excelBuffer, {
			headers: {
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Backup error:", error);
		return NextResponse.json(
			{
				error: {
					message: "Failed to create backup",
					code: "BACKUP_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
