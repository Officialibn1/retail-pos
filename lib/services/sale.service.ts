import { prisma } from "@/lib/prisma";
import { Sale, SaleStatus, UserRole } from "@/generated/prisma/client";
import {
	CreateSaleInput,
	CompleteSaleInput,
} from "@/lib/validations/sale.schema";

/**
 * Sale with items and customer information
 */
export type SaleWithDetails = Sale & {
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
};

const taxRate = Number(
	process.env.TAX_AMOUNT || process.env.NEXT_PUBLIC_TAX_AMOUNT || "0.1",
);

/**
 * Create a new sale with stock validation
 * @param data - Sale creation data
 * @returns Created sale with PENDING status
 * @throws Error if inventory is insufficient
 */
export async function createSale(data: CreateSaleInput): Promise<Sale> {
	// Use transaction to ensure atomicity

	const result = await prisma.$transaction(async (tx) => {
		// Validate inventory availability for all items
		for (const item of data.items) {
			const inventoryItem = await tx.inventoryItem.findFirst({
				where: {
					id: item.inventoryItemId,
					deletedAt: null,
				},
			});

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

		// Deduct inventory stock for all items and create stock movements
		for (const item of data.items) {
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
		}

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
					})),
				},
			},
		});

		return sale;
	});

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

	// CASHIER can only see their own sales
	if (
		userId &&
		userRoles &&
		userRoles.includes(UserRole.CASHIER) &&
		!userRoles.includes(UserRole.MANAGER) &&
		!userRoles.includes(UserRole.ADMIN) &&
		!userRoles.includes(UserRole.SUPERADMIN)
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
			},
		});

		return completedSale;
	});

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

	// Build where clause based on role
	const whereClause: any = {};

	// CASHIER can only see their own sales
	if (
		userId &&
		userRoles &&
		userRoles.includes(UserRole.CASHIER) &&
		!userRoles.includes(UserRole.MANAGER) &&
		!userRoles.includes(UserRole.ADMIN) &&
		!userRoles.includes(UserRole.SUPERADMIN)
	) {
		whereClause.userId = userId;
	}

	// Apply search term with OR logic for id and paymentMethod
	if (searchTerm) {
		const searchConditions: any[] = [];

		searchConditions.push({
			id: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});

		searchConditions.push({
			paymentMethod: {
				contains: searchTerm,
				mode: "insensitive" as const,
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
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return sales;
}
