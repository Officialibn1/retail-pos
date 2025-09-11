import type { User, UserRole } from "./types"
import { mockUsers } from "./dummy-data/mock-users"

export function getCurrentUser(): User | null {
  // In a real app, this would check authentication tokens
  // For demo purposes, return the first user (SuperAdmin)
  return mockUsers[0]
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function canViewAllData(userRole: UserRole): boolean {
  return userRole === "SuperAdmin" || userRole === "Manager"
}

export function canViewActivityLogs(userRole: UserRole): boolean {
  return userRole === "SuperAdmin" || userRole === "Manager"
}

export function canManageInventory(userRole: UserRole): boolean {
  return userRole === "SuperAdmin" || userRole === "Manager"
}

export function canManageUsers(userRole: UserRole): boolean {
  return userRole === "SuperAdmin"
}
