# Design Document

## Overview

This feature adds a pending orders management interface to the new sales page. The system will display a list of orders with PENDING status, allowing users to view details and take actions (complete or cancel) on these orders. The implementation leverages the existing backend infrastructure that already supports pending sales through the Sale model with SaleStatus enum.

The feature integrates seamlessly with the current sales workflow where creating a sale initially sets it to PENDING status. This design provides visibility and management capabilities for these pending orders that were previously created but not visible in the UI.

## Architecture

The feature follows the existing application architecture:

- **Frontend**: React components using Next.js 14 App Router
- **State Management**: Redux Toolkit with RTK Query for data fetching
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL with existing Sale model

### Component Hierarchy

```
NewSalePage
├── PendingOrdersList (new)
│   ├── PendingOrderCard (new)
│   │   └── PendingOrderActions (new)
│   └── EmptyState (new)
├── ProductSearch (existing)
├── ShoppingCart (existing)
├── CheckoutDialog (existing)
└── ReceiptPrintDialog (existing)
```

### Data Flow

1. **Query Pending Orders**: RTK Query fetches pending sales from `/api/sales` filtered by status
2. **Display Orders**: PendingOrdersList component renders the list with role-based filtering
3. **User Actions**: User clicks complete or cancel on a pending order
4. **Mutation**: RTK Query mutation calls appropriate API endpoint
5. **Cache Invalidation**: Sales cache is invalidated, triggering automatic refetch
6. **UI Update**: List updates automatically with new data

## Components and Interfaces

### New Components

#### 1. PendingOrdersList Component

**Purpose**: Container component that fetches and displays pending orders

**Props**:

```typescript
interface PendingOrdersListProps {
	userId: string;
	userRoles: UserRole[];
}
```

**Responsibilities**:

- Fetch pending sales using RTK Query with status=PENDING parameter
- Render list of PendingOrderCard components
- Handle loading and error states
- Display empty state when no pending orders exist
- Note: Role-based filtering is handled automatically on the backend

#### 2. PendingOrderCard Component

**Purpose**: Displays individual pending order information

**Props**:

```typescript
interface PendingOrderCardProps {
	sale: SaleWithDetails;
	onComplete: (saleId: string) => void;
	onCancel: (saleId: string) => void;
	isProcessing: boolean;
}
```

**Displayed Information**:

- Order ID (truncated)
- Creation timestamp (relative time)
- Total amount
- Item count
- Creator name (for managers viewing all orders)
- Action buttons (Complete, Cancel)

#### 3. PendingOrderActions Component

**Purpose**: Action buttons for completing or cancelling orders

**Props**:

```typescript
interface PendingOrderActionsProps {
	saleId: string;
	onComplete: () => void;
	onCancel: () => void;
	isProcessing: boolean;
}
```

**Features**:

- Complete button triggers checkout dialog
- Cancel button shows confirmation dialog
- Disabled state during processing

#### 4. CancelOrderDialog Component

**Purpose**: Confirmation dialog for cancelling orders

**Props**:

```typescript
interface CancelOrderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isProcessing: boolean;
	orderTotal: number;
}
```

### Modified Components

#### NewSalePage

**Changes**:

- Add PendingOrdersList component above the product search section
- Pass user information to PendingOrdersList
- Handle complete action by opening CheckoutDialog with pending sale data
- Handle cancel action by calling cancelSale mutation

### RTK Query API Extensions

#### Modified Query: getSales

Update the existing `getSales` query to accept optional parameters:

```typescript
interface GetSalesParams {
	status?: SaleStatus;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

getSales: builder.query<SaleWithDetails[], GetSalesParams | void>({
	query: (params) => ({
		url: "/api/sales",
		method: "GET",
		params,
	}),
	providesTags: ["Sales"],
});
```

**Features**:

- Accepts optional status filter (e.g., PENDING, COMPLETED, CANCELLED)
- Accepts optional date range for filtering by creation date
- Accepts optional pagination parameters (page, limit) for future use
- Role-based filtering is handled automatically on the backend
- Cached with "Sales" tag for automatic invalidation

**Usage in NewSalePage**:

```typescript
// Fetch only pending sales - role filtering is automatic on backend
const { data: pendingSales = [] } = useGetSalesQuery({ status: "PENDING" });
```

### Backend API

#### Modified Endpoint: GET /api/sales

Update the existing `/api/sales` endpoint to accept query parameters:

**Query Parameters**:

- `status` (optional): Filter by sale status (PENDING, COMPLETED, CANCELLED)
- `startDate` (optional): Filter sales created on or after this date (ISO 8601 format)
- `endDate` (optional): Filter sales created on or before this date (ISO 8601 format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 50)

**Example Requests**:

- `/api/sales?status=PENDING` - Returns only pending sales (with role-based filtering)
- `/api/sales?status=COMPLETED&startDate=2024-01-01&endDate=2024-01-31` - Returns completed sales in January 2024
- `/api/sales?page=2&limit=20` - Returns page 2 with 20 results per page

#### Modified Service: listSales

Update the `listSales` function in `lib/services/sale.service.ts` to accept filter parameters:

```typescript
interface SalesFilters {
	status?: SaleStatus;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export async function listSales(
	userId?: string,
	userRoles?: UserRole[],
	filters?: SalesFilters,
): Promise<SaleWithDetails[]>;
```

**Implementation**:

- Apply role-based filtering first (CASHIER sees only their sales, MANAGER+ sees all)
- Apply status filter if provided
- Apply date range filter if provided
- Apply pagination if provided
- Return filtered and sorted results

**Note**: Role-based filtering is handled entirely on the backend. The client does not need to filter results.

## Data Models

### Existing Models (No Changes Required)

The feature uses existing Prisma models:

**Sale Model**:

```prisma
model Sale {
  id            String         @id @default(cuid())
  total         Decimal        @db.Decimal(10, 2)
  status        SaleStatus     @default(PENDING)
  paymentMethod PaymentMethod?
  amountPaid    Decimal?       @db.Decimal(10, 2)
  changeGiven   Decimal?       @db.Decimal(10, 2)
  completedAt   DateTime?
  cancelledAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String
  customerId    String?
  items         SaleItem[]
  user          User           @relation(...)
  customer      Customer?      @relation(...)
}

enum SaleStatus {
  PENDING
  COMPLETED
  CANCELLED
}
```

### Type Definitions

```typescript
// Pending order display data
interface PendingOrderDisplay {
	id: string;
	total: number;
	createdAt: string;
	itemCount: number;
	creatorName: string;
	items: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Role-based order visibility

_For any_ user with CASHIER role, querying pending orders should return only orders created by that user. _For any_ user with MANAGER, ADMIN, or SUPERADMIN role, querying pending orders should return all pending orders from all users.
**Validates: Requirements 1.5, 5.1**

### Property 2: Pending order display completeness

_For any_ pending order displayed in the list, the rendered output should contain the order ID, creation time, total amount, item count, and (for manager+ roles) the creator's name.
**Validates: Requirements 1.2, 5.2**

### Property 3: Order details display completeness

_For any_ pending order details view, the rendered output should contain all items with their quantities and prices, the user who created the order, action buttons for complete and cancel, and customer information if a customer is associated with the order.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Automatic list refresh on updates

_For any_ pending order, when it is completed or cancelled, it should no longer appear in the pending orders list after the cache is refreshed.
**Validates: Requirements 1.4**

### Property 5: Stock validation on completion

_For any_ pending order, attempting to complete it when insufficient inventory stock exists for any item should fail with an error, and the order should remain in PENDING status.
**Validates: Requirements 3.2, 3.4**

### Property 6: Complete order state transition

_For any_ pending order with sufficient inventory stock, when successfully completed with payment information, the order status should be COMPLETED, inventory stock should be reduced by the order quantities, and the order should not appear in the pending orders list.
**Validates: Requirements 3.3**

### Property 7: Cancel order preserves inventory

_For any_ pending order, when cancelled, the order status should be CANCELLED, inventory stock levels should remain unchanged, and the order should not appear in the pending orders list.
**Validates: Requirements 4.2, 4.3**

### Property 8: Manager permissions for all orders

_For any_ pending order and any user with MANAGER, ADMIN, or SUPERADMIN role, that user should be able to successfully complete or cancel the order regardless of who created it.
**Validates: Requirements 5.3**

## Error Handling

### Client-Side Error Handling

1. **Network Errors**: Display toast notification with retry option
2. **Validation Errors**: Show inline error messages with specific field issues
3. **Permission Errors**: Display appropriate message and hide unauthorized actions
4. **Loading States**: Show skeleton loaders during data fetching

### Backend Error Handling

1. **Insufficient Stock**: Return 400 error with specific item and stock information
2. **Order Not Found**: Return 404 error
3. **Invalid Status Transition**: Return 400 error with current status information
4. **Permission Denied**: Return 403 error
5. **Database Errors**: Return 500 error with generic message (log details server-side)

### Error Recovery

1. **Failed Completion**: Order remains in PENDING status, user can retry
2. **Failed Cancellation**: Order remains in current status, user can retry
3. **Stale Data**: RTK Query automatically refetches on window focus
4. **Concurrent Modifications**: Last write wins, cache invalidation ensures consistency

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and component behavior:

1. **Component Rendering**:

   - PendingOrdersList renders empty state when no orders exist
   - PendingOrderCard displays order information correctly
   - Action buttons are disabled during processing

2. **Role-Based Filtering**:

   - CASHIER user sees only their own orders
   - MANAGER user sees all orders with creator names

3. **User Interactions**:

   - Clicking complete button opens checkout dialog
   - Clicking cancel button shows confirmation dialog
   - Confirming cancellation calls the correct mutation

4. **Error States**:
   - Network error displays error message
   - Insufficient stock shows appropriate error
   - Permission denied hides unauthorized actions

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library):

Each property-based test will run a minimum of 100 iterations with randomly generated data.

1. **Property 1: Role-based order visibility**

   - Generate: Random users with different roles, random pending orders
   - Test: Verify CASHIER sees only their orders, MANAGER+ sees all orders
   - Tag: **Feature: pending-orders-display, Property 1: Role-based order visibility**

2. **Property 2: Pending order display completeness**

   - Generate: Random pending orders with various data
   - Test: Verify all required fields are present in rendered output
   - Tag: **Feature: pending-orders-display, Property 2: Pending order display completeness**

3. **Property 3: Order details display completeness**

   - Generate: Random orders with and without customers
   - Test: Verify all required information is present in details view
   - Tag: **Feature: pending-orders-display, Property 3: Order details display completeness**

4. **Property 4: Automatic list refresh on updates**

   - Generate: Random pending orders
   - Test: Complete/cancel order, verify it's removed from pending list
   - Tag: **Feature: pending-orders-display, Property 4: Automatic list refresh on updates**

5. **Property 5: Stock validation on completion**

   - Generate: Random orders with insufficient stock scenarios
   - Test: Verify completion fails and order remains PENDING
   - Tag: **Feature: pending-orders-display, Property 5: Stock validation on completion**

6. **Property 6: Complete order state transition**

   - Generate: Random pending orders with sufficient stock
   - Test: Verify status, stock reduction, and list removal
   - Tag: **Feature: pending-orders-display, Property 6: Complete order state transition**

7. **Property 7: Cancel order preserves inventory**

   - Generate: Random pending orders
   - Test: Verify status, unchanged stock, and list removal
   - Tag: **Feature: pending-orders-display, Property 7: Cancel order preserves inventory**

8. **Property 8: Manager permissions for all orders**
   - Generate: Random orders from different users, manager user
   - Test: Verify manager can complete/cancel any order
   - Tag: **Feature: pending-orders-display, Property 8: Manager permissions for all orders**

### Integration Testing

Integration tests will verify the complete flow:

1. **End-to-End Order Completion**:

   - Create pending order
   - Verify it appears in pending list
   - Complete the order
   - Verify it's removed from pending list
   - Verify inventory is reduced

2. **End-to-End Order Cancellation**:

   - Create pending order
   - Verify it appears in pending list
   - Cancel the order
   - Verify it's removed from pending list
   - Verify inventory is unchanged

3. **Role-Based Access**:
   - Create orders as different users
   - Query as CASHIER, verify filtered results
   - Query as MANAGER, verify all results

### Test Configuration

- **Framework**: Jest with React Testing Library
- **Property Testing**: fast-check library
- **Minimum Iterations**: 100 per property test
- **Coverage Target**: 80% code coverage for new components
- **Mocking**: Mock RTK Query hooks for component tests, use real API for integration tests
