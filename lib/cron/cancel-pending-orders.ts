import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { SaleStatus, UserRole } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";

/**
 * Get or create the automated tasks user
 * This user is used for system-generated activities like cron jobs
 */
async function getOrCreateAutomatedUser() {
	const automatedEmail = "automated_tasks@pos_store.com";

	// Try to find existing automated user
	let automatedUser = await prisma.user.findUnique({
		where: { email: automatedEmail },
	});

	// Create if doesn't exist
	if (!automatedUser) {
		console.log("Creating automated tasks user...");

		// Generate a long random password (64 characters)
		const randomPassword = Array.from(
			{ length: 64 },
			() =>
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"[
					Math.floor(Math.random() * 70)
				],
		).join("");

		const hashedPassword = await bcrypt.hash(randomPassword, 10);

		automatedUser = await prisma.user.create({
			data: {
				email: automatedEmail,
				username: "automated_tasks",
				name: "Automated Tasks System",
				password: hashedPassword,
				roles: [UserRole.SUPERADMIN], // Give SUPERADMIN role for system tasks
			},
		});

		console.log("✅ Automated tasks user created");
	}

	return automatedUser;
}

/**
 * Cron job to automatically cancel pending orders at midnight
 *
 * Schedule: Runs at 23:59:59 every day
 * Condition: Only runs if OPEN_IN_MIDNIGHT is not set to "true"
 *
 * This runs in-process and works on any hosting platform (VPS, dedicated server, etc.)
 */
export function initializeCancelPendingOrdersCron() {
	// Check if cron should be enabled
	const openInMidnight = process.env.OPEN_IN_MIDNIGHT === "true";

	if (openInMidnight) {
		console.log(
			"🏪 Store operates 24/7 - Auto-cancel pending orders is DISABLED",
		);
		return;
	}

	console.log("⏰ Initializing auto-cancel pending orders cron job...");
	console.log("📅 Schedule: Daily at 23:59:59");

	// Schedule: Run at 23:59:59 every day
	// Format: second minute hour day month weekday
	const cronSchedule = "59 59 23 * * *";

	cron.schedule(
		cronSchedule,
		async () => {
			try {
				console.log("🔄 Running auto-cancel pending orders job...");

				// Double-check the environment variable at runtime
				const openInMidnight = process.env.OPEN_IN_MIDNIGHT === "true";
				if (openInMidnight) {
					console.log("⏭️  Store operates 24/7, skipping cancellation");
					return;
				}

				// Get or create automated user
				const automatedUser = await getOrCreateAutomatedUser();

				// Get all pending orders
				const pendingOrders = await prisma.sale.findMany({
					where: {
						status: SaleStatus.PENDING,
					},
					select: {
						id: true,
						total: true,
						createdAt: true,
						userId: true,
					},
				});

				if (pendingOrders.length === 0) {
					console.log("✅ No pending orders to cancel");
					return;
				}

				console.log(
					`📋 Found ${pendingOrders.length} pending orders to cancel`,
				);

				// Cancel all pending orders
				const result = await prisma.sale.updateMany({
					where: {
						status: SaleStatus.PENDING,
					},
					data: {
						status: SaleStatus.CANCELLED,
						updatedAt: new Date(),
					},
				});

				console.log(`✅ Successfully cancelled ${result.count} pending orders`);

				// Create detailed message with all order IDs
				const orderIdsList = pendingOrders.map((o) => o.id).join(", ");
				const detailsMessage = `Automatically cancelled ${result.count} pending order(s) at midnight. Order IDs: ${orderIdsList}. Timestamp: ${new Date().toISOString()}`;

				// Log the activity
				await prisma.activityLog.create({
					data: {
						userId: automatedUser.id,
						action: "SYSTEM_AUTO_CANCEL_PENDING_ORDERS",
						details: detailsMessage,
						ipAddress: "127.0.0.1", // System/localhost
						userAgent: "Cron Job - Auto Cancel Pending Orders",
					},
				});

				console.log("📝 Activity logged successfully");
				console.log(`📄 Cancelled order IDs: ${orderIdsList}`);
			} catch (error: any) {
				console.error(
					"❌ Error in auto-cancel pending orders cron job:",
					error,
				);
				console.error("Error details:", error.message);

				// Try to log the error
				try {
					const automatedUser = await getOrCreateAutomatedUser();
					await prisma.activityLog.create({
						data: {
							userId: automatedUser.id,
							action: "SYSTEM_AUTO_CANCEL_ERROR",
							details: `Error during auto-cancel pending orders: ${error.message}. Timestamp: ${new Date().toISOString()}`,
							ipAddress: "127.0.0.1",
							userAgent: "Cron Job - Auto Cancel Pending Orders",
						},
					});
				} catch (logError) {
					console.error("Failed to log error:", logError);
				}
			}
		},
		{
			timezone: process.env.TZ || "UTC", // Use system timezone or UTC
		},
	);

	console.log("✅ Auto-cancel pending orders cron job initialized");
	console.log(`🌍 Timezone: ${process.env.TZ || "UTC"}`);
}
