# Implementation Plan

- [x] 1. Update backend API to support query parameters for sales filtering

  - Modify `/app/api/sales/route.ts` to accept and parse query parameters (status, startDate, endDate, page, limit)
  - Update `listSales` function in `lib/services/sale.service.ts` to accept filters parameter
  - Add Prisma where clause building for status and date range filtering
  - Add pagination support with skip and take
  - Test API endpoint with various query parameter combinations
  - _Requirements: 1.1, 1.5, 5.1_

- [x] 2. Update RTK Query API to support sales query parameters

  - Modify `getSales` query in `lib/store/api/index.ts` to accept GetSalesParams
  - Update TypeScript interface for GetSalesParams with optional fields
  - Change query function to pass params directly to fetchBaseQuery
  - _Requirements: 1.1, 1.4_

- [x] 3. Create PendingOrderCard component

  - Create `components/sales/pending-order-card.tsx` file
  - Implement component to display order ID, creation time, total, item count
  - Add conditional display of creator name for manager+ roles
  - Include Complete and Cancel action buttons
  - Style with brand-main theme matching existing components
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 5.2_

- [x] 4. Create CancelOrderDialog component

  - Create `components/sales/cancel-order-dialog.tsx` file
  - Implement confirmation dialog using shadcn Dialog component
  - Display order total and confirmation message
  - Include Cancel and Confirm buttons
  - Handle loading state during cancellation
  - _Requirements: 4.1_

- [x] 5. Create PendingOrdersList component

  - Create `components/sales/pending-orders-list.tsx` file
  - Fetch pending sales using useGetSalesQuery with status=PENDING
  - Render list of PendingOrderCard components
  - Implement empty state when no pending orders exist
  - Handle loading state with skeleton loaders
  - Handle error state with error message display
  - Implement complete action handler that opens CheckoutDialog
  - Implement cancel action handler that opens CancelOrderDialog
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 4.1_

- [x] 6. Integrate PendingOrdersList into NewSalePage

  - Import PendingOrdersList component in `app/dashboard/sales/new/page.tsx`
  - Add PendingOrdersList above the product search section
  - Pass user information to PendingOrdersList
  - Handle complete action by opening CheckoutDialog with pending sale data
  - Handle cancel action by calling cancelSale mutation
  - Ensure CheckoutDialog can accept pre-filled sale data
  - _Requirements: 1.1, 3.1, 3.5, 4.1_

- [x] 7. Update CheckoutDialog to support completing pending orders

  - Modify CheckoutDialog to accept optional saleId prop
  - Update onCompleteSale handler to use completeSale mutation when saleId is provided
  - Ensure payment method selection works for pending orders
  - Maintain backward compatibility with new sales flow
  - _Requirements: 3.1, 3.3, 3.5_

- [ ] 8. Write unit tests for PendingOrderCard component

  - Test rendering of order information
  - Test action button clicks
  - Test conditional creator name display
  - Test disabled state during processing
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4_

- [ ] 9. Write unit tests for CancelOrderDialog component

  - Test dialog open/close behavior
  - Test confirmation button click
  - Test cancel button click
  - Test loading state
  - _Requirements: 4.1_

- [ ]\* 10. Write unit tests for PendingOrdersList component

  - Test empty state rendering
  - Test loading state rendering
  - Test error state rendering
  - Test list rendering with orders
  - Test complete action handler
  - Test cancel action handler
  - _Requirements: 1.1, 1.3, 3.1, 4.1_

- [ ]\* 11. Write property test for role-based order visibility

  - **Property 1: Role-based order visibility**
  - **Validates: Requirements 1.5, 5.1**
  - Generate random users with CASHIER and MANAGER roles
  - Generate random pending orders from different users
  - Test that CASHIER sees only their orders
  - Test that MANAGER sees all orders
  - Use fast-check with minimum 100 iterations
  - _Requirements: 1.5, 5.1_

- [ ]\* 12. Write property test for pending order display completeness

  - **Property 2: Pending order display completeness**
  - **Validates: Requirements 1.2, 5.2**
  - Generate random pending orders with various data
  - Test that all required fields are present in rendered output
  - Test creator name appears for manager+ roles
  - Use fast-check with minimum 100 iterations
  - _Requirements: 1.2, 5.2_

- [ ]\* 13. Write property test for order details display completeness

  - **Property 3: Order details display completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  - Generate random orders with and without customers
  - Test that all items, quantities, and prices are displayed
  - Test that customer info appears when present
  - Test that creator info is always present
  - Test that action buttons are present
  - Use fast-check with minimum 100 iterations
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]\* 14. Write property test for automatic list refresh

  - **Property 4: Automatic list refresh on updates**
  - **Validates: Requirements 1.4**
  - Generate random pending orders
  - Complete or cancel an order
  - Test that it no longer appears in pending list after cache refresh
  - Use fast-check with minimum 100 iterations
  - _Requirements: 1.4_

- [ ]\* 15. Write property test for stock validation on completion

  - **Property 5: Stock validation on completion**
  - **Validates: Requirements 3.2, 3.4**
  - Generate random orders with insufficient stock scenarios
  - Test that completion fails with appropriate error
  - Test that order remains in PENDING status
  - Use fast-check with minimum 100 iterations
  - _Requirements: 3.2, 3.4_

- [ ]\* 16. Write property test for complete order state transition

  - **Property 6: Complete order state transition**
  - **Validates: Requirements 3.3**
  - Generate random pending orders with sufficient stock
  - Complete the order
  - Test that status is COMPLETED
  - Test that inventory stock is reduced correctly
  - Test that order is removed from pending list
  - Use fast-check with minimum 100 iterations
  - _Requirements: 3.3_

- [ ]\* 17. Write property test for cancel order preserves inventory

  - **Property 7: Cancel order preserves inventory**
  - **Validates: Requirements 4.2, 4.3**
  - Generate random pending orders
  - Record inventory stock levels
  - Cancel the order
  - Test that status is CANCELLED
  - Test that inventory stock is unchanged
  - Test that order is removed from pending list
  - Use fast-check with minimum 100 iterations
  - _Requirements: 4.2, 4.3_

- [ ]\* 18. Write property test for manager permissions

  - **Property 8: Manager permissions for all orders**
  - **Validates: Requirements 5.3**
  - Generate random orders from different users
  - Generate manager user
  - Test that manager can complete any order
  - Test that manager can cancel any order
  - Use fast-check with minimum 100 iterations
  - _Requirements: 5.3_

- [ ] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
