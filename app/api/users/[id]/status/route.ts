import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import {
	getUserStatus,
	updateUserStatus,
} from "@/lib/services/user-status.service";
import { UserStatus } from "@/generated/prisma/client";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/[id]/status
 * Get user status by ID (SUPERADMIN only)
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check SUPERADMIN role
		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Get user status
		const status = await getUserStatus(params.id);

		if (!status) {
			return NextResponse.json(
				{
					error: {
						message: "User not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			userId: params.id,
			status,
		});
	} catch (error) {
		console.error("Error getting user status:", error);
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

/**
 * PATCH /api/users/[id]/status
 * Update user status (SUPERADMIN only)
 * Cannot block or suspend SUPERADMIN users
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check SUPERADMIN role
		const roleCheck = requireSuperAdmin()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Check if user can perform mutations
		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) {
			return statusCheck;
		}

		// Parse request body
		const body = await request.json();
		const { status } = body;

		// Validate status
		if (!status || !Object.values(UserStatus).includes(status)) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid status value",
						code: "VALIDATION_ERROR",
						details: {
							validStatuses: Object.values(UserStatus),
						},
					},
				},
				{ status: 400 },
			);
		}

		// Update user status
		const result = await updateUserStatus(params.id, status as UserStatus);

		// Log activity
		const currentUser = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			currentUser.id,
			"USER_STATUS_UPDATED",
			`Updated user ${params.id} status to ${status}`,
			ipAddress,
		);

		return NextResponse.json({
			message: "User status updated successfully",
			...result,
		});
	} catch (error: any) {
		console.error("Error updating user status:", error);

		// Handle specific errors
		if (error.message?.includes("User not found")) {
			return NextResponse.json(
				{
					error: {
						message: "User not found",
						code: "NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		if (error.message?.includes("Cannot block or suspend SUPERADMIN")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "SUPERADMIN_PROTECTION",
					},
				},
				{ status: 403 },
			);
		}

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
