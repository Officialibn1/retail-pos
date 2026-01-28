-- Add strategic indexes for analytics queries

-- Sales analytics indexes
-- Composite index for filtering sales by status and date range
CREATE INDEX idx_sales_status_created_at ON sales(status, "createdAt");

-- Index for cashier performance analytics (user-based filtering with status and date)
CREATE INDEX idx_sales_user_status_created_at ON sales("userId", status, "createdAt");

-- Index for customer analytics (customer-based filtering with status and date)
CREATE INDEX idx_sales_customer_status_created_at ON sales("customerId", status, "createdAt");

-- Index for payment method analytics
CREATE INDEX idx_sales_payment_method_status ON sales("paymentMethod", status);

-- Index for sales completion date analytics
CREATE INDEX idx_sales_completed_at ON sales("completedAt") WHERE "completedAt" IS NOT NULL;

-- Sale items analytics indexes
-- Composite index for product performance analytics (joining sale items with inventory)
CREATE INDEX idx_sale_items_inventory_sale ON sale_items("inventoryItemId", "saleId");

-- Index for revenue calculations (quantity and price are frequently used in aggregations)
CREATE INDEX idx_sale_items_quantity_price ON sale_items(quantity, price);

-- Inventory analytics indexes
-- Composite index for category-based inventory analysis (excluding deleted items)
CREATE INDEX idx_inventory_category_deleted ON inventory_items("categoryId", "deletedAt");

-- Index for stock level analysis (excluding deleted items)
CREATE INDEX idx_inventory_stock_deleted ON inventory_items(stock, "deletedAt");

-- Index for inventory value calculations (price and stock for active items)
CREATE INDEX idx_inventory_price_stock_active ON inventory_items(price, stock) WHERE "deletedAt" IS NULL;

-- Customer analytics indexes
-- Index for customer identification and analysis
CREATE INDEX idx_customers_phone_name ON customers(phone, name);

-- Index for customer creation date analysis
CREATE INDEX idx_customers_created_at ON customers("createdAt");

-- Activity logs analytics indexes (already exists but ensuring coverage)
-- The existing indexes on userId, createdAt, and action are sufficient for activity analytics

-- Stock movements analytics indexes
-- Index for inventory movement analysis by date
CREATE INDEX idx_stock_movements_created_at_reason ON stock_movements("createdAt", reason);