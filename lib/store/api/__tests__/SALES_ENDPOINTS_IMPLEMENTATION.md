# Sales Endpoints Implementation

This document summarizes the implementation of sales endpoints in the RTK Query API.

## Task 9: Define Sales Endpoints

**Status**: ✅ Completed

**Requirements Addressed**:

- 5.3: Create queries and mutations for sales operations
- 6.1: Invalidate sales and inventory cache on mutations
- 10.2: Specify TypeScript types for all endpoints

## Implemented Endpoints

### 1. Get Sales Query (`getSales`)

**Purpose**: Fetches all sales with role-based filtering

**Hook**: `useGetSalesQuery()`

**Request**: No parameters (void)

**Response**: `SaleWithDetails[]`

**Cache Tags**: `['Sales']`

**Features**:

- CASHIER sees only their sales
- MANAGER+ sees all sales
- Returns sales with items, customer, and user information

---

### 2. Get Sale Query (`getSale`)

**Purpose**: Fetches a single sale by ID with role-based access control

**Hook**: `useGetSaleQuery(id: string)`

**Request**: `string` (sale ID)

**Response**: `SaleWithDetails`

**Cache Tags**: `['Sales']`

**Features**:

- CASHIER can only see their own sales
- Returns sale with items, customer, and user information

---

### 3. Create Sale Mutation (`createSale`)

**Purpose**: Creates a new sale with PENDING status

**Hook**: `useCreateSaleMutation()`

**Request**: `CreateSaleRequest`

```typescript
{
  items: Array<{
    inventoryItemId: string;
    quantity: number;
    price: number | string;
  }>;
  customerId?: string | null;
  userId: string;
}
```

**Response**: `SaleData`

**Cache Invalidation**: `['Sales']`

**Features**:

- Validates inventory availability for all items
- Does not reduce stock until sale is completed
- Creates sale with PENDING status

---

### 4. Complete Sale Mutation (`completeSale`)

**Purpose**: Completes a sale with payment details

**Hook**: `useCompleteSaleMutation()`

**Request**: `{ id: string; data: CompleteSaleRequest }`

```typescript
{
	id: string;
	data: {
		paymentMethod: "CASH" | "CARD" | "TRANSFER" | "OTHER";
		amountPaid: number | string;
	}
}
```

**Response**: `SaleData`

**Cache Invalidation**: `['Sales', 'Inventory']`

**Features**:

- Updates status to COMPLETED
- Reduces inventory stock
- Creates stock movements
- Calculates change given based on amount paid and total
- Invalidates both Sales and Inventory caches

---

### 5. Cancel Sale Mutation (`cancelSale`)

**Purpose**: Cancels a sale and restores inventory stock if it was completed

**Hook**: `useCancelSaleMutation()`

**Request**: `string` (sale ID)

**Response**: `SaleData`

**Cache Invalidation**: `['Sales', 'Inventory']`

**Features**:

- Updates status to CANCELLED
- Restores inventory stock if sale was completed
- Creates stock movements
- Can cancel both PENDING and COMPLETED sales
- Invalidates both Sales and Inventory caches

---

## TypeScript Types

### Request Types

- `CreateSaleRequest`: Request body for creating a sale
- `CompleteSaleRequest`: Request body for completing a sale
- `CancelSaleRequest`: Request body for canceling a sale (optional)

### Response Types

- `SaleWithDetails`: Full sale data with items, customer, and user
- `SaleData`: Basic sale data without related entities
- `SaleItemData`: Sale item with inventory information
- `SaleCustomerData`: Customer information in a sale
- `SaleUserData`: User information in a sale

### Status Types

- `"PENDING"`: Sale created but not completed
- `"COMPLETED"`: Sale completed with payment
- `"CANCELLED"`: Sale cancelled

### Payment Method Types

- `"CASH"`: Cash payment
- `"CARD"`: Card payment
- `"TRANSFER"`: Bank transfer
- `"OTHER"`: Other payment method

---

## Cache Invalidation Strategy

### Sales Mutations

All sales mutations invalidate the `'Sales'` tag to ensure:

- Sales lists are refetched after create/complete/cancel
- Individual sale queries are refetched
- UI always displays up-to-date sales data

### Inventory Impact

`completeSale` and `cancelSale` also invalidate the `'Inventory'` tag because:

- Completing a sale reduces inventory stock
- Canceling a completed sale restores inventory stock
- This ensures inventory displays are automatically updated

---

## Usage Examples

### Fetching Sales

```typescript
import { useGetSalesQuery } from "@/lib/store/api";

function SalesList() {
	const { data: sales, isLoading, isError } = useGetSalesQuery();

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error loading sales</div>;

	return (
		<ul>
			{sales?.map((sale) => (
				<li key={sale.id}>
					{sale.id} - ₦{sale.total}
				</li>
			))}
		</ul>
	);
}
```

### Creating a Sale

```typescript
import { useCreateSaleMutation } from "@/lib/store/api";

function CreateSale() {
	const [createSale, { isLoading }] = useCreateSaleMutation();

	const handleCreate = async () => {
		try {
			const result = await createSale({
				items: [{ inventoryItemId: "item-1", quantity: 2, price: 100 }],
				userId: "user-123",
				customerId: null,
			}).unwrap();

			console.log("Sale created:", result);
		} catch (error) {
			console.error("Failed to create sale:", error);
		}
	};

	return (
		<button
			onClick={handleCreate}
			disabled={isLoading}>
			Create Sale
		</button>
	);
}
```

### Completing a Sale

```typescript
import { useCompleteSaleMutation } from "@/lib/store/api";

function CompleteSale({ saleId }: { saleId: string }) {
	const [completeSale, { isLoading }] = useCompleteSaleMutation();

	const handleComplete = async () => {
		try {
			const result = await completeSale({
				id: saleId,
				data: {
					paymentMethod: "CASH",
					amountPaid: 500,
				},
			}).unwrap();

			console.log("Sale completed:", result);
		} catch (error) {
			console.error("Failed to complete sale:", error);
		}
	};

	return (
		<button
			onClick={handleComplete}
			disabled={isLoading}>
			Complete Sale
		</button>
	);
}
```

### Canceling a Sale

```typescript
import { useCancelSaleMutation } from "@/lib/store/api";

function CancelSale({ saleId }: { saleId: string }) {
	const [cancelSale, { isLoading }] = useCancelSaleMutation();

	const handleCancel = async () => {
		try {
			const result = await cancelSale(saleId).unwrap();
			console.log("Sale cancelled:", result);
		} catch (error) {
			console.error("Failed to cancel sale:", error);
		}
	};

	return (
		<button
			onClick={handleCancel}
			disabled={isLoading}>
			Cancel Sale
		</button>
	);
}
```

---

## Verification

To verify the implementation:

1. ✅ All 5 endpoints are defined in the API configuration
2. ✅ All endpoints have proper TypeScript types
3. ✅ All endpoints have appropriate cache tags
4. ✅ Mutations invalidate correct cache tags
5. ✅ All hooks are exported from the API module
6. ✅ Documentation includes usage examples
7. ✅ No TypeScript errors in the implementation

---

## Next Steps

The sales endpoints are now ready to be used in components. The next tasks in the implementation plan are:

- Task 10: Define user management endpoints
- Task 11: Define customer and category endpoints
- Task 12: Define analytics and activity log endpoints
- Task 14: Migrate sales page to use RTK Query (will use these endpoints)

---

## Related Files

- `lib/store/api/index.ts` - Main API configuration with sales endpoints
- `app/api/sales/route.ts` - Backend API route for sales list and creation
- `app/api/sales/[id]/route.ts` - Backend API route for single sale
- `app/api/sales/[id]/complete/route.ts` - Backend API route for completing sales
- `app/api/sales/[id]/cancel/route.ts` - Backend API route for canceling sales
- `lib/services/sale.service.ts` - Backend service layer for sales operations
- `lib/validations/sale.schema.ts` - Zod validation schemas for sales
