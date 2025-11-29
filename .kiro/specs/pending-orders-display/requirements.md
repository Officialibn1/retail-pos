# Requirements Document

## Introduction

This feature adds a pending orders list to the new sales page, allowing users to view, manage, and complete orders that are in PENDING status. Currently, when a sale is created, it starts in PENDING status but there is no UI to view or manage these pending orders. This feature will provide visibility into pending orders and enable users to complete or cancel them directly from the sales interface.

## Glossary

- **POS System**: The Point of Sale retail management application
- **Pending Order**: A sale record with status PENDING that has been created but not yet completed or cancelled
- **New Sales Page**: The page at `/dashboard/sales/new` where users create new sales transactions
- **Complete Action**: The operation that transitions a pending order to COMPLETED status, processes payment, and reduces inventory stock
- **Cancel Action**: The operation that transitions a pending order to CANCELLED status without affecting inventory

## Requirements

### Requirement 1

**User Story:** As a cashier, I want to see a list of pending orders on the new sales page, so that I can track orders that need to be completed or cancelled.

#### Acceptance Criteria

1. WHEN the new sales page loads THEN the POS System SHALL display a list of pending orders with status PENDING
2. WHEN displaying pending orders THEN the POS System SHALL show order ID, creation time, total amount, and item count for each order
3. WHEN no pending orders exist THEN the POS System SHALL display an empty state message
4. WHEN pending orders are updated THEN the POS System SHALL refresh the list automatically
5. WHERE the user has CASHIER role THEN the POS System SHALL display only pending orders created by that user

### Requirement 2

**User Story:** As a cashier, I want to view the details of a pending order, so that I can see what items are included before completing or cancelling it.

#### Acceptance Criteria

1. WHEN a user clicks on a pending order THEN the POS System SHALL display the order details including all items, quantities, and prices
2. WHEN displaying order details THEN the POS System SHALL show the customer information if associated with the order
3. WHEN displaying order details THEN the POS System SHALL show the user who created the order
4. WHEN order details are displayed THEN the POS System SHALL provide options to complete or cancel the order

### Requirement 3

**User Story:** As a cashier, I want to complete a pending order, so that I can finalize the transaction and process payment.

#### Acceptance Criteria

1. WHEN a user selects complete action on a pending order THEN the POS System SHALL display a payment dialog with payment method options
2. WHEN completing an order THEN the POS System SHALL validate that sufficient inventory stock exists for all items
3. WHEN an order is successfully completed THEN the POS System SHALL update the order status to COMPLETED, reduce inventory stock, and remove it from the pending list
4. WHEN an order completion fails THEN the POS System SHALL display an error message and keep the order in pending status
5. WHEN an order is completed THEN the POS System SHALL display a receipt dialog with print option

### Requirement 4

**User Story:** As a cashier, I want to cancel a pending order, so that I can remove orders that are no longer needed without affecting inventory.

#### Acceptance Criteria

1. WHEN a user selects cancel action on a pending order THEN the POS System SHALL display a confirmation dialog
2. WHEN a user confirms cancellation THEN the POS System SHALL update the order status to CANCELLED and remove it from the pending list
3. WHEN an order is cancelled THEN the POS System SHALL not affect inventory stock levels
4. WHEN an order cancellation fails THEN the POS System SHALL display an error message and keep the order in pending status

### Requirement 5

**User Story:** As a manager, I want to see all pending orders from all users, so that I can monitor and manage the overall sales workflow.

#### Acceptance Criteria

1. WHERE the user has MANAGER, ADMIN, or SUPERADMIN role THEN the POS System SHALL display pending orders from all users
2. WHEN displaying pending orders for managers THEN the POS System SHALL show the creator's name for each order
3. WHEN a manager completes or cancels any pending order THEN the POS System SHALL process the action successfully
