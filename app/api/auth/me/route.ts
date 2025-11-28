import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Get current authenticated user data
 */
export async function GET(request: NextRequest) {
	try {
		// Require authentication
		const authResult = await requireAuth(request);

		// If authentication failed, return error response
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		const { request: authenticatedRequest } = authResult;

		// Fetch full user data from database (excluding password)
		const user = await prisma.user.findUnique({
			where: { id: authenticatedRequest.user.id },
			select: {
				id: true,
				email: true,
				username: true,
				name: true,
				roles: true,
				shift: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
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

		return NextResponse.json(user, { status: 200 });
	} catch (error) {
		console.error("Get current user error:", error);
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
