# Requirements Document

## Introduction

This feature enhances the checkout process in the POS system by introducing a two-stage order flow. When users initiate checkout, an order is first created with PENDING status. Users can then choose to either complete the payment immediately or defer it for later. The payment completion interface includes enhanced fields for amount paid and change calculation, with a quick-fill button for exact payment scenarios.

## Glossary

- **POS System**: The Point of Sale retail management application
- **Checkout Dialog**: A modal interface that displays order summary and payment options
- **Payment Dialog**: A modal interface for completing payment with amount paid and change calculation
- **Pending Order**: A sale record with status PENDING that has been created but not yet paid
- **Quick-Fill Button**: A UI button that automatically populates the amount paid field with the exact order total
- **Change Given**: The difference between amount paid and order total, calculated automatically

## Requirements

### Requirement 1

**User Story:** As a cashier, I want to create a pending order when I click checkout, so that the order is saved before payment is processed.

#### Acceptance Criteria

1. WHEN a user clicks the "Proceed to Checkout" button with items in the cart, THEN the POS System SHALL create a new sale record with status PENDING
2. WHEN the pending order creation succeeds, THEN the POS System SHALL open the checkout dialog displaying the order summary and clear cart
3. WHEN the pending order creation fails, THEN the POS System SHALL display an error message and keep the cart intact
4. WHEN a pending order is created, THEN the POS System SHALL NOT reduce inventory stock until payment is completed
5. WHEN a pending order is created, THEN the POS System SHALL assign a unique sale ID to the order

### Requirement 2

**User Story:** As a cashier, I want to see order details in the checkout dialog after creating a pending order, so that I can review the order before completing payment.

#### Acceptance Criteria

1. WHEN the checkout dialog opens after pending order creation, THEN the POS System SHALL display the order summary including item count, subtotal, discount, tax, and total
2. WHEN the checkout dialog is displayed, THEN the POS System SHALL show two action buttons: "Complete Payment" and "Close"
3. WHEN the user clicks "Close" in the checkout dialog, THEN the POS System SHALL close the dialog and clear the shopping cart
4. WHEN the user clicks "Close" in the checkout dialog, THEN the POS System SHALL keep the pending order in the system for later completion
5. WHEN the checkout dialog is closed, THEN the POS System SHALL allow the user to start a new order

### Requirement 3

**User Story:** As a cashier, I want to complete payment for a pending order, so that I can finalize the transaction and update inventory.

#### Acceptance Criteria

1. WHEN a user clicks "Complete Payment" in the checkout dialog, THEN the POS System SHALL open the payment dialog with payment method options
2. WHEN the payment dialog opens, THEN the POS System SHALL display the order total prominently
3. WHEN the payment dialog opens, THEN the POS System SHALL provide radio button options for payment methods: CARD, CASH, MOBILE_MONEY, and BANK_TRANSFER
4. WHEN the user selects a payment method and confirms, THEN the POS System SHALL complete the sale and update the order status to COMPLETED
5. WHEN a sale is completed, THEN the POS System SHALL reduce inventory stock for all items in the order

### Requirement 4

**User Story:** As a cashier, I want to enter the amount paid by the customer, so that the system can calculate change automatically.

#### Acceptance Criteria

1. WHEN the payment dialog is displayed, THEN the POS System SHALL show an "Amount Paid" input field
2. WHEN the payment dialog is displayed, THEN the POS System SHALL show a "Change Given" read-only field
3. WHEN a user enters a value in the "Amount Paid" field, THEN the POS System SHALL calculate and display the change as the difference between amount paid and order total
4. WHEN the amount paid is less than the order total, THEN the POS System SHALL display the change as a negative value or zero
5. WHEN the amount paid equals or exceeds the order total, THEN the POS System SHALL display the positive change amount

### Requirement 5

**User Story:** As a cashier, I want a quick-fill button for exact payments, so that I can quickly process transactions where the customer pays the exact amount.

#### Acceptance Criteria

1. WHEN the payment dialog is displayed, THEN the POS System SHALL show a quick-fill button next to the "Amount Paid" field
2. WHEN a user clicks the quick-fill button, THEN the POS System SHALL populate the "Amount Paid" field with the exact order total
3. WHEN the quick-fill button is clicked, THEN the POS System SHALL update the "Change Given" field to show zero
4. WHEN the "Amount Paid" field is populated via quick-fill, THEN the POS System SHALL allow the user to manually edit the value afterward
5. WHEN the quick-fill button is clicked multiple times, THEN the POS System SHALL consistently set the amount paid to the current order total

### Requirement 6

**User Story:** As a cashier, I want the amount paid and change fields to be optional, so that I can complete transactions without entering payment details when not needed.

#### Acceptance Criteria

1. WHEN a user completes a payment without entering an amount paid, THEN the POS System SHALL accept the transaction and set amount paid to the order total
2. WHEN a user completes a payment without entering an amount paid, THEN the POS System SHALL set change given to zero
3. WHEN amount paid and change given are not provided, THEN the POS System SHALL still complete the sale successfully
4. WHEN completing a sale with CARD or BANK_TRANSFER payment methods, THEN the POS System SHALL default amount paid to order total if not specified
5. WHEN completing a sale with CASH payment method, THEN the POS System SHALL allow but not require amount paid entry

### Requirement 7

**User Story:** As a cashier, I want to complete pending orders from the pending orders list, so that I can process deferred payments.

#### Acceptance Criteria

1. WHEN a user clicks "Complete" on a pending order in the pending orders list, THEN the POS System SHALL open the payment dialog for that specific order
2. WHEN the payment dialog opens for a pending order, THEN the POS System SHALL display the order total from the pending sale record
3. WHEN a user completes payment for a pending order, THEN the POS System SHALL update that specific sale record to COMPLETED status
4. WHEN a pending order is completed, THEN the POS System SHALL NOT clear the current shopping cart
5. WHEN a pending order is completed, THEN the POS System SHALL remove it from the pending orders list

### Requirement 8

**User Story:** As a cashier, I want the system to handle errors gracefully during checkout, so that I don't lose order data when issues occur.

#### Acceptance Criteria

1. WHEN pending order creation fails due to insufficient stock, THEN the POS System SHALL display a specific error message indicating which items are out of stock
2. WHEN pending order creation fails, THEN the POS System SHALL keep all cart items and user inputs intact
3. WHEN payment completion fails, THEN the POS System SHALL keep the order in PENDING status
4. WHEN payment completion fails, THEN the POS System SHALL display an error message and allow the user to retry
5. WHEN network errors occur during checkout, THEN the POS System SHALL display a user-friendly error message with retry options
