import type { User, UserRole } from "./types";
import { api } from "./api-client";

/**
 * Fetches the current authenticated user from the API
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
	try {
		const user = await api.get<User>("/api/auth/me");
		return user;
	} catch (error) {
		// If unauthorized or any error, return null
		return null;
	}
}

export function hasPermission(
	userRoles: UserRole[],
	requiredRoles: UserRole[],
): boolean {
	return userRoles.some((role) => requiredRoles.includes(role));
}

export function canViewAllData(userRoles: UserRole[]): boolean {
	return userRoles.some((role) => role === "SUPERADMIN" || role === "MANAGER");
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
