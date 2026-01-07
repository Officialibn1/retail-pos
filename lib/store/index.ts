import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import { api } from "./api";

/**
 * Redux Persist Configuration for Cart Slice
 *
 * Only the cart slice is persisted to localStorage.
 * Auth state is not persisted for security reasons (JWT in HTTP-only cookies).
 *
 * Requirement 8.1: Use localStorage as the storage engine
 * Requirement 8.2: Persist only the cart slice, not the entire Redux state
 */
const cartPersistConfig = {
	key: "cart",
	storage,
	version: 1,
};

// Create persisted cart reducer
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

/**
 * Configure the Redux store with Redux Toolkit
 *
 * Features:
 * - Redux DevTools integration (enabled automatically in development)
 * - Immer for immutable state updates (built into Redux Toolkit)
 * - redux-persist for cart persistence
 * - RTK Query middleware for data fetching and caching
 *
 * Requirements: 1.1, 1.2, 1.3, 4.1, 8.1, 8.2
 */
export const store = configureStore({
	reducer: {
		auth: authReducer,
		cart: persistedCartReducer,
		// RTK Query API reducer (task 6)
		[api.reducerPath]: api.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore redux-persist actions
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				// Ignore Date objects and Prisma Decimal in state
				ignoredActionPaths: [
					"payload.createdAt",
					"payload.updatedAt",
					"payload.deletedAt",
					"payload.product",
					"payload.price",
				],
				ignoredPaths: [
					"auth.user.createdAt",
					"auth.user.updatedAt",
					"cart.items",
				],
			},
		}).concat(api.middleware), // Add RTK Query middleware
	devTools: process.env.NODE_ENV !== "production",
});

/**
 * Create persistor for redux-persist
 *
 * This is used by PersistGate to delay rendering until rehydration is complete
 *
 * Requirement 8.3: Rehydrate cart state from localStorage before rendering
 */
export const persistor = persistStore(store);

/**
 * Set up RTK Query listeners for automatic refetching
 *
 * This enables behaviors like:
 * - refetchOnFocus: Refetch data when window regains focus
 * - refetchOnReconnect: Refetch data when network reconnects
 *
 * Requirement 4.6: Refetch stale data based on configured policies
 */
setupListeners(store.dispatch);

/**
 * TypeScript Type Exports
 *
 * These types provide full type safety for Redux usage throughout the application.
 *
 * Requirement 10.1: Export RootState type from store
 * Requirement 10.2: Export AppDispatch type from store
 * Requirement 10.3: Export typed hooks (useAppDispatch, useAppSelector)
 */

/**
 * RootState Type
 *
 * Inferred from the store's getState method.
 * Use this type when manually typing selectors or accessing state.
 *
 * Example:
 * ```typescript
 * const selectCustomValue = (state: RootState) => state.auth.user?.name;
 * ```
 *
 * Requirement 10.1: Export RootState type from store
 * Requirement 10.4: Infer types automatically from root state type
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch Type
 *
 * Inferred from the store's dispatch method.
 * Use this type when manually typing dispatch functions.
 *
 * Example:
 * ```typescript
 * const dispatch: AppDispatch = useAppDispatch();
 * ```
 *
 * Requirement 10.2: Export AppDispatch type from store
 * Requirement 10.5: Enforce correct argument types based on endpoint definitions
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Typed Redux Hooks
 *
 * These hooks are typed versions of useDispatch and useSelector from react-redux.
 * They provide automatic type inference for state and dispatch throughout the application.
 *
 * Usage:
 * ```typescript
 * // Instead of: const dispatch = useDispatch();
 * const dispatch = useAppDispatch();
 *
 * // Instead of: const user = useSelector((state: RootState) => state.auth.user);
 * const user = useAppSelector((state) => state.auth.user); // state is automatically typed
 * ```
 *
 * Requirement 10.3: Export typed hooks (useAppDispatch, useAppSelector)
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> =
	useSelector as TypedUseSelectorHook<RootState>;
