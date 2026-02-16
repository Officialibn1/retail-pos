import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/password";
import { verifyOTPSchema } from "@/lib/validations/password-reset.schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return reset token
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = verifyOTPSchema.parse(body);

		// Verify OTP
		const token = await verifyOTP(validatedData.email, validatedData.otp);

		if (!token) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid or expired OTP",
						code: "INVALID_OTP",
					},
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				message: "OTP verified successfully",
				token,
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

		console.error("OTP verification error:", error);
		return NextResponse.json(
			{
				error: {
					message: "An error occurred while verifying your OTP",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
