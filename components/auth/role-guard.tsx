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

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
