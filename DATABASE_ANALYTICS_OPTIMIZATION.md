# Database Analytics Optimization

## Overview

This document outlines the database optimization strategy implemented for the Advanced Analytics Dashboard. The optimization focuses on strategic indexing to improve query performance for analytics operations.

## Implemented Indexes

### Sales Table Indexes

1. **`idx_sales_status_created_at`** - Composite index on `(status, createdAt)`
   - Optimizes filtering by sale status and date range
   - Used by: All analytics queries that filter by COMPLETED status and date

2. **`idx_sales_user_status_created_at`** - Composite index on `(userId, status, createdAt)`
   - Optimizes cashier performance analytics
   - Used by: Cashier performance queries filtering by user and date

3. **`idx_sales_customer_status_created_at`** - Composite index on `(customerId, status, createdAt)`
   - Optimizes customer analytics queries
   - Used by: Customer spending and trend analysis

4. **`idx_sales_payment_method_status`** - Composite index on `(paymentMethod, status)`
   - Optimizes payment method breakdown analytics
   - Used by: Payment method analysis queries

5. **`idx_sales_completed_at`** - Index on `completedAt` (with WHERE clause for non-null values)
   - Optimizes queries filtering by completion date
   - Used by: Sales completion trend analysis

### Sale Items Table Indexes

1. **`idx_sale_items_inventory_sale`** - Composite index on `(inventoryItemId, saleId)`
   - Optimizes product performance analytics
   - Used by: Top products and category revenue queries

2. **`idx_sale_items_quantity_price`** - Composite index on `(quantity, price)`
   - Optimizes revenue calculation aggregations
   - Used by: All revenue and volume calculation queries

### Inventory Items Table Indexes

1. **`idx_inventory_category_deleted`** - Composite index on `(categoryId, deletedAt)`
   - Optimizes category-based inventory analysis
   - Used by: Category revenue and inventory value queries

2. **`idx_inventory_stock_deleted`** - Composite index on `(stock, deletedAt)`
   - Optimizes stock level analysis
   - Used by: Low stock identification and inventory value queries

3. **`idx_inventory_price_stock_active`** - Composite index on `(price, stock)` with WHERE clause for active items
   - Optimizes inventory value calculations
   - Used by: Current inventory value analysis

### Customer Table Indexes

1. **`idx_customers_phone_name`** - Composite index on `(phone, name)`
   - Optimizes customer identification and lookup
   - Used by: Customer analytics and top customer queries

2. **`idx_customers_created_at`** - Index on `createdAt`
   - Optimizes customer acquisition trend analysis
   - Used by: Customer growth and trend queries

### Stock Movements Table Indexes

1. **`idx_stock_movements_created_at_reason`** - Composite index on `(createdAt, reason)`
   - Optimizes inventory movement analysis
   - Used by: Stock movement trend analysis

## Query Performance Benefits

### Expected Performance Improvements

1. **Date Range Queries**: 10-50x faster for analytics queries filtering by date ranges
2. **Category Analysis**: 5-20x faster for category-based revenue analysis
3. **Customer Analytics**: 10-30x faster for customer spending and trend analysis
4. **Product Performance**: 5-15x faster for top products and inventory analysis
5. **Payment Analytics**: 3-10x faster for payment method breakdown queries

### Index Selectivity

The indexes are designed with high selectivity in mind:

- Status filtering (COMPLETED vs PENDING/CANCELLED) provides good selectivity
- Date range filtering on recent data provides excellent selectivity
- Category and customer filtering provide moderate to good selectivity

## Maintenance Considerations

### Index Maintenance

1. **Automatic Maintenance**: PostgreSQL automatically maintains indexes during DML operations
2. **Statistics Updates**: Regular ANALYZE operations will keep query planner statistics current
3. **Index Bloat**: Monitor index bloat and consider REINDEX operations if needed

### Monitoring

Monitor the following metrics:

- Query execution times for analytics endpoints
- Index usage statistics via `pg_stat_user_indexes`
- Index size and bloat via `pg_stat_user_tables`

## Migration Status

- **Migration File**: `20260122065131_add_analytics_indexes`
- **Status**: Created and ready for deployment
- **Prisma Schema**: Updated with all analytics indexes
- **Generated Client**: Updated with latest schema changes

## Next Steps

1. Apply the migration to the production database when ready
2. Monitor query performance after deployment
3. Consider additional indexes based on actual usage patterns
4. Implement query result caching for frequently accessed analytics data

## Index Coverage Summary

| Analytics Feature   | Primary Indexes Used                                               |
| ------------------- | ------------------------------------------------------------------ |
| Top Products        | `idx_sale_items_inventory_sale`, `idx_sales_status_created_at`     |
| Category Revenue    | `idx_inventory_category_deleted`, `idx_sale_items_inventory_sale`  |
| Sales Trends        | `idx_sales_status_created_at`, `idx_sales_completed_at`            |
| Payment Analysis    | `idx_sales_payment_method_status`                                  |
| Cashier Performance | `idx_sales_user_status_created_at`                                 |
| Customer Analytics  | `idx_sales_customer_status_created_at`, `idx_customers_phone_name` |
| Inventory Value     | `idx_inventory_price_stock_active`, `idx_inventory_stock_deleted`  |
| Customer Trends     | `idx_customers_created_at`, `idx_sales_customer_status_created_at` |
