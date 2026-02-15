import { initializeCancelPendingOrdersCron } from "./cancel-pending-orders";

/**
 * Initialize all cron jobs
 *
 * This should be called once when the application starts
 * Works on any hosting platform (VPS, dedicated server, cloud, etc.)
 */
export function initializeCronJobs() {
	console.log("🚀 Initializing cron jobs...");

	// Initialize cancel pending orders cron
	initializeCancelPendingOrdersCron();

	// Add more cron jobs here as needed
	// Example:
	// initializeBackupCron();
	// initializeReportGenerationCron();

	console.log("✅ All cron jobs initialized");
}
