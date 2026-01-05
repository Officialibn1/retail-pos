import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { ActivityLogWithUser } from "../prisma-extended-types";

/**
 * Create an activity log entry
 * @param userId - User ID performing the action
 * @param action - Action performed (e.g., "LOGIN", "SALE_CREATED")
 * @param details - Additional details about the action
 * @param ipAddress - Optional IP address
 * @param userAgent - Optional user agent string
 */
export async function logActivity(
	userId: string,
	action: string,
	details: string,
	ipAddress?: string,
	userAgent?: string,
): Promise<void> {
	try {
		await prisma.activityLog.create({
			data: {
				userId,
				action,
				details,
				ipAddress,
				userAgent,
			},
		});
	} catch (error) {
		// Log error but don't throw - activity logging shouldn't break the app
		console.error("Failed to log activity:", error);
	}
}

export async function getActivityLogs(
	userId?: string,
	userRoles?: UserRole[],
	limit: number = 100,
): Promise<ActivityLogWithUser[]> {
	// Build where clause based on role
	const whereClause: any = {};

	// CASHIER can only see their own activities
	if (
		userId &&
		userRoles &&
		userRoles.includes(UserRole.CASHIER) &&
		!userRoles.includes(UserRole.MANAGER) &&
		!userRoles.includes(UserRole.ADMIN) &&
		!userRoles.includes(UserRole.SUPERADMIN)
	) {
		whereClause.userId = userId;
	}

	const logs = await prisma.activityLog.findMany({
		where: whereClause,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
	});

	return logs;
}

export async function getUserActivityLogs(
	userId: string,
	limit: number = 50,
): Promise<ActivityLogWithUser[]> {
	const logs = await prisma.activityLog.findMany({
		where: {
			userId,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
	});

	return logs;
}

/**
 * Get activity logs by action type
 * @param action - Action to filter by
 * @param limit - Maximum number of logs to return
 * @returns Array of activity logs
 */
export async function getActivityLogsByAction(
	action: string,
	limit: number = 50,
): Promise<ActivityLogWithUser[]> {
	const logs = await prisma.activityLog.findMany({
		where: {
			action: {
				contains: action,
				mode: "insensitive",
			},
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
	});

	return logs;
}
