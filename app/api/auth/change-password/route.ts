import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validations/change-password.schema";
import { requireAuth } from "@/lib/middleware/auth";
import { logActivity } from "@/lib/services/activity-log.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/change-password
 * Change user's password after verifying current password
 */
export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		const { user } = authResult.request;
		const body = await request.json();

		// Validate input
		const validationResult = changePasswordSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid input data",
						code: "VALIDATION_ERROR",
						details: validationResult.error.errors,
					},
				},
				{ status: 400 },
			);
		}

		const { currentPassword, newPassword } = validationResult.data;

		// Get user with password from database
		const userWithPassword = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				email: true,
				password: true,
			},
		});

		if (!userWithPassword) {
			return NextResponse.json(
				{
					error: {
						message: "User not found",
						code: "USER_NOT_FOUND",
					},
				},
				{ status: 404 },
			);
		}

		// Verify current password
		const isCurrentPasswordValid = await verifyPassword(
			currentPassword,
			userWithPassword.password,
		);

		if (!isCurrentPasswordValid) {
			return NextResponse.json(
				{
					error: {
						message: "Current password is incorrect",
						code: "INVALID_CURRENT_PASSWORD",
					},
				},
				{ status: 400 },
			);
		}

		// Hash new password
		const hashedNewPassword = await hashPassword(newPassword);

		// Update password in database
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedNewPassword },
		});

		// Log activity
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		const userAgent = request.headers.get("user-agent") || undefined;

		await logActivity(
			user.id,
			"PASSWORD_CHANGED",
			`User ${userWithPassword.name} changed their password`,
			ipAddress,
			userAgent,
		);

		// Invalidate all user sessions (force re-login)
		await prisma.session.deleteMany({
			where: { userId: user.id },
		});

		return NextResponse.json(
			{
				message: "Password changed successfully. Please log in again.",
			},
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: {
						message: "Validation failed",
						code: "VALIDATION_ERROR",
						details: error.errors,
					},
				},
				{ status: 400 },
			);
		}

		console.error("Change password error:", error);
		return NextResponse.json(
			{
				error: {
					message: "An error occurred while changing your password",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
