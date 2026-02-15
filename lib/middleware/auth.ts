import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { verifyToken, getTokenFromCookies } from "@/lib/auth/jwt";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
	user: {
		id: string;
		email: string;
		roles: UserRole[];
	};
}

/**
 * Middleware to require authentication for protected routes
 * Validates JWT token and verifies session exists in database
 * @param request - Next.js request object
 * @returns Authenticated request or error response
 */
export async function requireAuth(
	request: NextRequest,
): Promise<{ request: AuthenticatedRequest } | NextResponse> {
	// Extract token from cookies
	const token = getTokenFromCookies(request);

	if (!token) {
		return NextResponse.json(
			{
				error: {
					message: "Authentication required",
					code: "UNAUTHORIZED",
				},
			},
			{ status: 401 },
		);
	}

	// Verify JWT token
	const payload = verifyToken(token);

	if (!payload) {
		return NextResponse.json(
			{
				error: {
					message: "Invalid or expired token",
					code: "UNAUTHORIZED",
				},
			},
			{ status: 401 },
		);
	}

	// Verify session exists in database
	const session = await getSession(token);

	if (!session) {
		return NextResponse.json(
			{
				error: {
					message: "Session not found or expired",
					code: "UNAUTHORIZED",
				},
			},
			{ status: 401 },
		);
	}

	// Fetch user from database to ensure they still exist
	const user = await prisma.user.findUnique({
		where: { id: payload.userId },
		select: {
			id: true,
			email: true,
			roles: true,
		},
	});

	if (!user) {
		return NextResponse.json(
			{
				error: {
					message: "User not found",
					code: "UNAUTHORIZED",
				},
			},
			{ status: 401 },
		);
	}

	// Attach user to request
	const authenticatedRequest = request as AuthenticatedRequest;
	authenticatedRequest.user = {
		id: user.id,
		email: user.email,
		roles: user.roles,
	};

	return { request: authenticatedRequest };
}

/**
 * Middleware factory to require specific roles for route access
 * @param requiredRoles - Array of roles that are allowed to access the route
 * @returns Middleware function that checks user roles
 */
export function requireRoles(requiredRoles: UserRole[]) {
	return (authenticatedRequest: AuthenticatedRequest): NextResponse | null => {
		const userRoles = authenticatedRequest.user.roles;

		// Check if user has at least one of the required roles
		const hasRequiredRole = requiredRoles.some((role) =>
			userRoles.includes(role),
		);

		if (!hasRequiredRole) {
			return NextResponse.json(
				{
					error: {
						message: "Insufficient permissions",
						code: "FORBIDDEN",
						details: {
							required: requiredRoles,
							current: userRoles,
						},
					},
				},
				{ status: 403 },
			);
		}

		// User has required role, allow request to proceed
		return null;
	};
}

/**
 * Helper function to check if user has SUPERADMIN role
 */
export function requireSuperAdmin() {
	return requireRoles([UserRole.SUPERADMIN]);
}

/**
 * Helper function to check if user has MANAGER or higher role
 * Note: This now excludes ADMIN as per new permission structure
 */
export function requireManager() {
	return requireRoles([UserRole.SUPERADMIN, UserRole.MANAGER]);
}

/**
 * Helper function to check if user can manage categories
 * SUPERADMIN, MANAGER, and ADMIN can manage categories
 */
export function requireCategoryManager() {
	return requireRoles([UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.ADMIN]);
}

/**
 * Helper function to check if user can manage customers (full CRUD)
 * SUPERADMIN, MANAGER, and ADMIN can manage customers
 */
export function requireCustomerManager() {
	return requireRoles([UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.ADMIN]);
}

/**
 * Helper function to check if user has any authenticated role
 */
export function requireAnyRole() {
	return requireRoles([
		UserRole.SUPERADMIN,
		UserRole.ADMIN,
		UserRole.MANAGER,
		UserRole.CASHIER,
	]);
}
