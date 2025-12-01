# Implementation Plan

- [x] 1. Update validation schema for optional amount paid

  - Modify `completeSaleSchema` in `lib/validations/sale.schema.ts` to make `amountPaid` optional
  - Update TypeScript types to reflect optional `amountPaid`
  - _Requirements: 6.1, 6.3_

- [x] 2. Update sale service to handle optional amount paid

  - Modify `completeSale` function in `lib/services/sale.service.ts` to default `amountPaid` to `sale.total` when not provided
  - Ensure `changeGiven` calculation handles all cases (negative, zero, positive)
  - _Requirements: 6.1, 6.2, 4.3_

- [x] 2.1 Write property test for default amount paid

  - **Property 11: Default amount paid for missing input**
  - **Validates: Requirements 6.1, 6.4**

- [x] 2.2 Write property test for optional amount paid completion

  - **Property 12: Optional amount paid allows completion**
  - **Validates: Requirements 6.3**

- [x] 3. Create CheckoutDialog component

  - Create new file `components/sales/checkout-dialog-v2.tsx`
  - Implement dialog with order summary display (items, subtotal, discount, tax, total)
  - Add "Complete Payment" button that triggers payment dialog
  - Add "Close" button that closes dialog and clears cart
  - Handle dialog open/close state via props
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.1 Write unit test for CheckoutDialog rendering

  - Test that all order summary fields are displayed
  - Test that both action buttons are present
  - _Requirements: 2.1, 2.2_

- [x] 4. Create PaymentDialog component

  - Create new file `components/sales/payment-dialog.tsx`
  - Display order total prominently
  - Add radio buttons for payment methods (CARD, CASH, MOBILE_MONEY, BANK_TRANSFER)
  - Add "Amount Paid" input field with number validation
  - Add "Change Given" read-only field
  - Add quick-fill button next to amount paid field
  - Implement change calculation logic (change = amountPaid - total)
  - Add receipt generation checkbox
  - Handle payment completion submission
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1_

- [x] 4.1 Write unit test for change calculation

  - Test change calculation with various inputs (underpayment, exact, overpayment)
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 4.2 Write property test for change calculation correctness

  - **Property 8: Change calculation correctness**
  - **Validates: Requirements 4.3, 4.4, 4.5**

- [ ]\* 4.3 Write property test for quick-fill functionality

  - **Property 9: Quick-fill sets exact amount**
  - **Validates: Requirements 5.2**

- [x] 4.4 Write property test for quick-fill idempotence

  - **Property 10: Quick-fill idempotence**
  - **Validates: Requirements 5.5**

- [x] 5. Update ShoppingCart component for pending order creation

  - Modify `onCheckout` handler to create pending order via API before opening checkout dialog
  - Handle loading state during pending order creation
  - Handle success: open CheckoutDialog with sale ID and order data
  - Handle failure: display error message, keep cart intact
  - Pass `isProcessing` prop to disable buttons during API calls
  - _Requirements: 1.1, 1.2, 1.3, 8.2_

- [ ]\* 5.1 Write property test for cart preservation on error

  - **Property 17: Failed order creation preserves cart**
  - **Validates: Requirements 8.2**

- [x] 5.2 Write property test for stock error messages

  - **Property 19: Stock error messages include item details**
  - **Validates: Requirements 8.1**

- [x] 6. Update NewSalePage component for new checkout flow

  - Add state for `showCheckoutDialog`, `showPaymentDialog`, `pendingSaleId`, `pendingSaleData`
  - Implement `handleCreatePendingOrder` to call API and open CheckoutDialog on success
  - Implement `handleCompletePayment` to open PaymentDialog with sale details
  - Implement `handleCompleteSale` to complete payment via API
  - Implement `handleCloseCheckout` to close dialog and clear cart
  - Update cart checkout handler to use new pending order flow
  - Handle error states and display error messages
  - _Requirements: 1.1, 1.2, 1.3, 2.3, 2.4, 3.4, 3.5_

- [ ] 6.1 Write property test for pending order creation preserves inventory

  - **Property 1: Pending order creation preserves inventory**
  - **Validates: Requirements 1.1, 1.4**

- [ ]\* 6.2 Write property test for pending order unique ID

  - **Property 2: Pending order has unique ID**
  - **Validates: Requirements 1.5**

- [ ]\* 6.3 Write property test for closing checkout preserves pending order

  - **Property 4: Closing checkout preserves pending order**
  - **Validates: Requirements 2.4**

- [ ]\* 6.4 Write property test for closing checkout clears cart

  - **Property 5: Closing checkout clears cart**
  - **Validates: Requirements 2.3**

- [ ]\* 6.5 Write property test for payment completion updates status

  - **Property 6: Payment completion updates status**
  - **Validates: Requirements 3.4**

- [ ]\* 6.6 Write property test for completed sale reduces inventory

  - **Property 7: Completed sale reduces inventory**
  - **Validates: Requirements 3.5**

- [ ]\* 6.7 Write property test for failed payment preserves pending status

  - **Property 18: Failed payment preserves pending status**
  - **Validates: Requirements 8.3**

- [x] 7. Update PendingOrdersList component for new payment flow

  - Modify "Complete" button handler to open PaymentDialog instead of directly completing
  - Pass sale details (ID, total) to PaymentDialog
  - Handle payment completion success: refresh pending orders list
  - Ensure current shopping cart is not affected when completing pending orders
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 7.1 Write property test for pending order completion displays correct total

  - **Property 13: Pending order completion displays correct total**
  - **Validates: Requirements 7.2**

- [ ]\* 7.2 Write property test for pending order completion updates specific record

  - **Property 14: Pending order completion updates specific record**
  - **Validates: Requirements 7.3**

- [ ]\* 7.3 Write property test for pending order completion preserves cart

  - **Property 15: Pending order completion preserves cart**
  - **Validates: Requirements 7.4**

- [ ]\* 7.4 Write property test for completed order removed from pending list

  - **Property 16: Completed order removed from pending list**
  - **Validates: Requirements 7.5**

- [x] 8. Integrate CheckoutDialog and PaymentDialog into sales flow

  - Wire CheckoutDialog to open after pending order creation
  - Wire PaymentDialog to open from CheckoutDialog "Complete Payment" button
  - Wire PaymentDialog to open from PendingOrdersList "Complete" button
  - Ensure proper dialog state management (only one dialog open at a time)
  - Handle dialog close events and cleanup
  - _Requirements: 2.2, 3.1, 7.1_

- [ ]\* 8.1 Write integration test for end-to-end checkout flow

  - Test: create cart → create pending order → complete payment → verify receipt
  - _Requirements: 1.1, 2.1, 3.4, 3.5_

- [ ]\* 8.2 Write integration test for deferred payment flow

  - Test: create cart → create pending order → close dialog → complete from pending list
  - _Requirements: 2.3, 2.4, 7.1, 7.3_

- [x] 9. Add loading states and error handling UI

  - Add spinner/loading indicators during API calls
  - Disable buttons during processing to prevent double-submission
  - Display user-friendly error messages for all error scenarios
  - Add retry buttons for network errors
  - Ensure error messages are accessible and clear
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]\* 9.1 Write unit tests for error message display

  - Test that error messages are displayed correctly for different error types
  - _Requirements: 8.1, 8.4_

- [x] 10. Add accessibility and UX improvements

  - Auto-focus amount paid field when payment dialog opens
  - Support Enter key to submit payment
  - Support Escape key to close dialogs
  - Add proper ARIA labels to all dialog elements
  - Ensure keyboard navigation works correctly
  - Test mobile responsiveness of dialogs
  - _Requirements: 4.1, 5.1_

- [x] 11. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Manual testing and verification
  - Test exact payment with quick-fill button
  - Test overpayment and underpayment scenarios
  - Test deferred payment flow
  - Test completing pending orders from list
  - Test error scenarios (insufficient stock, network errors)
  - Test all payment methods
  - Verify mobile responsiveness
