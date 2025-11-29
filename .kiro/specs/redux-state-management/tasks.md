# Implementation Plan

- [x] 1. Install dependencies and configure Redux store

  - Install @reduxjs/toolkit, react-redux, redux-persist, and fast-check
  - Create store configuration with configureStore
  - Set up typed hooks (useAppDispatch, useAppSelector)
  - Configure Redux DevTools integration
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.1 Write property test for immutable state updates

  - **Property 1: Immutable state updates**
  - **Validates: Requirements 1.4**

- [x] 2. Create Redux Provider and wrap application

  - Create ReduxProvider component
  - Wrap app/layout.tsx with ReduxProvider
  - Verify store is accessible in components
  - _Requirements: 1.5_

- [x] 3. Implement auth slice

  - Create authSlice with state, actions, and reducers
  - Implement setUser, setLoading, and logout actions
  - Create typed selectors (selectUser, selectIsAuthenticated, selectIsLoading)
  - Export slice reducer and actions
  - _Requirements: 2.1, 2.2, 2.5, 2.6_

- [ ]\* 3.1 Write property test for auth state management

  - **Property 2: Auth state management**
  - **Validates: Requirements 2.1, 2.2**

- [ ]\* 3.2 Write property test for session validation success

  - **Property 3: Session validation success**
  - **Validates: Requirements 2.4**

- [ ]\* 3.3 Write property test for session validation failure

  - **Property 4: Session validation failure**
  - **Validates: Requirements 2.5**

- [x] 4. Update AuthProvider to use Redux internally

  - Modify AuthProvider to read from Redux store
  - Dispatch Redux actions for login/logout
  - Implement session validation using Redux
  - Maintain existing useAuth hook interface for compatibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.3_

- [x] 5. Implement cart slice with persistence

  - Create cartSlice with state, actions, and reducers
  - Implement addItem, updateQuantity, removeItem, setDiscount, clearCart actions
  - Implement validateCart action for stock validation
  - Create typed selectors (selectCartItems, selectCartSubtotal, selectCartTotal, etc)
  - Configure redux-persist for cart slice only
  - Set up PersistGate in application
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 8.1, 8.2, 8.3, 8.4_

- [ ]\* 5.1 Write property test for cart persistence

  - **Property 5: Cart persistence**
  - **Validates: Requirements 3.1, 3.5, 3.6**

- [ ]\* 5.2 Write property test for cart quantity validation

  - **Property 6: Cart quantity validation**
  - **Validates: Requirements 3.4**

- [ ]\* 5.3 Write property test for cart restoration validation

  - **Property 7: Cart restoration validation**
  - **Validates: Requirements 3.7**

- [ ]\* 5.4 Write property test for cart clearing on sale completion

  - **Property 8: Cart clearing on sale completion**
  - **Validates: Requirements 3.3, 8.5, 8.6**

- [x] 6. Configure RTK Query base API

  - Create base API with createApi
  - Configure baseQuery with fetchBaseQuery
  - Set up credentials: 'include' for cookie authentication
  - Define cache tag types (Auth, Inventory, Sales, Users, Customers, Categories, ActivityLogs, Analytics)
  - Configure cache behavior to not persist (memory only)
  - _Requirements: 4.1, 4.3, 4.8_

- [ ]\* 6.1 Write property test for RTK Query state management

  - **Property 9: RTK Query state management**
  - **Validates: Requirements 4.2, 7.6, 7.7**

- [ ]\* 6.2 Write property test for response caching

  - **Property 10: Response caching**
  - **Validates: Requirements 4.3**

- [ ]\* 6.3 Write property test for request deduplication

  - **Property 12: Request deduplication**
  - **Validates: Requirements 4.5**

- [x] 7. Define authentication endpoints

  - Create validateSession query endpoint with 'Auth' tag
  - Create login mutation endpoint that invalidates 'Auth' tag
  - Create logout mutation endpoint that invalidates 'Auth' tag
  - Specify TypeScript types for request/response
  - _Requirements: 5.1, 10.2_

- [x] 8. Define inventory endpoints

  - Create getInventory query endpoint with 'Inventory' tag
  - Create getInventoryItem query endpoint with 'Inventory' tag
  - Create createInventoryItem mutation that invalidates 'Inventory' tag
  - Create updateInventoryItem mutation that invalidates 'Inventory' tag
  - Create deleteInventoryItem mutation that invalidates 'Inventory' tag
  - Create adjustStock mutation that invalidates 'Inventory' tag
  - Specify TypeScript types for all endpoints
  - _Requirements: 5.2, 6.2, 10.2_

- [ ]\* 8.1 Write property test for cache invalidation on mutation

  - **Property 11: Cache invalidation on mutation**
  - **Validates: Requirements 4.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [x] 9. Define sales endpoints

  - Create getSales query endpoint with 'Sales' tag
  - Create getSale query endpoint with 'Sales' tag
  - Create createSale mutation that invalidates 'Sales' tag
  - Create completeSale mutation that invalidates 'Sales' and 'Inventory' tags
  - Create cancelSale mutation that invalidates 'Sales' and 'Inventory' tags
  - Specify TypeScript types for all endpoints
  - _Requirements: 5.3, 6.1, 10.2_

- [x] 10. Define user management endpoints

  - Create getUsers query endpoint with 'Users' tag
  - Create getUser query endpoint with 'Users' tag
  - Create createUser mutation that invalidates 'Users' tag
  - Create updateUser mutation that invalidates 'Users' tag
  - Create deleteUser mutation that invalidates 'Users' tag
  - Specify TypeScript types for all endpoints
  - _Requirements: 5.4, 6.3, 10.2_

- [x] 11. Define customer and category endpoints

  - Create getCustomers query endpoint with 'Customers' tag
  - Create createCustomer mutation that invalidates 'Customers' tag
  - Create updateCustomer mutation that invalidates 'Customers' tag
  - Create getCategories query endpoint with 'Categories' tag
  - Create createCategory mutation that invalidates 'Categories' tag
  - Create updateCategory mutation that invalidates 'Categories' tag
  - Create deleteCategory mutation that invalidates 'Categories' tag
  - Specify TypeScript types for all endpoints
  - _Requirements: 5.6, 5.7, 6.4, 6.5, 10.2_

- [x] 12. Define analytics and activity log endpoints

  - Create getDashboardStats query endpoint with 'Analytics' tag
  - Create getSalesByDate query endpoint with 'Analytics' tag
  - Create getTopProducts query endpoint with 'Analytics' tag
  - Create getPaymentMethods query endpoint with 'Analytics' tag
  - Create getInventoryAnalytics query endpoint with 'Analytics' tag
  - Create getActivityLogs query endpoint with 'ActivityLogs' tag and pagination support
  - Specify TypeScript types for all endpoints
  - _Requirements: 5.5, 5.8, 10.2_

- [ ]\* 12.1 Write property test for stale data refetching

  - **Property 13: Stale data refetching**
  - **Validates: Requirements 4.6**

- [ ]\* 12.2 Write property test for error propagation

  - **Property 14: Error propagation**
  - **Validates: Requirements 4.7, 10.6**

- [x] 13. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Migrate sales page to use RTK Query

  - Replace api.get('/api/inventory') with useGetInventoryQuery hook
  - Replace api.post('/api/sales') with useCreateSaleMutation hook
  - Replace api.post('/api/sales/:id/complete') with useCompleteSaleMutation hook
  - Update component to use isLoading, isError, and data from hooks
  - Remove manual loading and error state management
  - Update cart to use Redux cart slice
  - _Requirements: 7.2, 7.6, 7.7_

- [x] 15. Migrate inventory page to use RTK Query

  - Replace api.get('/api/inventory') with useGetInventoryQuery hook
  - Replace api.post('/api/inventory') with useCreateInventoryItemMutation hook
  - Replace api.put('/api/inventory/:id') with useUpdateInventoryItemMutation hook
  - Replace api.delete('/api/inventory/:id') with useDeleteInventoryItemMutation hook
  - Update component to use isLoading, isError, and data from hooks
  - Remove manual loading and error state management
  - _Requirements: 7.3, 7.6, 7.7_

- [x] 16. Migrate analytics page to use RTK Query

  - Replace api.get('/api/analytics/dashboard') with useGetDashboardStatsQuery hook
  - Replace api.get('/api/analytics/sales-by-date') with useGetSalesByDateQuery hook
  - Replace api.get('/api/analytics/top-products') with useGetTopProductsQuery hook
  - Replace api.get('/api/analytics/payment-methods') with useGetPaymentMethodsQuery hook
  - Replace api.get('/api/analytics/inventory') with useGetInventoryAnalyticsQuery hook
  - Update component to use isLoading, isError, and data from hooks
  - Remove manual loading and error state management
  - _Requirements: 7.4, 7.6, 7.7_

- [x] 17. Migrate users page to use RTK Query

  - Replace api.get('/api/users') with useGetUsersQuery hook
  - Replace api.post('/api/users') with useCreateUserMutation hook
  - Replace api.put('/api/users/:id') with useUpdateUserMutation hook
  - Replace api.delete('/api/users/:id') with useDeleteUserMutation hook
  - Update component to use isLoading, isError, and data from hooks
  - Remove manual loading and error state management
  - _Requirements: 7.5, 7.6, 7.7_

- [x] 18. Migrate remaining components to RTK Query

  - Migrate activity logs page to use useGetActivityLogsQuery hook
  - Migrate customer management to use customer endpoints
  - Migrate category management to use category endpoints
  - Update all components to use RTK Query hooks
  - Verify all API calls go through RTK Query
  - _Requirements: 7.6, 7.7_

- [x] 19. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Remove Context API and old API client

  - Remove Context-based AuthProvider implementation
  - Update useAuth hook to use Redux selectors directly
  - Remove lib/api-client.ts file
  - Update all imports to use RTK Query hooks
  - Verify no components use old API client
  - _Requirements: 9.4, 9.5_

- [x] 21. Add TypeScript type exports

  - Export RootState type from store
  - Export AppDispatch type from store
  - Export typed hooks (useAppDispatch, useAppSelector)
  - Verify all Redux usage is type-safe
  - Verify all RTK Query endpoints have proper types
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]\* 22. Write unit tests for Redux slices

  - Test auth slice reducers and selectors
  - Test cart slice reducers and selectors
  - Test store configuration
  - Test persistence configuration
  - Test typed hooks

- [ ]\* 23. Write integration tests

  - Test auth flow (login → store → logout → clear)
  - Test cart flow (add → update → persist → restore → clear)
  - Test cache invalidation flow (mutation → invalidate → refetch)
  - Test error handling flows

- [x] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
