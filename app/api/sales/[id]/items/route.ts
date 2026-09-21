import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updateSaleItemsSchema } from "@/lib/validations/sale.schema";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity-log.service";
import { getStoreSettings } from "@/lib/services/store-settings.service";
import { SaleStatus } from "@/generated/prisma/client";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/sales/[id]/items
 * Update the item list of a PENDING sale.
 * - Diffs old vs new items
 * - Restores stock for removed/reduced items (SALE_ITEM_REMOVED)
 * - Validates and deducts stock for added/increased items
 * - Recalculates totals
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const authResult = await requireAuth(request);
	if (authResult instanceof NextResponse) return authResult;

	const { request: authenticatedRequest } = authResult;
	const user = authenticatedRequest.user;

	const statusCheck = await requireActiveMutation(user.id);
	if (statusCheck) return statusCheck;

	try {
		const { id } = params;
		const body = await request.json();
		const validationResult = updateSaleItemsSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: {
						message: "Validation failed",
						code: "VALIDATION_ERROR",
						details: validationResult.error.errors,
					},
				},
				{ status: 400 },
			);
		}

		const { items: newItems, discountRate } = validationResult.data;
		const { taxRate } = await getStoreSettings();

		const result = await prisma.$transaction(
			async (tx) => {
				// Fetch the existing sale with its items
				const sale = await tx.sale.findUnique({
					where: { id },
					include: { items: true },
				});

				if (!sale) {
					throw Object.assign(new Error("Sale not found"), { code: "NOT_FOUND" });
				}

				if (sale.status !== SaleStatus.PENDING) {
					throw Object.assign(
						new Error("Only PENDING sales can be edited"),
						{ code: "INVALID_STATUS" },
					);
				}

				// Build maps: inventoryItemId → quantity for old and new item lists
				const oldMap = new Map(
					sale.items.map((i) => [i.inventoryItemId, i.quantity]),
				);
				const newMap = new Map(
					newItems.map((i) => [i.inventoryItemId, i.quantity]),
				);

				// 1. Restore stock for items removed or quantity reduced
				for (const [inventoryItemId, oldQty] of oldMap.entries()) {
					const newQty = newMap.get(inventoryItemId) ?? 0;
					const diff = oldQty - newQty; // positive = stock to restore
					if (diff > 0) {
						await tx.inventoryItem.update({
							where: { id: inventoryItemId },
							data: { stock: { increment: diff } },
						});
						await tx.stockMovement.create({
							data: {
								inventoryItemId,
								quantity: diff,
								reason: "SALE_ITEM_REMOVED",
								notes: `Pending sale ${id} edited — item quantity reduced`,
							},
						});
					}
				}

				// 2. Validate and deduct stock for added or increased items
				for (const newItem of newItems) {
					const oldQty = oldMap.get(newItem.inventoryItemId) ?? 0;
					const diff = newItem.quantity - oldQty; // positive = extra stock needed
					if (diff > 0) {
						const inventoryItem = await tx.inventoryItem.findUnique({
							where: { id: newItem.inventoryItemId },
							select: { id: true, name: true, stock: true, deletedAt: true },
						});

						if (!inventoryItem || inventoryItem.deletedAt) {
							throw Object.assign(
								new Error(`Item ${newItem.inventoryItemId} not found`),
								{ code: "NOT_FOUND" },
							);
						}

						if (inventoryItem.stock < diff) {
							throw Object.assign(
								new Error(
									`Insufficient stock for "${inventoryItem.name}". Available: ${inventoryItem.stock}, needed: ${diff}`,
								),
								{ code: "INSUFFICIENT_STOCK" },
							);
						}

						await tx.inventoryItem.update({
							where: { id: newItem.inventoryItemId },
							data: { stock: { decrement: diff } },
						});

						await tx.stockMovement.create({
							data: {
								inventoryItemId: newItem.inventoryItemId,
								quantity: -diff,
								reason: "SALE_PENDING",
								notes: `Pending sale ${id} edited — item quantity increased`,
							},
						});
					}
				}

				// 3. Replace all sale items
				await tx.saleItem.deleteMany({ where: { saleId: id } });
				await tx.saleItem.createMany({
					data: newItems.map((item) => ({
						saleId: id,
						inventoryItemId: item.inventoryItemId,
						quantity: item.quantity,
						price: item.price,
						note: item.note ?? null,
					})),
				});

				// 4. Recalculate totals
				const subtotal = newItems.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0,
				);
				const discountAmount = (subtotal * discountRate) / 100;
				const taxAmount = (subtotal - discountAmount) * Number(taxRate);
				const total = subtotal - discountAmount + taxAmount;

				// 5. Update the sale record
				const updatedSale = await tx.sale.update({
					where: { id },
					data: {
						subTotal: subtotal,
						discountAmount,
						taxAmount,
						total,
					},
					include: {
						items: {
							include: {
								inventoryItem: { select: { id: true, name: true, sku: true } },
							},
						},
						customer: {
							select: { id: true, name: true, phone: true, email: true },
						},
						user: { select: { id: true, name: true, email: true } },
						returns: {
							include: {
								items: {
									include: {
										inventoryItem: {
											select: { id: true, name: true, sku: true },
										},
									},
								},
								processedBy: { select: { id: true, name: true } },
							},
							orderBy: { createdAt: "desc" },
						},
					},
				});

				return updatedSale;
			},
			{ maxWait: 10000, timeout: 15000 },
		);

		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"SALE_ITEMS_UPDATED",
			`Updated items for pending sale ${id} — ${newItems.length} item(s), total: ₦${Number(result.total).toFixed(2)}`,
			ipAddress,
			undefined,
			{ entityType: "Sale", entityId: id },
		);

		return NextResponse.json(result, { status: 200 });
	} catch (error: any) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		const code = error?.code;
		if (code === "NOT_FOUND") {
			return NextResponse.json({ error: { message: error.message, code } }, { status: 404 });
		}
		if (code === "INVALID_STATUS") {
			return NextResponse.json({ error: { message: error.message, code } }, { status: 400 });
		}
		if (code === "INSUFFICIENT_STOCK") {
			return NextResponse.json({ error: { message: error.message, code } }, { status: 400 });
		}

		console.error("Error updating sale items:", error);
		return NextResponse.json(
			{ error: { message: "Failed to update sale items", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
