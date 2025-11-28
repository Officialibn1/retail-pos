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
		phone: string | null;
	} | null;
	user: {
		id: string;
		name: string;
		email: string;
	};
};

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
		const total = data.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);

		// Create sale with PENDING status
		const sale = await tx.sale.create({
			data: {
				userId: data.userId,
				customerId: data.customerId,
				total,
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
): Promise<Sale> {
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

		// Reduce inventory stock for all items and create stock movements
		for (const item of sale.items) {
			const inventoryItem = await tx.inventoryItem.findUnique({
				where: { id: item.inventoryItemId },
			});

			if (!inventoryItem) {
				throw new Error(`Inventory item ${item.inventoryItemId} not found`);
			}

			if (inventoryItem.stock < item.quantity) {
				throw new Error(
					`Insufficient stock for item ${inventoryItem.name}. Available: ${inventoryItem.stock}, Required: ${item.quantity}`,
				);
			}

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
					reason: "SALE",
					notes: `Sale ID: ${id}`,
				},
			});
		}

		// Calculate change
		const changeGiven = Number(paymentData.amountPaid) - Number(sale.total);

		// Update sale status to COMPLETED
		const completedSale = await tx.sale.update({
			where: { id },
			data: {
				status: SaleStatus.COMPLETED,
				paymentMethod: paymentData.paymentMethod,
				amountPaid: paymentData.amountPaid,
				changeGiven,
				completedAt: new Date(),
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

		// Only restore stock if sale was completed
		if (sale.status === SaleStatus.COMPLETED) {
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
						notes: `Sale ID: ${id}`,
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
		});

		return cancelledSale;
	});

	return result;
}

/**
 * List sales with role-based filtering
 * @param userId - User ID for CASHIER filtering
 * @param userRoles - User roles for access control
 * @returns Array of sales with details
 */
export async function listSales(
	userId?: string,
	userRoles?: UserRole[],
): Promise<SaleWithDetails[]> {
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
