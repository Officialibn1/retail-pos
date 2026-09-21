import { prisma } from "@/lib/prisma";
import { Supplier } from "@/generated/prisma/client";
import {
	CreateSupplierInput,
	UpdateSupplierInput,
} from "@/lib/validations/supplier.schema";
import { SupplierWithCounts } from "@/lib/prisma-extended-types";

/**
 * Create a new supplier and optionally link inventory items to it.
 */
export async function createSupplier(
	data: CreateSupplierInput,
): Promise<Supplier> {
	const { inventoryItemIds = [], ...supplierData } = data;

	return prisma.$transaction(async (tx) => {
		const supplier = await tx.supplier.create({
			data: {
				name: supplierData.name,
				phone: supplierData.phone || null,
				email: supplierData.email || null,
				address: supplierData.address || null,
				notes: supplierData.notes || null,
			},
		});

		if (inventoryItemIds.length > 0) {
			await tx.inventoryItem.updateMany({
				where: { id: { in: inventoryItemIds }, deletedAt: null },
				data: { supplierId: supplier.id },
			});
		}

		return supplier;
	});
}

/**
 * Get a supplier by ID with counts.
 */
export async function getSupplierById(
	id: string,
): Promise<SupplierWithCounts | null> {
	return prisma.supplier.findUnique({
		where: { id },
		include: {
			_count: {
				select: {
					inventoryItems: true,
					purchaseOrders: true,
				},
			},
		},
	});
}

/**
 * Get full supplier detail — counts + linked inventory items + purchase orders.
 */
export async function getSupplierDetail(id: string) {
	return prisma.supplier.findUnique({
		where: { id },
		include: {
			_count: {
				select: {
					inventoryItems: true,
					purchaseOrders: true,
				},
			},
			inventoryItems: {
				where: { deletedAt: null },
				select: {
					id: true,
					name: true,
					sku: true,
					price: true,
					cost: true,
					stock: true,
					category: { select: { id: true, name: true } },
				},
				orderBy: { name: "asc" },
			},
			purchaseOrders: {
				include: {
					items: {
						include: {
							inventoryItem: { select: { id: true, name: true, sku: true } },
						},
					},
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});
}

export type SupplierDetail = NonNullable<
	Awaited<ReturnType<typeof getSupplierDetail>>
>;

/**
 * List all suppliers with counts, supporting optional name search.
 */
export async function listSuppliers(
	params: URLSearchParams,
): Promise<SupplierWithCounts[]> {
	const searchTerm = params.get("searchTerm");

	return prisma.supplier.findMany({
		where: searchTerm
			? {
					OR: [
						{ name: { contains: searchTerm, mode: "insensitive" } },
						{ phone: { contains: searchTerm, mode: "insensitive" } },
						{ email: { contains: searchTerm, mode: "insensitive" } },
					],
				}
			: undefined,
		include: {
			_count: {
				select: {
					inventoryItems: true,
					purchaseOrders: true,
				},
			},
		},
		orderBy: { name: "asc" },
	});
}

/**
 * Update a supplier and sync its linked inventory items.
 */
export async function updateSupplier(
	id: string,
	data: UpdateSupplierInput,
): Promise<Supplier> {
	const { inventoryItemIds, ...supplierData } = data;

	return prisma.$transaction(async (tx) => {
		const supplier = await tx.supplier.update({
			where: { id },
			data: {
				name: supplierData.name,
				phone: supplierData.phone ?? undefined,
				email: supplierData.email ?? undefined,
				address: supplierData.address ?? undefined,
				notes: supplierData.notes ?? undefined,
			},
		});

		if (inventoryItemIds !== undefined) {
			// Unlink items that are no longer in the list
			await tx.inventoryItem.updateMany({
				where: { supplierId: id, deletedAt: null },
				data: { supplierId: null },
			});

			// Link the new set of items
			if (inventoryItemIds.length > 0) {
				await tx.inventoryItem.updateMany({
					where: { id: { in: inventoryItemIds }, deletedAt: null },
					data: { supplierId: id },
				});
			}
		}

		return supplier;
	});
}

/**
 * Delete a supplier. Unlinks inventory items and nullifies supplier on purchase orders
 * rather than cascading deletes so history is preserved.
 */
export async function deleteSupplier(id: string): Promise<void> {
	const hasPendingOrders = await prisma.purchaseOrder.count({
		where: {
			supplierId: id,
			status: { in: ["PENDING", "ORDERED"] },
		},
	});

	if (hasPendingOrders > 0) {
		throw new Error(
			"Cannot delete supplier with pending or ordered purchase orders. Cancel them first.",
		);
	}

	await prisma.$transaction(async (tx) => {
		// Unlink inventory items
		await tx.inventoryItem.updateMany({
			where: { supplierId: id },
			data: { supplierId: null },
		});

		await tx.supplier.delete({ where: { id } });
	});
}
