import { prisma } from "@/lib/prisma";
import { Sale, SaleStatus, UserRole } from "@/generated/prisma/client";
import {
	CreateSaleInput,
	CompleteSaleInput,
	CreateReturnInput,
} from "@/lib/validations/sale.schema";
import { sendPurchaseReceiptEmail, sendLowStockAlertEmail } from "@/lib/email";
import { getStoreSettings } from "@/lib/services/store-settings.service";

/**
 * Sale with items, customer information, and returns
 */
export type SaleWithDetails = Sale & {
	items: Array<{
		id: string;
		quantity: number;
		price: number;
		note: string | null;
		inventoryItem: {
			id: string;
			name: string;
			sku: string;
		};
	}>;
	customer: {
		id: string;
		name: string | null;
		phone: string;
		email: string | null;
	} | null;
	user: {
		id: string;
		name: string;
		email: string;
	};
	returns: Array<{
		id: string;
		reason: string;
		refundAmount: number;
		refundMethod: string;
		createdAt: Date;
		processedBy: {
			id: string;
			name: string;
		};
		items: Array<{
			id: string;
			quantity: number;
			price: number;
			inventoryItem: {
				id: string;
				name: string;
				sku: string;
			};
		}>;
	}>;
};

/**
 * Create a new sale with stock validation
 * @param data - Sale creation data
 * @returns Created sale with PENDING status
 * @throws Error if inventory is insufficient
 */
export async function createSale(data: CreateSaleInput): Promise<Sale> {
	const { taxRate } = await getStoreSettings();

	// Use transaction to ensure atomicity with increased timeout
	const result = await prisma.$transaction(
		async (tx) => {
			// Fetch all inventory items in a single query
			const inventoryItemIds = data.items.map((item) => item.inventoryItemId);
			const inventoryItems = await tx.inventoryItem.findMany({
				where: {
					id: { in: inventoryItemIds },
					deletedAt: null,
				},
			});

			// Create a map for quick lookup
			const inventoryMap = new Map(
				inventoryItems.map((item) => [item.id, item]),
			);

			// Validate inventory availability for all items
			for (const item of data.items) {
				const inventoryItem = inventoryMap.get(item.inventoryItemId);

				if (!inventoryItem) {
					throw new Error(
						`Inventory item ${item.inventoryItemId} not found or deleted`,
					);
				}

				if (inventoryItem.stock < item.quantity) {
					throw new Error(
						`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.stock}, Requested: ${item.quantity}`,
					);
				}
			}

			// Calculate total
			const subtotal = data.items.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0,
			);
			const discountAmount = (subtotal * data.discountRate) / 100;
			const taxAmount = (subtotal - discountAmount) * Number(taxRate);
			const total = subtotal - discountAmount + taxAmount;

			// Batch update inventory stock and create stock movements
			await Promise.all(
				data.items.map(async (item) => {
					// Update inventory stock
					await tx.inventoryItem.update({
						where: { id: item.inventoryItemId },
						data: {
							stock: {
								decrement: item.quantity,
							},
						},
					});

					// Create stock movement record
					await tx.stockMovement.create({
						data: {
							inventoryItemId: item.inventoryItemId,
							quantity: -item.quantity,
							reason: "SALE_PENDING",
							notes: `Pending Sale - Reserved stock`,
						},
					});
				}),
			);

			// Create sale with PENDING status
			const sale = await tx.sale.create({
				data: {
					userId: data.userId,
					customerId: data.customerId,
					total,
					subTotal: subtotal,
					taxAmount,
					discountAmount,
					status: SaleStatus.PENDING,
					items: {
						create: data.items.map((item) => ({
							inventoryItemId: item.inventoryItemId,
							quantity: item.quantity,
							price: item.price,
							note: item.note ?? null,
						})),
					},
				},
			});

			return sale;
		},
		{
			maxWait: 10000, // 10 seconds
			timeout: 15000, // 15 seconds
		},
	);

	return result;
}

/**
 * Get sale by ID with items and customer
 * @param id - Sale ID
 * @param userId - Optional user ID for role-based filtering
 * @param userRoles - User roles for access control
 * @returns Sale with details or null if not found or access denied
 */
export async function getSaleById(
	id: string,
	userId?: string,
	userRoles?: UserRole[],
): Promise<SaleWithDetails | null> {
	// Build where clause based on role
	const whereClause: any = { id };

	// Only SUPERADMIN and MANAGER can see all sales
	// ADMIN and CASHIER can only see their own sales
	if (
		userId &&
		userRoles &&
		!userRoles.includes(UserRole.SUPERADMIN) &&
		!userRoles.includes(UserRole.MANAGER)
	) {
		whereClause.userId = userId;
	}

	const sale = await prisma.sale.findFirst({
		where: whereClause,
		include: {
			items: {
				include: {
					inventoryItem: {
						select: {
							id: true,
							name: true,
							sku: true,
						},
					},
				},
			},
			customer: {
				select: {
					id: true,
					name: true,
					phone: true,
					email: true,
				},
			},
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			returns: {
				include: {
					items: {
						include: {
							inventoryItem: {
								select: { id: true, name: true, sku: true },
							},
						},
					},
					processedBy: {
						select: { id: true, name: true },
					},
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	return sale;
}

/**
 * Complete a sale with stock reduction
 * @param id - Sale ID
 * @param paymentData - Payment information
 * @returns Completed sale
 * @throws Error if sale not found or not in PENDING status
 */
export async function completeSale(
	id: string,
	paymentData: CompleteSaleInput,
): Promise<SaleWithDetails> {
	// Use transaction to ensure atomicity
	const result = await prisma.$transaction(async (tx) => {
		// Get sale with items
		const sale = await tx.sale.findUnique({
			where: { id },
			include: {
				items: true,
			},
		});

		if (!sale) {
			throw new Error("Sale not found");
		}

		if (sale.status !== SaleStatus.PENDING) {
			throw new Error(`Cannot complete sale with status ${sale.status}`);
		}

		// Update stock movement records to reflect completion (stock already deducted)
		for (const item of sale.items) {
			// Create stock movement record for completion
			await tx.stockMovement.create({
				data: {
					inventoryItemId: item.inventoryItemId,
					quantity: 0, // No quantity change, just status update
					reason: "SALE",
					notes: `Sale ID: ${id} - Completed`,
				},
			});
		}

		// Default amountPaid to sale.total if not provided (Requirements 6.1, 6.4)
		const amountPaid =
			paymentData.amountPaid !== undefined
				? paymentData.amountPaid
				: Number(sale.total);

		// Calculate change (handles negative, zero, and positive cases - Requirements 4.3, 4.4, 4.5, 6.2)
		const changeGiven = amountPaid - Number(sale.total);

		// Update sale status to COMPLETED
		const completedSale = await tx.sale.update({
			where: { id },
			data: {
				status: SaleStatus.COMPLETED,
				paymentMethod: paymentData.paymentMethod,
				amountPaid,
				changeGiven,
				completedAt: new Date(),
			},
			include: {
				items: {
					include: {
						inventoryItem: {
							select: {
								id: true,
								name: true,
								sku: true,
							},
						},
					},
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				customer: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				returns: {
					include: {
						items: {
							include: {
								inventoryItem: {
									select: { id: true, name: true, sku: true },
								},
							},
						},
						processedBy: {
							select: { id: true, name: true },
						},
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});

		return completedSale;
	});

	// Send purchase receipt email if customer has email
	if (result.customer?.email) {
		try {
			await sendPurchaseReceiptEmail(result.customer.email, {
				customerName: result.customer.name || "Valued Customer",
				saleId: result.id,
				items: result.items.map((item) => ({
					name: item.inventoryItem.name,
					quantity: item.quantity,
					price: Number(item.price),
					total: Number(item.price) * item.quantity,
				})),
				subtotal: Number(result.subTotal),
				discount: Number(result.discountAmount),
				tax: Number(result.taxAmount),
				total: Number(result.total),
				paymentMethod: result.paymentMethod || "N/A",
				date: result.completedAt || new Date(),
			});
		} catch (emailError) {
			console.error("Failed to send purchase receipt email:", emailError);
			// Don't fail the sale completion if email fails
		}
	}

	// Check if any sold items are now at or below their reorder level
	// and send a low-stock alert to all SUPERADMIN and MANAGER users
	try {
		const soldItemIds = result.items.map((i) => i.inventoryItem.id);

		const lowStockItems = await prisma.inventoryItem.findMany({
			where: {
				id: { in: soldItemIds },
				deletedAt: null,
				// stock <= reorderLevel — Prisma doesn't support column comparison,
				// so we fetch all and filter in JS (small set, sold items only)
			},
			select: {
				id: true,
				name: true,
				sku: true,
				stock: true,
				reorderLevel: true,
				category: { select: { name: true } },
			},
		});

		const alertItems = lowStockItems.filter(
			(item) => item.stock <= item.reorderLevel,
		);

		if (alertItems.length > 0) {
			// Fetch all SUPERADMIN and MANAGER emails
			const managers = await prisma.user.findMany({
				where: {
					roles: { hasSome: [UserRole.SUPERADMIN, UserRole.MANAGER] },
					status: "ACTIVE",
				},
				select: { email: true },
			});

			const recipients = managers.map((m) => m.email);

			if (recipients.length > 0) {
				await sendLowStockAlertEmail(recipients, {
					items: alertItems.map((item) => ({
						id: item.id,
						name: item.name,
						sku: item.sku,
						stock: item.stock,
						reorderLevel: item.reorderLevel,
						category: item.category.name,
					})),
				});
			}
		}
	} catch (alertError) {
		console.error("Failed to send low-stock alert email:", alertError);
		// Never block sale completion due to alert failure
	}

	return result;
}

/**
 * Cancel a sale with stock restoration
 * @param id - Sale ID
 * @returns Cancelled sale
 * @throws Error if sale not found or already cancelled
 */
export async function cancelSale(id: string): Promise<Sale> {
	// Use transaction to ensure atomicity
	const result = await prisma.$transaction(async (tx) => {
		// Get sale with items
		const sale = await tx.sale.findUnique({
			where: { id },
			include: {
				items: true,
			},
		});

		if (!sale) {
			throw new Error("Sale not found");
		}

		if (sale.status === SaleStatus.CANCELLED) {
			throw new Error("Sale is already cancelled");
		}

		// Restore stock for both PENDING and COMPLETED sales
		if (
			sale.status === SaleStatus.PENDING ||
			sale.status === SaleStatus.COMPLETED
		) {
			// Restore inventory stock for all items and create stock movements
			for (const item of sale.items) {
				// Update inventory stock
				await tx.inventoryItem.update({
					where: { id: item.inventoryItemId },
					data: {
						stock: {
							increment: item.quantity,
						},
					},
				});

				// Create stock movement record
				await tx.stockMovement.create({
					data: {
						inventoryItemId: item.inventoryItemId,
						quantity: item.quantity,
						reason: "SALE_CANCELLED",
						notes: `Sale ID: ${id} - ${sale.status} sale cancelled`,
					},
				});
			}
		}

		// Update sale status to CANCELLED
		const cancelledSale = await tx.sale.update({
			where: { id },
			data: {
				status: SaleStatus.CANCELLED,
				cancelledAt: new Date(),
			},
			include: {
				items: {
					include: {
						inventoryItem: {
							select: {
								id: true,
								name: true,
								sku: true,
							},
						},
					},
				},
				user: true,
			},
		});

		return cancelledSale;
	});

	return result;
}

/**
 * Sale return with items and processing user
 */
export type SaleReturnWithDetails = {
	id: string;
	saleId: string;
	reason: string;
	refundAmount: number;
	refundMethod: string;
	createdAt: Date;
	processedById: string;
	items: Array<{
		id: string;
		quantity: number;
		price: number;
		inventoryItem: {
			id: string;
			name: string;
			sku: string;
		};
	}>;
	processedBy: {
		id: string;
		name: string;
		email: string;
	};
};

/**
 * Process a return for a completed sale
 * Restocks returned items and creates a SaleReturn record
 * @param saleId - Original sale ID
 * @param data - Return data with items, reason, and refund method
 * @param processedById - ID of the user processing the return
 * @returns Created SaleReturn with details
 * @throws Error if sale not found, not COMPLETED, or items invalid
 */
export async function createReturn(
	saleId: string,
	data: CreateReturnInput,
	processedById: string,
): Promise<SaleReturnWithDetails> {
	const result = await prisma.$transaction(
		async (tx) => {
			// Fetch the original sale with its items
			const sale = await tx.sale.findUnique({
				where: { id: saleId },
				include: {
					items: {
						include: {
							inventoryItem: {
								select: { id: true, name: true, sku: true },
							},
						},
					},
				},
			});

			if (!sale) {
				throw new Error("Sale not found");
			}

			if (sale.status !== SaleStatus.COMPLETED) {
				throw new Error(
					`Cannot process return for a sale with status ${sale.status}. Only COMPLETED sales can be returned.`,
				);
			}

			// Build a map of original sale items keyed by inventoryItemId
			const saleItemMap = new Map(
				sale.items.map((item) => [item.inventoryItemId, item]),
			);

			// Validate each return item
			let refundAmount = 0;
			for (const returnItem of data.items) {
				const originalItem = saleItemMap.get(returnItem.inventoryItemId);

				if (!originalItem) {
					throw new Error(
						`Item ${returnItem.inventoryItemId} was not part of the original sale`,
					);
				}

				if (returnItem.quantity > originalItem.quantity) {
					throw new Error(
						`Cannot return ${returnItem.quantity} of "${originalItem.inventoryItem.name}" — only ${originalItem.quantity} was purchased`,
					);
				}

				refundAmount += Number(originalItem.price) * returnItem.quantity;
			}

			// Restock items and create stock movement records
			await Promise.all(
				data.items.map(async (returnItem) => {
					const originalItem = saleItemMap.get(returnItem.inventoryItemId)!;

					await tx.inventoryItem.update({
						where: { id: returnItem.inventoryItemId },
						data: { stock: { increment: returnItem.quantity } },
					});

					await tx.stockMovement.create({
						data: {
							inventoryItemId: returnItem.inventoryItemId,
							quantity: returnItem.quantity,
							reason: "RETURN",
							notes: `Return for Sale ID: ${saleId} — ${returnItem.quantity} x ${originalItem.inventoryItem.name}`,
						},
					});
				}),
			);

			// Create the SaleReturn record with its items
			const saleReturn = await tx.saleReturn.create({
				data: {
					saleId,
					reason: data.reason,
					refundAmount,
					refundMethod: data.refundMethod,
					processedById,
					items: {
						create: data.items.map((returnItem) => {
							const originalItem = saleItemMap.get(returnItem.inventoryItemId)!;
							return {
								inventoryItemId: returnItem.inventoryItemId,
								quantity: returnItem.quantity,
								price: originalItem.price,
							};
						}),
					},
				},
				include: {
					items: {
						include: {
							inventoryItem: {
								select: { id: true, name: true, sku: true },
							},
						},
					},
					processedBy: {
						select: { id: true, name: true, email: true },
					},
				},
			});

			return saleReturn;
		},
		{
			maxWait: 10000,
			timeout: 15000,
		},
	);

	return {
		...result,
		refundAmount: Number(result.refundAmount),
		items: result.items.map((item) => ({
			...item,
			price: Number(item.price),
		})),
	};
}

/**
 * Sales filters for querying
 */
export interface SalesFilters {
	status?: SaleStatus;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

/**
 * List sales with role-based filtering
 * @param userId - User ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @param params - Optional URLSearchParams for search and filter
 * @returns Array of sales with details
 */
export async function listSales(
	userId?: string,
	userRoles?: UserRole[],
	params?: URLSearchParams,
): Promise<SaleWithDetails[]> {
	// Extract search and filter parameters
	const searchTerm = params?.get("searchTerm");
	const statusFilter = params?.get("status");
	const paymentMethodFilter = params?.get("paymentMethod");
	const startDate = params?.get("startDate");
	const endDate = params?.get("endDate");

	// Build where clause based on role
	const whereClause: any = {};

	// Only SUPERADMIN and MANAGER can see all sales
	// ADMIN and CASHIER can only see their own sales
	if (
		userId &&
		userRoles &&
		!userRoles.includes(UserRole.SUPERADMIN) &&
		!userRoles.includes(UserRole.MANAGER)
	) {
		whereClause.userId = userId;
	}

	// Apply search term with OR logic for id, paymentMethod, customer name, and user name
	if (searchTerm) {
		const searchConditions: any[] = [];

		// Search by sale ID (string field - supports contains)
		searchConditions.push({
			id: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});

		// Search by payment method (enum - use exact match)
		const paymentMethodMatch = searchTerm.toUpperCase().replace(/\s+/g, "_");
		const validPaymentMethods = [
			"CASH",
			"CARD",
			"MOBILE_MONEY",
			"BANK_TRANSFER",
		];
		if (validPaymentMethods.includes(paymentMethodMatch)) {
			searchConditions.push({
				paymentMethod: paymentMethodMatch,
			});
		}

		// Search by customer name
		searchConditions.push({
			customer: {
				name: {
					contains: searchTerm,
					mode: "insensitive" as const,
				},
			},
		});

		// Search by user (cashier) name
		searchConditions.push({
			user: {
				name: {
					contains: searchTerm,
					mode: "insensitive" as const,
				},
			},
		});

		// Combine with existing conditions using AND logic
		if (whereClause.OR || whereClause.userId) {
			whereClause.AND = whereClause.AND || [];
			whereClause.AND.push({ OR: searchConditions });
		} else {
			whereClause.OR = searchConditions;
		}
	}

	// Apply status filter with AND logic
	if (statusFilter && statusFilter !== "all") {
		whereClause.status = statusFilter as SaleStatus;
	}

	// Apply payment method filter
	if (paymentMethodFilter && paymentMethodFilter !== "all") {
		whereClause.paymentMethod = paymentMethodFilter;
	}

	// Apply date range filter
	if (startDate || endDate) {
		whereClause.createdAt = {};
		if (startDate) {
			whereClause.createdAt.gte = new Date(startDate);
		}
		if (endDate) {
			// Add one day to include the entire end date
			const endDateTime = new Date(endDate);
			endDateTime.setDate(endDateTime.getDate() + 1);
			whereClause.createdAt.lt = endDateTime;
		}
	}

	const sales = await prisma.sale.findMany({
		where: whereClause,
		include: {
			items: {
				include: {
					inventoryItem: {
						select: {
							id: true,
							name: true,
							sku: true,
						},
					},
				},
			},
			customer: {
				select: {
					id: true,
					name: true,
					phone: true,
					email: true,
				},
			},
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			returns: {
				include: {
					items: {
						include: {
							inventoryItem: {
								select: { id: true, name: true, sku: true },
							},
						},
					},
					processedBy: {
						select: { id: true, name: true },
					},
				},
				orderBy: { createdAt: "desc" },
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return sales;
}
