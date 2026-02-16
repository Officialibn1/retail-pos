// Cron job to cancel pending orders at midnight using node-cron

import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { SaleStatus, UserRole } from "@/generated/prisma/client";
import { sendCanceledOrdersEmail } from "@/lib/email";
import { logActivity } from "@/lib/services/activity-log.service";

/**
 * Initialize the cron job to cancel pending orders at midnight
 * Runs at 23:59:59 daily
 */
export function initializeCancelPendingOrdersCron() {
	const openInMidnight = process.env.OPEN_IN_MIDNIGHT === "true";

	if (openInMidnight) {
		console.log(
			"🏪 Store operates 24/7 - Auto-cancel pending orders is DISABLED",
		);
		return;
	}

	console.log("⏰ Initializing auto-cancel pending orders cron job...");
	console.log("📅 Schedule: Daily at 23:59:59");

	// Schedule: second minute hour day month weekday
	// 59 59 23 * * * = 23:59:59 every day
	const cronSchedule = "59 59 23 * * *";

	cron.schedule(cronSchedule, async () => {
		await cancelPendingOrdersJob();
	});

	console.log("✅ Auto-cancel pending orders cron job initialized");
	console.log(`🌍 Timezone: ${process.env.TZ || "UTC"}`);
}

/**
 * The actual job that cancels pending orders
 */
async function cancelPendingOrdersJob() {
	try {
		console.log("🔄 Running auto-cancel pending orders job...");

		// Get all pending sales
		const pendingSales = await prisma.sale.findMany({
			where: {
				status: SaleStatus.PENDING,
			},
			include: {
				items: true,
				customer: {
					select: {
						name: true,
					},
				},
			},
		});

		if (pendingSales.length === 0) {
			console.log("✅ No pending orders to cancel");
			return;
		}

		console.log(`📋 Found ${pendingSales.length} pending orders to cancel`);

		// Cancel each sale and restore stock
		const canceledOrders = [];

		for (const sale of pendingSales) {
			try {
				await prisma.$transaction(async (tx) => {
					// Restore inventory stock for all items
					for (const item of sale.items) {
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
								notes: `Sale ID: ${sale.id} - Auto-cancelled at midnight`,
							},
						});
					}

					// Update sale status to CANCELLED
					await tx.sale.update({
						where: { id: sale.id },
						data: {
							status: SaleStatus.CANCELLED,
							cancelledAt: new Date(),
						},
					});
				});

				canceledOrders.push({
					id: sale.id,
					customerName: sale.customer?.name || undefined,
					total: Number(sale.total),
					createdAt: sale.createdAt,
				});
			} catch (error) {
				console.error(`❌ Failed to cancel sale ${sale.id}:`, error);
			}
		}

		console.log(
			`✅ Successfully cancelled ${canceledOrders.length} pending orders`,
		);

		// Log activity
		try {
			const systemUser = await prisma.user.findUnique({
				where: { email: "automated_tasks@pos_store.com" },
			});

			if (systemUser) {
				await logActivity(
					systemUser.id,
					"SYSTEM_AUTO_CANCEL",
					`Automatically cancelled ${canceledOrders.length} pending orders at midnight`,
					"system",
				);
				console.log("📝 Activity logged successfully");
			}
		} catch (logError) {
			console.error("⚠️  Failed to log activity:", logError);
		}

		// Send email notification to SUPERADMIN and MANAGER users
		if (canceledOrders.length > 0) {
			try {
				const admins = await prisma.user.findMany({
					where: {
						roles: {
							hasSome: [UserRole.SUPERADMIN, UserRole.MANAGER],
						},
					},
					select: {
						email: true,
					},
				});

				const adminEmails = admins.map((admin) => admin.email);

				if (adminEmails.length > 0) {
					const totalAmount = canceledOrders.reduce(
						(sum, order) => sum + order.total,
						0,
					);

					await sendCanceledOrdersEmail(adminEmails, {
						canceledOrders,
						totalAmount,
						date: new Date(),
					});

					console.log(
						`📧 Sent notification email to ${adminEmails.length} admin(s)`,
					);
				}
			} catch (emailError) {
				console.error("⚠️  Failed to send notification email:", emailError);
				// Don't fail the job if email fails
			}
		}
	} catch (error) {
		console.error("❌ Error in cancelPendingOrdersJob:", error);
	}
}
