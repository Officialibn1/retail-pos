import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
	setUser,
	setLoading,
	logout,
	selectUser,
	selectIsAuthenticated,
	selectIsLoading,
	AuthState,
} from "../authSlice";
import { User, UserRole, Shift } from "@/lib/types";

// Helper to create a test store
const createTestStore = (initialState?: Partial<AuthState>) => {
	return configureStore({
		reducer: {
			auth: authReducer,
		},
		preloadedState: initialState
			? {
					auth: {
						user: null,
						isLoading: true,
						...initialState,
					},
			  }
			: undefined,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					// Ignore Date objects in User type for tests
					ignoredActionPaths: ["payload.createdAt", "payload.updatedAt"],
					ignoredPaths: ["auth.user.createdAt", "auth.user.updatedAt"],
				},
			}),
	});
};

// Mock user data
const mockUser: User = {
	id: "user-123",
	email: "test@example.com",
	username: "testuser",
	name: "Test User",
	password: "hashed_password",
	roles: [UserRole.CASHIER],
	shift: Shift.MORNING,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("authSlice", () => {
	describe("reducers", () => {
		it("should handle initial state", () => {
			const store = createTestStore();
			const state = store.getState().auth;

			expect(state.user).toBeNull();
			expect(state.isLoading).toBe(true);
		});

		it("should handle setUser with user data", () => {
			const store = createTestStore();

			store.dispatch(setUser(mockUser));
			const state = store.getState().auth;

			expect(state.user).toEqual(mockUser);
			expect(state.isLoading).toBe(false);
		});

		it("should handle setUser with null", () => {
			const store = createTestStore({ user: mockUser, isLoading: false });

			store.dispatch(setUser(null));
			const state = store.getState().auth;

			expect(state.user).toBeNull();
			expect(state.isLoading).toBe(false);
		});

		it("should handle setLoading", () => {
			const store = createTestStore({ isLoading: false });

			store.dispatch(setLoading(true));
			expect(store.getState().auth.isLoading).toBe(true);

			store.dispatch(setLoading(false));
			expect(store.getState().auth.isLoading).toBe(false);
		});

		it("should handle logout", () => {
			const store = createTestStore({ user: mockUser, isLoading: false });

			store.dispatch(logout());
			const state = store.getState().auth;

			expect(state.user).toBeNull();
			expect(state.isLoading).toBe(false);
		});
	});

	describe("selectors", () => {
		it("selectUser should return the current user", () => {
			const store = createTestStore({ user: mockUser, isLoading: false });
			const user = selectUser(store.getState());

			expect(user).toEqual(mockUser);
		});

		it("selectUser should return null when no user", () => {
			const store = createTestStore();
			const user = selectUser(store.getState());

			expect(user).toBeNull();
		});

		it("selectIsAuthenticated should return true when user exists", () => {
			const store = createTestStore({ user: mockUser, isLoading: false });
			const isAuthenticated = selectIsAuthenticated(store.getState());

			expect(isAuthenticated).toBe(true);
		});

		it("selectIsAuthenticated should return false when no user", () => {
			const store = createTestStore();
			const isAuthenticated = selectIsAuthenticated(store.getState());

			expect(isAuthenticated).toBe(false);
		});

		it("selectIsLoading should return the loading state", () => {
			const store = createTestStore({ isLoading: true });
			expect(selectIsLoading(store.getState())).toBe(true);

			store.dispatch(setLoading(false));
			expect(selectIsLoading(store.getState())).toBe(false);
		});
	});

	describe("authentication flow", () => {
		it("should handle complete login flow", () => {
			const store = createTestStore();

			// Initial state
			expect(selectIsAuthenticated(store.getState())).toBe(false);
			expect(selectIsLoading(store.getState())).toBe(true);

			// User logs in
			store.dispatch(setUser(mockUser));

			expect(selectUser(store.getState())).toEqual(mockUser);
			expect(selectIsAuthenticated(store.getState())).toBe(true);
			expect(selectIsLoading(store.getState())).toBe(false);
		});

		it("should handle complete logout flow", () => {
			const store = createTestStore({ user: mockUser, isLoading: false });

			// User is logged in
			expect(selectIsAuthenticated(store.getState())).toBe(true);

			// User logs out
			store.dispatch(logout());

			expect(selectUser(store.getState())).toBeNull();
			expect(selectIsAuthenticated(store.getState())).toBe(false);
			expect(selectIsLoading(store.getState())).toBe(false);
		});

		it("should handle session validation success", () => {
			const store = createTestStore();

			// Start loading
			store.dispatch(setLoading(true));
			expect(selectIsLoading(store.getState())).toBe(true);

			// Session validation succeeds
			store.dispatch(setUser(mockUser));

			expect(selectUser(store.getState())).toEqual(mockUser);
			expect(selectIsAuthenticated(store.getState())).toBe(true);
			expect(selectIsLoading(store.getState())).toBe(false);
		});

		it("should handle session validation failure", () => {
			const store = createTestStore();

			// Start loading
			store.dispatch(setLoading(true));
			expect(selectIsLoading(store.getState())).toBe(true);

			// Session validation fails
			store.dispatch(setUser(null));

			expect(selectUser(store.getState())).toBeNull();
			expect(selectIsAuthenticated(store.getState())).toBe(false);
			expect(selectIsLoading(store.getState())).toBe(false);
		});
	});
});
