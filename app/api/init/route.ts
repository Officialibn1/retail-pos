import { NextResponse } from "next/server";
import { initializeServer } from "@/lib/server-init";

// Initialize server on first API call
initializeServer();

/**
 * GET /api/init
 *
 * Health check endpoint that also ensures server initialization
 */
export async function GET() {
	return NextResponse.json({
		status: "ok",
		message: "Server initialized",
		timestamp: new Date().toISOString(),
	});
}
