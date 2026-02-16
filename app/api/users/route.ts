import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createUserSchema } from "@/lib/validations/user.schema";
import { createUser, listUsers } from "@/lib/services/user.service";
import { logActivity } from "@/lib/services/activity-log.service";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/users
 * Create a new user (SUPERADMIN only)
 */
export async function POST(request: NextRequest) {
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

		// Parse and validate request body
		const body = await request.json();
		const validatedData = createUserSchema.parse(body);

		// Create user
		const { user, password } = await createUser(validatedData);

		// Log activity
		const currentUser = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			currentUser.id,
			"USER_CREATED",
			`Created new user: ${user.name} (${
				user.email
			}) with roles: ${user.roles.join(", ")}`,
			ipAddress,
		);

		return NextResponse.json(
			{
				message:
					"User created successfully. Login credentials have been sent to the user's email.",
				user,
				temporaryPassword: password, // Include in response for admin reference
			},
			{ status: 201 },
		);
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
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

		// Handle Prisma unique constraint violations
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return NextResponse.json(
				{
					error: {
						message: "User with this email or username already exists",
						code: "DUPLICATE_USER",
					},
				},
				{ status: 409 },
			);
		}

		// Handle unexpected errors
		console.error("Error creating user:", error);
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
 * GET /api/users
 * List all users (SUPERADMIN only)
 */
export async function GET(request: NextRequest) {
	try {
		// Extract search params from URL
		const params = request.nextUrl.searchParams;

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

		// Get all users with search/filter params
		const users = await listUsers(params);

		return NextResponse.json({
			users,
			count: users.length,
		});
	} catch (error) {
		// Handle unexpected errors
		console.error("Error listing users:", error);
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
