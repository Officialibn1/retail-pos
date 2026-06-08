import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { ActivityLogWithUser } from "../prisma-extended-types";

export interface ActivityMetadata {
	entityType?: string; // e.g. "InventoryItem", "Sale", "User"
	entityId?: string;
	changes?: Record<string, [unknown, unknown]>; // { field: [oldValue, newValue] }
	[key: string]: unknown;
}

/**
 * Create an activity log entry
 */
export async function logActivity(
	userId: string,
	action: string,
	details: string,
	ipAddress?: string,
	userAgent?: string,
	metadata?: ActivityMetadata,
): Promise<void> {
	try {
		await prisma.activityLog.create({
			data: {
				userId,
				action,
				details,
				ipAddress,
				userAgent,
				metadata: metadata ?? undefined,
			},
		});
	} catch (error) {
		console.error("Failed to log activity:", error);
	}
}

export async function getActivityLogs(
	userId?: string,
	userRoles?: UserRole[],
	params?: URLSearchParams,
): Promise<ActivityLogWithUser[]> {
	const searchTerm = params?.get("searchTerm");
	const actionFilter = params?.get("action");
	const entityType = params?.get("entityType");
	const entityId = params?.get("entityId");
	const limit = Number(params?.get("limit") || "100");

	const whereClause: any = {};

	// Role-based scoping
	if (
		userId &&
		userRoles &&
		!userRoles.includes(UserRole.SUPERADMIN) &&
		!userRoles.includes(UserRole.MANAGER)
	) {
		whereClause.userId = userId;
	}

	// Free-text search across action, details, and user name
	if (searchTerm) {
		whereClause.OR = [
			{ action: { contains: searchTerm, mode: "insensitive" as const } },
			{ details: { contains: searchTerm, mode: "insensitive" as const } },
			{
				user: {
					name: { contains: searchTerm, mode: "insensitive" as const },
				},
			},
		];
	}

	// Action category filter
	if (actionFilter && actionFilter !== "all") {
		whereClause.action = {
			contains: actionFilter,
			mode: "insensitive" as const,
		};
	}

	// Entity type filter — matches metadata->>'entityType'
	if (entityType && entityType !== "all") {
		whereClause.metadata = {
			path: ["entityType"],
			equals: entityType,
		};
	}

	// Entity ID filter — further narrows by metadata->>'entityId'
	if (entityId && entityId.trim() !== "") {
		whereClause.metadata = {
			...(whereClause.metadata ?? {}),
			path: ["entityId"],
			equals: entityId.trim(),
		};
	}

	const logs = await prisma.activityLog.findMany({
		where: whereClause,
		include: {
			user: { select: { id: true, name: true, email: true } },
		},
		orderBy: { createdAt: "desc" },
		take: limit,
	});

	return logs;
}

export async function getUserActivityLogs(
	userId: string,
	limit: number = 50,
): Promise<ActivityLogWithUser[]> {
	const logs = await prisma.activityLog.findMany({
		where: { userId },
		include: {
			user: { select: { id: true, name: true, email: true } },
		},
		orderBy: { createdAt: "desc" },
		take: limit,
	});
	return logs;
}

export async function getActivityLogsByAction(
	action: string,
	limit: number = 50,
): Promise<ActivityLogWithUser[]> {
	const logs = await prisma.activityLog.findMany({
		where: { action: { contains: action, mode: "insensitive" } },
		include: {
			user: { select: { id: true, name: true, email: true } },
		},
		orderBy: { createdAt: "desc" },
		take: limit,
	});
	return logs;
}
