import { initializeCronJobs } from "./cron";

let initialized = false;

/**
 * Initialize server-side services
 *
 * This should be called once when the server starts
 * Handles cron jobs and other background tasks
 */
export function initializeServer() {
	// Prevent multiple initializations
	if (initialized) {
		return;
	}

	console.log("🔧 Initializing server services...");

	// Initialize cron jobs
	initializeCronJobs();

	initialized = true;
	console.log("✅ Server services initialized");
}
