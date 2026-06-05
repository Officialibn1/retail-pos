# POS System — Improvement Plan

## Priority Key
- 🔴 High — core retail workflow, noticeable gap in daily use
- 🟡 Medium — adds meaningful value, moderate effort
- 🟢 Low — nice-to-have, low urgency

---

## Missing Features

### 1. Returns & Refunds 🔴
**What:** Allow partial or full returns on completed sales, issue refund, and restock returned items.

- [x] Add `Return` model to schema (`saleId`, `items[]`, `refundAmount`, `reason`, `createdAt`)
- [x] Add `RETURN` status or keep returns as separate records linked to original sale
- [x] Add `POST /api/sales/[id]/return` API route
- [x] Update stock movements to record restocked quantities with reason `RETURN`
- [x] Add "Process Return" action on the sales history table
- [x] Build return dialog (item selection with quantities, refund method)
- [x] Add RTK mutation `useCreateReturnMutation`
- [x] Show return records in sales history and customer purchase history

---

### 2. Supplier & Purchase Orders 🟡
**What:** Track who supplies inventory, at what cost, and when stock was received.

- [ ] Add `Supplier` model (`name`, `phone`, `email`, `address`)
- [ ] Add `PurchaseOrder` model (`supplierId`, `status`, `items[]`, `totalCost`, `receivedAt`)
- [ ] Add `cost` (purchase price) field to `InventoryItem` schema
- [ ] Add CRUD API routes for suppliers and purchase orders
- [ ] Build Suppliers page (MANAGER+)
- [ ] Build Purchase Orders page with "Mark as Received" action that auto-adjusts stock
- [ ] Expose `cost` field in the add/edit inventory item dialog
- [ ] Unlock margin/profit calculations in analytics once `cost` is populated

---

### 3. Expense Tracking 🟡
**What:** Record operational costs so analytics can show profit, not just revenue.

- [ ] Add `Expense` model (`category`, `amount`, `description`, `date`, `recordedBy`)
- [ ] Add `ExpenseCategory` enum or model (Rent, Salaries, Utilities, Restocking, Other)
- [ ] Add `GET/POST /api/expenses` and `PUT/DELETE /api/expenses/[id]` routes
- [ ] Build Expenses page (MANAGER+)
- [ ] Add "Total Expenses" and "Net Profit" cards to analytics dashboard

---

### 4. Cash Drawer Management (Shift Open/Close) 🔴
**What:** Cashiers declare opening float; system reconciles expected cash vs declared at shift end.

- [x] Add `CashDrawerSession` model (`userId`, `openingFloat`, `declaredClose`, `expectedClose`, `variance`, `openedAt`, `closedAt`)
- [x] Add `POST /api/cash-drawer/open` and `POST /api/cash-drawer/close` routes
- [x] Build "Open Shift" dialog shown to CASHIER on first login of the day
- [x] Build "Close Shift" dialog with cash count entry and variance display
- [x] Show shift status in dashboard sidebar/header
- [x] Add cash drawer sessions to activity log

---

### 5. Low-Stock Alerts 🟡
**What:** Proactively notify relevant roles when stock drops below a defined threshold.

- [ ] Add `lowStockThreshold` field to `InventoryItem` (default: 10, currently `reorderLevel` could serve this purpose — evaluate reuse)
- [ ] Add in-app notification bell in dashboard header
- [ ] Add `Notification` model or use a server-sent event / polling approach
- [ ] Send email notification to MANAGER + SUPERADMIN when stock hits threshold after a sale
- [ ] Add "Low Stock" badge/count to Inventory sidebar link

---

### 6. Discount Codes & Promotions 🟢
**What:** Pre-define promotions that apply automatically or via a coupon code at checkout.

- [ ] Add `Promotion` model (`code`, `type: PERCENTAGE | FIXED`, `value`, `scope: ALL | CATEGORY | ITEM`, `expiresAt`, `usageLimit`)
- [ ] Add CRUD routes and a Promotions page (MANAGER+)
- [ ] Add coupon code input field in the checkout/cart component
- [ ] Apply promotion discount server-side when creating a sale
- [ ] Track promotion usage per sale

---

### 7. Barcode Label Printing 🟢
**What:** Generate and print barcode labels for inventory items directly from the app.

- [ ] Add a "Print Label" action in the inventory table row dropdown
- [ ] Build a label preview component (item name, SKU, price, barcode image using a library like `jsbarcode`)
- [ ] Add print-optimised CSS for label layout
- [ ] Support batch printing (select multiple items → print all labels)

---

## Improvements to Existing Modules

### Sales / Checkout 🔴
- [ ] **Fix receipt store info:** Update `components/receipts/receipt-template.tsx` to use `useGetStoreSettingsQuery` instead of `process.env.NEXT_PUBLIC_STORE_*`
- [ ] **Add items to a pending order:** See detailed workflow below.
- [ ] **Item notes:** Add an optional per-line note field in the cart (e.g. "gift wrap", "size adjustment")

#### Add Items to a Pending Order — Detailed Workflow

**Problem:** Once a cashier creates a pending order and the cart clears, there is no way to add more items if the customer decides to pick up another product before paying.

**Proposed workflow:**

1. On each `PendingOrderCard`, add a third action button: **"Edit Order"** (alongside existing Complete / Cancel).
2. Clicking "Edit Order" loads the pending order's current items back into the Redux cart (restoring product, quantity, price, discount) and sets a piece of state `editingOrderId` on the New Sale page.
3. While `editingOrderId` is set:
   - The product search and cart work normally — the cashier adds or removes items.
   - The "Proceed to Checkout" button is replaced with **"Update Order"**.
   - A banner above the cart reads "Editing Order #XXXXXXXX".
4. Clicking "Update Order" calls a new `PATCH /api/sales/[id]/items` endpoint with the new item list.
5. The server:
   - Calculates the **diff** between old and new items.
   - Restores stock for removed/reduced items (creates `SALE_ITEM_REMOVED` stock movements).
   - Deducts stock for added/increased items (validates availability first).
   - Recalculates `subTotal`, `taxAmount`, `discountAmount`, and `total` on the sale record.
   - Returns the updated sale.
6. On success, `editingOrderId` is cleared, the cart is cleared, and the pending orders list refetches.

**Files to create/modify:**
- [ ] `app/api/sales/[id]/items/route.ts` — new `PATCH` route (auth required, any role, active mutation check)
- [ ] `lib/store/api/index.ts` — add `useUpdateSaleItemsMutation`
- [ ] `components/sales/pending-order-card.tsx` — add "Edit Order" button
- [ ] `components/sales/pending-orders-list.tsx` — add `onEdit` callback prop
- [ ] `app/dashboard/sales/new/page.tsx` — handle `editingOrderId` state, swap checkout button label, pass edit handler to `PendingOrdersList`
- [ ] `components/sales/shopping-cart.tsx` — accept and display an `editingOrderId` prop to show the editing banner and change the button label

---

### Inventory 🟡
- [ ] **Bulk CSV import:** Add "Import" button on the Inventory page; accept a CSV with columns matching the item schema; validate and preview before committing
- [ ] **Add `cost` field:** Add purchase price to `InventoryItem` schema and expose in add/edit dialogs (prerequisite for supplier orders and margin analytics)
- [ ] **Product image:** Add `imageUrl` field to `InventoryItem`; display thumbnail in inventory table and product search during checkout

---

### Customers 🟢
- [ ] **Enforce name on registration:** Make `name` required when creating a customer through the UI (it's optional in the DB for walk-ins, but the form should require it)
- [ ] **Spending tier / loyalty indicator:** Compute total spend from existing sale data and display a tier badge (e.g. Bronze < ₦50k, Silver < ₦200k, Gold ≥ ₦200k) on the customer detail view — no schema change needed

---

### Analytics 🟡
- [ ] **Period comparison:** Add a "Compare to previous period" toggle on analytics charts; overlay current vs previous range on the same chart
- [ ] **Filtered report export:** Add "Export CSV" and "Export PDF" buttons per analytics tab (top products, sales trends, etc.) — separate from the full DB backup
- [ ] **Shift-based reporting:** Add a "By Shift" breakdown tab using the `shift` field on users, aggregating sales by the cashier's assigned shift

---

### Activity Logs 🟢
- [ ] **Structured metadata:** Store a JSON `metadata` field on `ActivityLog` alongside the free-text `details` (e.g. `{ entityType: "InventoryItem", entityId: "...", changes: { price: [old, new] } }`)
- [ ] **Filter by entity:** Add filter dropdowns on the Activity Logs page for entity type and entity ID so specific item/sale histories are queryable without text search

---

### Settings 🟢
- [ ] **MANAGER store edit access:** Allow MANAGER role to update `phone`, `address`, and `email` (but not `taxRate`, `primaryColor`, or `logoUrl` — those stay SUPERADMIN-only); update the PUT route's role check and the form's disabled logic accordingly
- [ ] **Currency configuration:** Add a `currency` field to `StoreSettings` (code + symbol, e.g. `NGN` / `₦`); replace the hardcoded `₦` symbol across receipt templates, analytics cards, and the cart with a value read from store settings

---

## Suggested Implementation Order

| Phase | Items | Rationale |
|---|---|---|
| 1 | Receipt store info fix, `cost` field, Returns & Refunds | Correctness fixes + highest daily impact |
| 2 | Cash Drawer Management, Low-Stock Alerts, Bulk CSV Import | Operational workflow completeness |
| 3 | Expense Tracking, Supplier/Purchase Orders, Analytics improvements | Financial accuracy |
| 4 | Discount Codes, Loyalty tiers, Shift reporting, Filtered exports | Growth & reporting features |
| 5 | Barcode printing, Activity log metadata, Currency config, Item notes | Polish |
