import type { UserRole } from "./types";

/**
 * Authentication utility functions for role-based access control
 *
 * Note: User authentication state is now managed through Redux.
 * Use useAppSelector(selectUser) to get the current user.
 */

export function hasPermission(
	userRoles: UserRole[],
	requiredRoles: UserRole[],
): boolean {
	return userRoles.some((role) => requiredRoles.includes(role));
}

export function canViewAllData(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
}

export function canViewDashboardPage(userRoles: UserRole[]): boolean {
	return userRoles.some(
		(role) => role === "SUPERADMIN" || role === "MANAGER" || role === "ADMIN",
	);
}

export function canViewActivityLogs(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
}

export function canManageInventory(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
}

export function canManageUsers(userRoles: UserRole[]): boolean {
	return userRoles.includes("SUPERADMIN");
}
