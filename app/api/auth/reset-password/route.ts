import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyResetToken, hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validations/password-reset.schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = resetPasswordSchema.parse(body);

		// Verify token exists and not expired
		const userId = await verifyResetToken(validatedData.token);

		if (!userId) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid or expired reset token",
						code: "INVALID_TOKEN",
					},
				},
				{ status: 400 },
			);
		}

		// Hash new password
		const hashedPassword = await hashPassword(validatedData.password);

		// Update user password and delete used token in a transaction
		await prisma.$transaction(async (tx) => {
			// Update user password
			await tx.user.update({
				where: { id: userId },
				data: { password: hashedPassword },
			});

			// Delete the used token to prevent reuse
			await tx.passwordResetToken.delete({
				where: { token: validatedData.token },
			});
		});

		return NextResponse.json(
			{
				message: "Password has been reset successfully",
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

		console.error("Password reset error:", error);
		return NextResponse.json(
			{
				error: {
					message: "An error occurred while resetting your password",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
