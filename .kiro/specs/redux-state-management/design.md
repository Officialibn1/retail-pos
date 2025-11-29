# Design Document

## Overview

This design document outlines the implementation of Redux Toolkit and RTK Query for centralized state management and data fetching in the POS System. The implementation will replace the current Context API-based authentication with Redux slices, introduce persistent cart state management, and centralize all API calls through RTK Query endpoints with automatic caching and invalidation.

### Goals

- Implement Redux Toolkit as the centralized state management solution
- Replace Context API authentication with Redux auth slice
- Add persistent cart state using redux-persist
- Centralize all API calls through RTK Query endpoints
- Implement automatic cache invalidation for data consistency
- Maintain backward compatibility during migration
- Ensure full TypeScript type safety throughout

### Non-Goals

- Rewriting existing API routes (backend remains unchanged)
- Changing the UI/UX of existing components
- Implementing offline-first capabilities
- Adding real-time synchronization features

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                        │
│  (Pages, Dialogs, Tables, Forms)                            │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │ useSelector/useDispatch    │ RTK Query Hooks
             │                            │ (useGetInventoryQuery, etc)
             ▼                            ▼
┌────────────────────────────────────────────────────────────┐
│                      Redux Store                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Auth Slice  │  │  Cart Slice  │  │  RTK Query API  │   │
│  │              │  │              │  │                 │   │
│  │  - user      │  │  - items     │  │  - endpoints    │   │
│  │  - loading   │  │  - discount  │  │  - cache        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                           │                     │          │
│                    redux-persist         baseQuery         │
└───────────────────────────┼──────────────────────┼─────────┘
                            │                      │
                            ▼                      ▼
                    ┌──────────────┐      ┌──────────────┐
                    │ localStorage │      │  API Routes  │
                    └──────────────┘      └──────────────┘
```

### Store Configuration

The Redux store will be configured with:

- Redux Toolkit's `configureStore` for simplified setup
- RTK Query middleware for data fetching
- redux-persist middleware for cart persistence
- Redux DevTools integration for debugging
- Immer for immutable updates (built into Redux Toolkit)

### State Structure

```typescript
{
  auth: {
    user: User | null,
    isLoading: boolean
  },
  cart: {
    items: CartItem[],
    discount: number
  },
  api: {
    queries: { ... },
    mutations: { ... },
    provided: { ... },
    subscriptions: { ... }
  }
}
```

## Components and Interfaces

### 1. Store Configuration (`lib/store/index.ts`)

**Purpose**: Configure and export the Redux store with all middleware and persistence

**Key Functions**:

- `configureStore()`: Set up store with reducers and middleware
- `setupListeners()`: Enable RTK Query refetch behaviors
- Export typed hooks: `useAppDispatch`, `useAppSelector`

**Dependencies**:

- Redux Toolkit
- redux-persist
- RTK Query API slice
- Auth slice
- Cart slice

### 2. Auth Slice (`lib/store/slices/authSlice.ts`)

**Purpose**: Manage authentication state

**State Shape**:

```typescript
interface AuthState {
	user: User | null;
	isLoading: boolean;
}
```

**Actions**:

- `setUser(user: User | null)`: Set authenticated user
- `setLoading(loading: boolean)`: Set loading state
- `logout()`: Clear user state

**Selectors**:

- `selectUser`: Get current user
- `selectIsAuthenticated`: Check if user is logged in
- `selectIsLoading`: Get loading state

### 3. Cart Slice (`lib/store/slices/cartSlice.ts`)

**Purpose**: Manage shopping cart state with persistence

**State Shape**:

```typescript
interface CartState {
	items: CartItem[];
	discount: number;
}

interface CartItem {
	id: string;
	inventoryItemId: string;
	quantity: number;
	price: Decimal;
	product: InventoryItemWithCategory;
}
```

**Actions**:

- `addItem(product, quantity)`: Add item to cart
- `updateQuantity(itemId, quantity)`: Update item quantity
- `removeItem(itemId)`: Remove item from cart
- `setDiscount(discount)`: Set discount percentage
- `clearCart()`: Clear all items and discount
- `validateCart(inventory)`: Validate cart against current inventory

**Selectors**:

- `selectCartItems`: Get all cart items
- `selectCartDiscount`: Get discount percentage
- `selectCartSubtotal`: Calculate subtotal
- `selectCartTotal`: Calculate total with discount and tax
- `selectCartItemCount`: Get total item count

### 4. RTK Query API (`lib/store/api/index.ts`)

**Purpose**: Centralize all API calls with automatic caching

**Base Configuration**:

```typescript
createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include'
  }),
  tagTypes: [
    'Auth', 'Inventory', 'Sales', 'Users',
    'Customers', 'Categories', 'ActivityLogs', 'Analytics'
  ],
  endpoints: (builder) => ({ ... })
})
```

**Endpoint Categories**:

- Authentication endpoints
- Inventory endpoints
- Sales endpoints
- User management endpoints
- Customer endpoints
- Category endpoints
- Activity log endpoints
- Analytics endpoints

### 5. Redux Provider (`lib/store/provider.tsx`)

**Purpose**: Wrap application with Redux Provider and PersistGate

**Responsibilities**:

- Provide Redux store to all components
- Handle rehydration with PersistGate
- Show loading state during rehydration

### 6. Auth Provider Compatibility Layer (`components/auth/auth-provider.tsx`)

**Purpose**: Maintain backward compatibility during migration

**Approach**:

- Keep existing AuthProvider interface
- Internally use Redux for state management
- Sync Context with Redux state
- Remove after all components migrated

## Data Models

### Redux State Types

```typescript
// Root State
interface RootState {
	auth: AuthState;
	cart: CartState;
	api: ApiState;
}

// Auth State
interface AuthState {
	user: User | null;
	isLoading: boolean;
}

// Cart State
interface CartState {
	items: CartItem[];
	discount: number;
}

interface CartItem {
	id: string;
	inventoryItemId: string;
	quantity: number;
	price: Decimal;
	product: InventoryItemWithCategory;
}

// Typed Hooks
type AppDispatch = typeof store.dispatch;
type AppSelector = <T>(selector: (state: RootState) => T) => T;
```

### RTK Query Types

```typescript
// Base Query Error
interface ApiError {
	status: number;
	data: {
		message: string;
		code?: string;
		details?: any;
	};
}

// Query Result
interface QueryResult<T> {
	data?: T;
	error?: ApiError;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	refetch: () => void;
}

// Mutation Result
interface MutationResult<T> {
	data?: T;
	error?: ApiError;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	reset: () => void;
}
```

### Persistence Configuration

```typescript
interface PersistConfig {
	key: "root";
	storage: Storage;
	whitelist: ["cart"]; // Only persist cart
	version: 1;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Immutable state updates

_For any_ state update operation, modifying the returned state object should not affect the original state object in the Redux store.

**Validates: Requirements 1.4**

### Property 2: Auth state management

_For any_ user object, when login succeeds the auth slice should contain that user, and when logout is called the auth slice should be null.

**Validates: Requirements 2.1, 2.2**

### Property 3: Session validation success

_For any_ valid session token, when session validation succeeds, the auth slice should be populated with the user data from the validation response.

**Validates: Requirements 2.4**

### Property 4: Session validation failure

_For any_ invalid or expired session token, when session validation fails, the user state should be null and isLoading should be false.

**Validates: Requirements 2.5**

### Property 5: Cart persistence

_For any_ cart operation (add item, update quantity, remove item, apply discount), the cart state in Redux and localStorage should remain synchronized.

**Validates: Requirements 3.1, 3.5, 3.6**

### Property 6: Cart quantity validation

_For any_ cart item, when quantity is updated, the new quantity should not exceed the available stock for that inventory item.

**Validates: Requirements 3.4**

### Property 7: Cart restoration validation

_For any_ persisted cart state, when restored from localStorage, all inventory items should still exist and have sufficient stock, or be removed from the cart.

**Validates: Requirements 3.7**

### Property 8: Cart clearing on sale completion

_For any_ successful sale completion, the cart state should be cleared from both Redux and localStorage immediately.

**Validates: Requirements 3.3, 8.5, 8.6**

### Property 9: RTK Query state management

_For any_ RTK Query endpoint call, the hook result should provide isLoading, isError, and data properties with correct values throughout the request lifecycle.

**Validates: Requirements 4.2, 7.6, 7.7**

### Property 10: Response caching

_For any_ successful data fetch, the response should be cached in memory with the appropriate cache tags.

**Validates: Requirements 4.3**

### Property 11: Cache invalidation on mutation

_For any_ successful mutation, the relevant cache tags should be invalidated to trigger automatic refetching of affected queries.

**Validates: Requirements 4.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 12: Request deduplication

_For any_ data endpoint, when multiple components request the same data simultaneously, only one network request should be made and the result shared.

**Validates: Requirements 4.5**

### Property 13: Stale data refetching

_For any_ cached data that exceeds its configured cache lifetime, the system should automatically refetch the data when accessed.

**Validates: Requirements 4.6**

### Property 14: Error propagation

_For any_ failed network request, the error information should be available through the query hook result with status code and message.

**Validates: Requirements 4.7, 10.6**

## Error Handling

### Redux State Errors

**State Update Errors**:

- Validation errors in reducers should be caught and logged
- Invalid actions should be ignored with console warnings
- State should never be left in an inconsistent state

**Persistence Errors**:

- localStorage quota exceeded: Show user warning, continue without persistence
- localStorage unavailable: Gracefully degrade to memory-only storage
- Rehydration errors: Log error, start with empty cart state

### RTK Query Errors

**Network Errors**:

- Connection failures: Retry with exponential backoff (3 attempts)
- Timeout errors: Show user-friendly message, provide retry button
- Server errors (5xx): Log error, show generic error message

**API Errors**:

- 400 Bad Request: Display validation errors to user
- 401 Unauthorized: Clear auth state, redirect to login
- 403 Forbidden: Show permission denied message
- 404 Not Found: Show resource not found message
- 409 Conflict: Display conflict details to user

**Cache Errors**:

- Cache corruption: Clear affected cache entries, refetch
- Tag invalidation failures: Log warning, continue operation

### Type Errors

**Runtime Type Mismatches**:

- API response doesn't match expected type: Log error, use fallback data
- Invalid action payload: Ignore action, log warning
- Malformed persisted state: Clear persistence, start fresh

## Testing Strategy

### Unit Testing

**Framework**: Jest with React Testing Library

**Test Coverage**:

1. **Slice Tests**:

   - Test each reducer action updates state correctly
   - Test selectors return correct derived state
   - Test initial state is correct
   - Example: Test that `addItem` action adds item to cart array

2. **Store Configuration Tests**:

   - Test store is configured with correct middleware
   - Test DevTools integration is enabled in development
   - Test persistence configuration is correct
   - Example: Verify redux-persist middleware is included

3. **Hook Tests**:

   - Test custom hooks return correct values
   - Test hooks trigger re-renders on state changes
   - Example: Test `useAuth` returns current user

4. **Integration Tests**:
   - Test auth flow (login → store user → logout → clear user)
   - Test cart flow (add → update → persist → restore → clear)
   - Test cache invalidation flow (mutation → invalidate → refetch)

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:

- Minimum 100 iterations per property test
- Use seed for reproducible failures
- Generate realistic test data matching domain constraints

**Property Tests**:

Each property test must be tagged with a comment referencing the design document:

```typescript
// Feature: redux-state-management, Property 1: Immutable state updates
```

**Test Generators**:

1. **User Generator**: Generate random user objects with valid roles and shifts
2. **Cart Item Generator**: Generate random cart items with valid inventory references
3. **Inventory Generator**: Generate random inventory items with stock levels
4. **API Response Generator**: Generate random API responses with various status codes
5. **Session Token Generator**: Generate valid and invalid session tokens

**Property Test Implementation**:

1. **Property 1 - Immutable Updates**: Generate random state updates, verify original state unchanged
2. **Property 2 - Auth State**: Generate random users, test login/logout cycle
3. **Property 3 - Session Success**: Generate valid tokens, verify user populated
4. **Property 4 - Session Failure**: Generate invalid tokens, verify state cleared
5. **Property 5 - Cart Persistence**: Generate random cart operations, verify Redux/localStorage sync
6. **Property 6 - Quantity Validation**: Generate random quantities and stock levels, verify validation
7. **Property 7 - Cart Restoration**: Generate random cart states and inventory, verify validation
8. **Property 8 - Cart Clearing**: Generate random sales, verify cart cleared
9. **Property 9 - Query States**: Generate random endpoint calls, verify hook properties
10. **Property 10 - Caching**: Generate random fetches, verify cache populated
11. **Property 11 - Invalidation**: Generate random mutations, verify tags invalidated
12. **Property 12 - Deduplication**: Generate simultaneous requests, verify single network call
13. **Property 13 - Stale Refetch**: Generate stale cache entries, verify refetch triggered
14. **Property 14 - Error Propagation**: Generate random errors, verify error in hook result

### Testing Best Practices

- Mock API responses for consistent testing
- Use MSW (Mock Service Worker) for API mocking
- Test both success and error paths
- Verify TypeScript types compile correctly
- Test edge cases (empty cart, no user, network failures)
- Test persistence edge cases (quota exceeded, unavailable)
- Verify cache invalidation triggers correct refetches
- Test concurrent operations (multiple adds to cart)

## Implementation Plan

### Phase 1: Foundation (Store Setup)

1. Install dependencies (Redux Toolkit, RTK Query, redux-persist)
2. Configure Redux store with middleware
3. Set up typed hooks (useAppDispatch, useAppSelector)
4. Create Redux Provider component
5. Wrap application with Redux Provider

### Phase 2: Auth Migration

1. Create auth slice with actions and selectors
2. Implement session validation in auth slice
3. Update AuthProvider to use Redux internally
4. Migrate components to use Redux selectors
5. Remove Context API after migration complete

### Phase 3: Cart Implementation

1. Create cart slice with actions and selectors
2. Configure redux-persist for cart slice
3. Implement cart validation logic
4. Add PersistGate to application
5. Migrate cart components to use Redux

### Phase 4: RTK Query Setup

1. Create base API configuration
2. Define cache tag types
3. Implement baseQuery with error handling
4. Set up automatic refetching behaviors

### Phase 5: Endpoint Migration

1. Define authentication endpoints
2. Define inventory endpoints with cache tags
3. Define sales endpoints with invalidation
4. Define user management endpoints
5. Define customer and category endpoints
6. Define analytics endpoints
7. Define activity log endpoints

### Phase 6: Component Migration

1. Migrate auth provider to RTK Query
2. Migrate sales page to use inventory query
3. Migrate inventory page to use mutations
4. Migrate analytics page to use queries
5. Migrate users page to use queries/mutations
6. Remove old API client usage

### Phase 7: Testing & Validation

1. Write unit tests for slices
2. Write property-based tests for correctness properties
3. Write integration tests for flows
4. Test persistence edge cases
5. Test cache invalidation scenarios
6. Verify TypeScript types throughout

### Phase 8: Cleanup

1. Remove Context API implementation
2. Remove unused API client code
3. Update documentation
4. Performance testing and optimization

## Migration Strategy

### Backward Compatibility

During migration, both Context API and Redux will coexist:

1. **AuthProvider Compatibility Layer**:

   - Keep existing AuthProvider interface
   - Internally read from Redux store
   - Sync Context with Redux state
   - Components can use either `useAuth()` or `useAppSelector(selectUser)`

2. **Gradual Component Migration**:

   - Migrate one page at a time
   - Test thoroughly after each migration
   - Keep old API client until all components migrated

3. **Feature Flags**:
   - Use environment variable to toggle Redux/Context
   - Allows rollback if issues discovered
   - Remove after migration complete

### Migration Checklist

- [ ] Redux store configured and working
- [ ] Auth slice implemented
- [ ] Cart slice implemented with persistence
- [ ] RTK Query API configured
- [ ] All endpoints defined
- [ ] AuthProvider using Redux internally
- [ ] All pages migrated to RTK Query
- [ ] All tests passing
- [ ] Context API removed
- [ ] Old API client removed
- [ ] Documentation updated

## Performance Considerations

### Optimization Strategies

1. **Selector Memoization**:

   - Use `createSelector` from Reselect for derived state
   - Prevent unnecessary re-renders
   - Example: Memoize cart total calculation

2. **Component Optimization**:

   - Use `React.memo` for components that read Redux state
   - Use `useCallback` for action dispatchers
   - Avoid selecting entire state objects

3. **RTK Query Optimization**:

   - Configure appropriate cache lifetimes
   - Use `keepUnusedDataFor` to control cache retention
   - Implement optimistic updates for better UX
   - Use `providesTags` and `invalidatesTags` efficiently

4. **Persistence Optimization**:
   - Debounce localStorage writes
   - Only persist necessary cart data
   - Use compression for large cart states

### Performance Metrics

- Redux action dispatch: < 1ms
- Selector execution: < 1ms
- localStorage write: < 10ms
- Cache lookup: < 1ms
- Component re-render: < 16ms (60fps)

## Security Considerations

### Authentication Security

- JWT tokens stored in HTTP-only cookies (not in Redux)
- Never persist auth tokens to localStorage
- Clear auth state on 401 responses
- Validate session on application load

### Data Security

- Sanitize data before storing in Redux
- Validate data from localStorage before rehydration
- Clear sensitive data on logout
- Use HTTPS for all API calls

### XSS Prevention

- Never render unsanitized data from Redux
- Validate all user inputs before dispatch
- Use TypeScript for type safety
- Sanitize data from external sources

## Deployment Considerations

### Build Configuration

- Enable Redux DevTools only in development
- Minify Redux code in production
- Remove console logs in production
- Use production builds of Redux Toolkit

### Monitoring

- Log Redux actions in development
- Track Redux performance metrics
- Monitor localStorage usage
- Alert on cache invalidation failures

### Rollback Plan

- Keep Context API code until migration verified
- Feature flag to toggle Redux/Context
- Database unchanged (backend unaffected)
- Can revert to previous version if needed
