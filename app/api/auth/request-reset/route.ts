import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/auth/password";
import { requestPasswordResetSchema } from "@/lib/validations/password-reset.schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/request-reset
 * Request a password reset token
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = requestPasswordResetSchema.parse(body);

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email: validatedData.email },
		});

		// For security, always return success even if user doesn't exist
		// This prevents email enumeration attacks
		if (!user) {
			return NextResponse.json(
				{
					message:
						"If an account with that email exists, a password reset link has been sent.",
				},
				{ status: 200 },
			);
		}

		// Generate reset token with 1-hour expiration
		const token = await createResetToken(user.id);

		// TODO: Send email with reset token
		// For now, we'll just return success
		// In production, you would send an email here using nodemailer or similar

		return NextResponse.json(
			{
				message:
					"If an account with that email exists, a password reset link has been sent.",
				// In development, include the token for testing
				...(process.env.NODE_ENV === "development" && { token }),
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

		console.error("Password reset request error:", error);
		return NextResponse.json(
			{
				error: {
					message: "An error occurred while processing your request",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
