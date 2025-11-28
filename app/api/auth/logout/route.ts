import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth/jwt";
import { deleteSession } from "@/lib/auth/session";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST(request: NextRequest) {
	try {
		// Extract token from cookies
		const token = getTokenFromCookies(request);

		if (!token) {
			return NextResponse.json(
				{
					error: {
						message: "No active session found",
						code: "NO_SESSION",
					},
				},
				{ status: 400 },
			);
		}

		// Get user info from token before deleting session
		const payload = verifyToken(token);

		// Delete session from database
		await deleteSession(token);

		// Log activity if we have user info
		if (payload) {
			const ipAddress =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";
			const userAgent = request.headers.get("user-agent") || undefined;
			await logActivity(
				payload.userId,
				"USER_LOGOUT",
				"User logged out",
				ipAddress,
				userAgent,
			);
		}

		// Create response
		const response = NextResponse.json(
			{
				message: "Logout successful",
			},
			{ status: 200 },
		);

		// Clear authentication cookie
		response.cookies.set("auth-token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			expires: new Date(0), // Set to past date to delete cookie
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
