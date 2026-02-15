"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
	setUser,
	setLoading,
	logout as logoutAction,
	selectUser,
	selectIsLoading,
} from "@/lib/store/slices/authSlice";
import {
	useValidateSessionQuery,
	useLoginMutation,
	useLogoutMutation,
	api,
} from "@/lib/store/api";
import { User } from "@/generated/prisma";

interface LoginCredentials {
	email: string;
	password: string;
}

/**
 * AuthProvider - Session validation on app initialization
 *
 * This component validates the user session when the application loads
 * and populates the Redux auth slice with user data if a valid session exists.
 *
 * Requirements:
 * - 2.3: Perform session validation on application initialization
 * - 2.4: Populate auth slice with user data on session validation success
 * - 2.5: Set user state to null on session validation failure
 * - 9.4: Remove Context API implementation after migration complete
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const dispatch = useAppDispatch();

	// Use RTK Query to validate session on mount
	// Requirement 2.3: Perform session validation on application initialization
	const {
		data: sessionData,
		isLoading,
		isError,
		error,
	} = useValidateSessionQuery();

	useEffect(() => {
		if (isLoading) {
			// Set loading state while validating session
			dispatch(setLoading(true));
		} else if (isError || !sessionData || error) {
			// Requirement 2.5: Set user state to null on session validation failure
			dispatch(setUser(null));
		} else {
			// Requirement 2.4: Populate auth slice with user data on session validation success
			// Convert UserData from API to User type
			const user: User = {
				...sessionData,
				roles: sessionData.roles as any,
				shift: sessionData.shift as any,
			};
			dispatch(setUser(user));
		}
	}, [sessionData, isLoading, isError, dispatch, error]);

	return <>{children}</>;
}

/**
 * Hook to access auth state and actions using Redux directly
 *
 * This hook replaces the Context API-based useAuth hook and provides
 * the same interface using Redux selectors and RTK Query mutations.
 *
 * Requirements:
 * - 2.6: Provide access to user information through hooks
 * - 9.4: Remove Context API implementation
 * - 9.5: Ensure no components use old API client
 */
export function useAuth() {
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const isLoading = useAppSelector(selectIsLoading);

	const [loginMutation, { isLoading: loggingIn }] = useLoginMutation();
	const [logoutMutation, { isLoading: loggingOut }] = useLogoutMutation();

	/**
	 * Login user with credentials
	 *
	 * Requirement 2.1: Store user data in Redux auth slice on successful login
	 */
	const login = useCallback(
		async (credentials: LoginCredentials) => {
			try {
				// Call login mutation using RTK Query
				const response = await loginMutation(credentials).unwrap();
				// JWT is automatically stored in HTTP-only cookie by the server
				// Requirement 2.1: Store user data in Redux auth slice
				// Convert UserData from API to User type
				const user: User = {
					...response.user,
					roles: response.user.roles as any,
					shift: response.user.shift as any,
				};
				dispatch(setUser(user));
			} catch (error) {
				// Re-throw error to be handled by the login form
				throw error;
			}
		},
		[loginMutation, dispatch],
	);

	/**
	 * Logout user and clear session
	 *
	 * Requirement 2.2: Clear user data from Redux auth slice on logout
	 * Also clears all RTK Query cache data
	 */
	const logout = useCallback(async () => {
		try {
			// Call logout mutation using RTK Query
			await logoutMutation().unwrap();
		} catch (error) {
			// Even if logout fails, clear local state
			console.error("Logout error:", error);
		} finally {
			// Requirement 2.2: Clear user data from Redux auth slice
			dispatch(logoutAction());

			// Clear all RTK Query cache data
			dispatch(api.util.resetApiState());
		}
	}, [logoutMutation, dispatch]);

	return { user, login, logout, isLoading, loggingIn, loggingOut };
}
