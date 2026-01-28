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

/**
 * Check if user can access analytics data
 * All roles except basic users can access analytics
 */
export function canAccessAnalytics(userRoles: UserRole[]): boolean {
	return userRoles.some(
		(role) =>
			role === "SUPERADMIN" ||
			role === "ADMIN" ||
			role === "MANAGER" ||
			role === "CASHIER",
	);
}

/**
 * Check if user can access cashier performance data for other users
 * Only SUPERADMIN, ADMIN, and MANAGER can see other users' performance
 */
export function canAccessOtherUsersPerformance(userRoles: UserRole[]): boolean {
	return userRoles.some(
		(role) => role === "SUPERADMIN" || role === "ADMIN" || role === "MANAGER",
	);
}

/**
 * Check if user can access customer analytics
 * All roles can access customer analytics
 */
export function canAccessCustomerAnalytics(userRoles: UserRole[]): boolean {
	return canAccessAnalytics(userRoles);
}

/**
 * Check if user can access inventory analytics
 * All roles can access inventory analytics
 */
export function canAccessInventoryAnalytics(userRoles: UserRole[]): boolean {
	return canAccessAnalytics(userRoles);
}
