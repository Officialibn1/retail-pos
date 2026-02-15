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
		(role) =>
			role === "SUPERADMIN" ||
			role === "MANAGER" ||
			role === "ADMIN" ||
			role === "CASHIER",
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
 * Only SUPERADMIN and MANAGER can access analytics
 */
export function canAccessAnalytics(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
}

/**
 * Check if user can access analytics dashboard
 * Only SUPERADMIN and MANAGER can access the analytics dashboard
 */
export function canAccessAnalyticsDashboard(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
}

/**
 * Check if user can access cashier performance data for other users
 * Only SUPERADMIN and MANAGER can see other users' performance
 */
export function canAccessOtherUsersPerformance(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
}

/**
 * Check if user can manage categories (full CRUD)
 * Only SUPERADMIN, MANAGER, and ADMIN can manage categories
 */
export function canManageCategories(userRoles: UserRole[]): boolean {
	return userRoles.some(
		(role) => role === "SUPERADMIN" || role === "MANAGER" || role === "ADMIN",
	);
}

/**
 * Check if user can manage customers (full CRUD)
 * Only SUPERADMIN, MANAGER, and ADMIN can perform full CRUD on customers
 */
export function canManageCustomers(userRoles: UserRole[]): boolean {
	return userRoles.some(
		(role) => role === "SUPERADMIN" || role === "MANAGER" || role === "ADMIN",
	);
}

/**
 * Check if user can create customers
 * All roles can create customers
 */
export function canCreateCustomer(userRoles: UserRole[]): boolean {
	return userRoles.some(
		(role) =>
			role === "SUPERADMIN" ||
			role === "MANAGER" ||
			role === "ADMIN" ||
			role === "CASHIER",
	);
}

/**
 * Check if user can access customer analytics
 * All roles can access customer analytics (filtered by their own data)
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
