import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/user.schema";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body = await request.json();

		// Validate input using Zod schema
		const validationResult = loginSchema.safeParse(body);

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

		const { email, password } = validationResult.data;

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid credentials",
						code: "INVALID_CREDENTIALS",
					},
				},
				{ status: 401 },
			);
		}

		// Verify password
		const isPasswordValid = await verifyPassword(password, user.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{
					error: {
						message: "Invalid credentials",
						code: "INVALID_CREDENTIALS",
					},
				},
				{ status: 401 },
			);
		}

		// Generate JWT token
		const { token, expiresAt } = generateToken({
			userId: user.id,
			email: user.email,
			roles: user.roles,
		});

		// Create session in database
		await createSession(user.id, token);

		// Log activity
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		const userAgent = request.headers.get("user-agent") || undefined;
		await logActivity(
			user.id,
			"USER_LOGIN",
			`User ${user.name} logged in successfully`,
			ipAddress,
			userAgent,
		);

		// Prepare user data (excluding password)
		const userData = {
			id: user.id,
			email: user.email,
			username: user.username,
			name: user.name,
			roles: user.roles,
			shift: user.shift,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		// Create response with user data
		const response = NextResponse.json(
			{
				user: userData,
				message: "Login successful",
			},
			{ status: 200 },
		);

		// Set HTTP-only cookie with token
		response.cookies.set("auth-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			expires: expiresAt,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
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
