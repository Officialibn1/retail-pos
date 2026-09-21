import { prisma } from "@/lib/prisma";
import {
	CreatePurchaseOrderInput,
	UpdatePurchaseOrderInput,
	ReceivePurchaseOrderInput,
} from "@/lib/validations/purchase-order.schema";
import { PurchaseOrderWithDetails } from "@/lib/prisma-extended-types";

const INCLUDE_DETAILS = {
	supplier: {
		select: { id: true, name: true, phone: true, email: true },
	},
	items: {
		include: {
			inventoryItem: {
				select: { id: true, name: true, sku: true },
			},
		},
	},
} as const;

/**
 * Create a new purchase order with line items.
 */
export async function createPurchaseOrder(
	data: CreatePurchaseOrderInput,
): Promise<PurchaseOrderWithDetails> {
	const totalCost = data.items.reduce(
		(sum, item) => sum + Number(item.unitCost) * item.quantity,
		0,
	);

	return prisma.purchaseOrder.create({
		data: {
			supplierId: data.supplierId,
			notes: data.notes || null,
			totalCost,
			items: {
				create: data.items.map((item) => ({
					inventoryItemId: item.inventoryItemId,
					quantity: item.quantity,
					unitCost: item.unitCost,
				})),
			},
		},
		include: INCLUDE_DETAILS,
	});
}

/**
 * Get a purchase order by ID with full details.
 */
export async function getPurchaseOrderById(
	id: string,
): Promise<PurchaseOrderWithDetails | null> {
	return prisma.purchaseOrder.findUnique({
		where: { id },
		include: INCLUDE_DETAILS,
	});
}

/**
 * List all purchase orders, optionally filtered by supplierId or status.
 */
export async function listPurchaseOrders(
	params: URLSearchParams,
): Promise<PurchaseOrderWithDetails[]> {
	const supplierId = params.get("supplierId");
	const status = params.get("status");

	return prisma.purchaseOrder.findMany({
		where: {
			...(supplierId ? { supplierId } : {}),
			...(status ? { status: status as any } : {}),
		},
		include: INCLUDE_DETAILS,
		orderBy: { createdAt: "desc" },
	});
}

/**
 * Update a purchase order's notes, status, or items (only when PENDING).
 */
export async function updatePurchaseOrder(
	id: string,
	data: UpdatePurchaseOrderInput,
): Promise<PurchaseOrderWithDetails> {
	const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
	if (!existing) throw new Error("Purchase order not found");

	if (
		existing.status === "RECEIVED" ||
		existing.status === "CANCELLED"
	) {
		throw new Error(
			"Cannot edit a purchase order that has already been received or cancelled.",
		);
	}

	return prisma.$transaction(async (tx) => {
		let totalCost = Number(existing.totalCost);

		if (data.items) {
			// Replace items
			await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
			await tx.purchaseOrderItem.createMany({
				data: data.items.map((item) => ({
					purchaseOrderId: id,
					inventoryItemId: item.inventoryItemId,
					quantity: item.quantity,
					unitCost: item.unitCost,
				})),
			});
			totalCost = data.items.reduce(
				(sum, item) => sum + Number(item.unitCost) * item.quantity,
				0,
			);
		}

		const updated = await tx.purchaseOrder.update({
			where: { id },
			data: {
				notes: data.notes !== undefined ? data.notes || null : undefined,
				status: data.status,
				totalCost,
			},
			include: INCLUDE_DETAILS,
		});

		return updated;
	});
}

/**
 * Mark a purchase order as RECEIVED:
 * - Increments stock for each line item
 * - Creates StockMovement records
 * - Updates the cost field on each InventoryItem to the weighted average
 * - Sets receivedAt timestamp
 */
export async function receivePurchaseOrder(
	id: string,
	data: ReceivePurchaseOrderInput,
): Promise<PurchaseOrderWithDetails> {
	const order = await prisma.purchaseOrder.findUnique({
		where: { id },
		include: { items: true },
	});

	if (!order) throw new Error("Purchase order not found");
	if (order.status === "RECEIVED") throw new Error("Order already received");
	if (order.status === "CANCELLED")
		throw new Error("Cannot receive a cancelled order");

	return prisma.$transaction(async (tx) => {
		for (const lineItem of order.items) {
			// Get the current item for weighted-average cost calculation
			const inventoryItem = await tx.inventoryItem.findUnique({
				where: { id: lineItem.inventoryItemId },
			});

			if (!inventoryItem || inventoryItem.deletedAt) continue;

			const currentStock = inventoryItem.stock;
			const currentCost = Number(inventoryItem.cost ?? 0);
			const incomingQty = lineItem.quantity;
			const incomingCost = Number(lineItem.unitCost);

			// Weighted average cost
			const totalQty = currentStock + incomingQty;
			const newAvgCost =
				totalQty > 0
					? (currentStock * currentCost + incomingQty * incomingCost) / totalQty
					: incomingCost;

			// Increment stock and update cost
			await tx.inventoryItem.update({
				where: { id: lineItem.inventoryItemId },
				data: {
					stock: { increment: incomingQty },
					cost: newAvgCost,
				},
			});

			// Stock movement record
			await tx.stockMovement.create({
				data: {
					inventoryItemId: lineItem.inventoryItemId,
					quantity: incomingQty,
					reason: "RESTOCK",
					notes: `Received from purchase order #${id.slice(-8).toUpperCase()}`,
				},
			});
		}

		return tx.purchaseOrder.update({
			where: { id },
			data: {
				status: "RECEIVED",
				receivedAt: new Date(),
				notes: data.notes !== undefined ? data.notes || null : undefined,
			},
			include: INCLUDE_DETAILS,
		});
	});
}

/**
 * Cancel a purchase order (only when PENDING or ORDERED).
 */
export async function cancelPurchaseOrder(
	id: string,
): Promise<PurchaseOrderWithDetails> {
	const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
	if (!existing) throw new Error("Purchase order not found");

	if (existing.status === "RECEIVED") {
		throw new Error("Cannot cancel an already received purchase order.");
	}
	if (existing.status === "CANCELLED") {
		throw new Error("Purchase order is already cancelled.");
	}

	return prisma.purchaseOrder.update({
		where: { id },
		data: { status: "CANCELLED" },
		include: INCLUDE_DETAILS,
	});
}
