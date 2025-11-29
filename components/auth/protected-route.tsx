"use client";

import type React from "react";

import { useAuth } from "./auth-provider";
import { LoginForm } from "./login-form";
import type { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
}

export function ProtectedRoute({
	children,
	allowedRoles,
}: ProtectedRouteProps) {
	const { user, login, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-brand-main-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-main-600 mx-auto'></div>
					<p className='mt-2 text-brand-main-700'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <LoginForm onLogin={login} />;
	}

	// Check if user has at least one of the allowed roles
	const hasAllowedRole = allowedRoles
		? user.roles.some((role) => allowedRoles.includes(role))
		: true;

	if (allowedRoles && !hasAllowedRole) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-brand-main-50 p-4'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-brand-main-800 mb-2'>
						Access Denied
					</h1>
					<p className='text-brand-main-600'>
						You don't have permission to access this page.
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
