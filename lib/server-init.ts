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

	// Skip initialization during build phase
	// Next.js sets NEXT_PHASE during build
	const isBuildTime =
		process.env.NEXT_PHASE === "phase-production-build" ||
		process.env.NEXT_PHASE === "phase-export";

	if (isBuildTime) {
		console.log("⏭️  Skipping server initialization during build phase");
		return;
	}

	// Allow disabling cron jobs via environment variable
	const cronDisabled = process.env.DISABLE_CRON === "true";

	if (cronDisabled) {
		console.log("⏭️  Cron jobs disabled via DISABLE_CRON environment variable");
		initialized = true;
		return;
	}

	console.log("🔧 Initializing server services...");

	try {
		// Initialize cron jobs
		initializeCronJobs();

		initialized = true;
		console.log("✅ Server services initialized");
	} catch (error: any) {
		console.error("❌ Error initializing server services:", error);
		console.error("Error details:", error.message);

		// Mark as initialized to prevent retry loops
		// The app should continue to work even if cron fails
		initialized = true;
		console.log(
			"⚠️  Server services initialization failed, but app will continue",
		);
	}
}
