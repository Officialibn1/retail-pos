import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";
import { RootState } from "../index";

/**
 * Auth Slice State Interface
 *
 * Manages authentication state for the application
 */
export interface AuthState {
	user: User | null;
	isLoading: boolean;
}

/**
 * Initial state for the auth slice
 */
const initialState: AuthState = {
	user: null,
	isLoading: true, // Start as loading to check for existing session
};

/**
 * Auth Slice
 *
 * Manages authentication state including user data and loading state.
 * Provides actions for login, logout, and session management.
 *
 * Requirements: 2.1, 2.2, 2.5, 2.6
 */
export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		/**
		 * Set the authenticated user
		 *
		 * @param state - Current auth state
		 * @param action - Action containing user data or null
		 *
		 * Requirement 2.1: Store user data in Redux auth slice on successful login
		 * Requirement 2.4: Populate auth slice with user data on session validation success
		 */
		setUser: (state, action: PayloadAction<User | null>) => {
			state.user = action.payload;
			state.isLoading = false;
		},

		/**
		 * Set the loading state
		 *
		 * @param state - Current auth state
		 * @param action - Action containing loading boolean
		 *
		 * Used during session validation and authentication operations
		 */
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		/**
		 * Clear user state on logout
		 *
		 * @param state - Current auth state
		 *
		 * Requirement 2.2: Clear user data from Redux auth slice on logout
		 * Requirement 2.5: Set user state to null on session validation failure
		 */
		logout: (state) => {
			state.user = null;
			state.isLoading = false;
		},
	},
});

// Export actions
export const { setUser, setLoading, logout } = authSlice.actions;

// Selectors

/**
 * Select the current user from auth state
 *
 * @param state - Root Redux state
 * @returns Current user or null
 *
 * Requirement 2.6: Provide access to user information through typed selector hooks
 */
export const selectUser = (state: RootState): User | null => state.auth.user;

/**
 * Select whether user is authenticated
 *
 * @param state - Root Redux state
 * @returns True if user is logged in, false otherwise
 *
 * Requirement 2.6: Provide access to authentication status through typed selector hooks
 */
export const selectIsAuthenticated = (state: RootState): boolean =>
	state.auth.user !== null;

/**
 * Select the loading state
 *
 * @param state - Root Redux state
 * @returns True if authentication is loading, false otherwise
 *
 * Requirement 2.6: Provide access to loading state through typed selector hooks
 */
export const selectIsLoading = (state: RootState): boolean =>
	state.auth.isLoading;

// Export reducer
export default authSlice.reducer;
