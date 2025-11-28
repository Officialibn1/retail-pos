"use client";

import type React from "react";

import { useAuth } from "./auth-provider";
import type { UserRole } from "@/lib/types";

interface RoleGuardProps {
	allowedRoles: readonly UserRole[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function RoleGuard({
	allowedRoles,
	children,
	fallback = null,
}: RoleGuardProps) {
	const { user } = useAuth();

	// Check if user has at least one of the allowed roles
	const hasAllowedRole = user?.roles.some((role) =>
		allowedRoles.includes(role),
	);

	if (!user || !hasAllowedRole) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
