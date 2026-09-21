import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";

export type ReturnWithDetails = {
	id: string;
	saleId: string;
	reason: string;
	refundAmount: number;
	refundMethod: string;
	createdAt: Date;
	processedBy: {
		id: string;
		name: string;
		email: string;
	};
	sale: {
		id: string;
		customer: {
			id: string;
			name: string | null;
			phone: string;
		} | null;
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
};

export interface ReturnFilters {
	searchTerm?: string;
	refundMethod?: string;
	startDate?: string;
	endDate?: string;
}

/**
 * List all returns with role-based filtering
 * CASHIER sees only returns they processed; MANAGER+ sees all
 */
export async function listReturns(
	userId?: string,
	userRoles?: UserRole[],
	params?: URLSearchParams,
): Promise<ReturnWithDetails[]> {
	const searchTerm = params?.get("searchTerm");
	const refundMethod = params?.get("refundMethod");
	const startDate = params?.get("startDate");
	const endDate = params?.get("endDate");

	const whereClause: any = {};

	// Role-based scoping: CASHIER/ADMIN only see returns they processed
	if (
		userId &&
		userRoles &&
		!userRoles.includes(UserRole.SUPERADMIN) &&
		!userRoles.includes(UserRole.MANAGER)
	) {
		whereClause.processedById = userId;
	}

	// Search by return ID, sale ID, or customer name
	if (searchTerm) {
		const searchConditions: any[] = [
			{ id: { contains: searchTerm, mode: "insensitive" as const } },
			{ saleId: { contains: searchTerm, mode: "insensitive" as const } },
			{
				sale: {
					customer: {
						name: { contains: searchTerm, mode: "insensitive" as const },
					},
				},
			},
			{
				processedBy: {
					name: { contains: searchTerm, mode: "insensitive" as const },
				},
			},
		];

		if (whereClause.processedById) {
			whereClause.AND = [{ OR: searchConditions }];
		} else {
			whereClause.OR = searchConditions;
		}
	}

	// Refund method filter
	if (refundMethod && refundMethod !== "all") {
		whereClause.refundMethod = refundMethod;
	}

	// Date range filter
	if (startDate || endDate) {
		whereClause.createdAt = {};
		if (startDate) {
			whereClause.createdAt.gte = new Date(startDate);
		}
		if (endDate) {
			const end = new Date(endDate);
			end.setDate(end.getDate() + 1);
			whereClause.createdAt.lt = end;
		}
	}

	const returns = await prisma.saleReturn.findMany({
		where: whereClause,
		include: {
			processedBy: {
				select: { id: true, name: true, email: true },
			},
			sale: {
				select: {
					id: true,
					customer: {
						select: { id: true, name: true, phone: true },
					},
				},
			},
			items: {
				include: {
					inventoryItem: {
						select: { id: true, name: true, sku: true },
					},
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return returns.map((r) => ({
		...r,
		refundAmount: Number(r.refundAmount),
		items: r.items.map((i) => ({ ...i, price: Number(i.price) })),
	}));
}
