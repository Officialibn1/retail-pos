-- CreateIndex
CREATE INDEX "inventory_items_price_stock_idx" ON "inventory_items"("price", "stock");

-- CreateIndex
CREATE INDEX "sales_completedAt_idx" ON "sales"("completedAt");

-- RenameIndex
ALTER INDEX "idx_customers_created_at" RENAME TO "customers_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_customers_phone_name" RENAME TO "customers_phone_name_idx";

-- RenameIndex
ALTER INDEX "idx_inventory_category_deleted" RENAME TO "inventory_items_categoryId_deletedAt_idx";

-- RenameIndex
ALTER INDEX "idx_inventory_stock_deleted" RENAME TO "inventory_items_stock_deletedAt_idx";

-- RenameIndex
ALTER INDEX "idx_sale_items_inventory_sale" RENAME TO "sale_items_inventoryItemId_saleId_idx";

-- RenameIndex
ALTER INDEX "idx_sale_items_quantity_price" RENAME TO "sale_items_quantity_price_idx";

-- RenameIndex
ALTER INDEX "idx_sales_customer_status_created_at" RENAME TO "sales_customerId_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_sales_payment_method_status" RENAME TO "sales_paymentMethod_status_idx";

-- RenameIndex
ALTER INDEX "idx_sales_status_created_at" RENAME TO "sales_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_sales_user_status_created_at" RENAME TO "sales_userId_status_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_stock_movements_created_at_reason" RENAME TO "stock_movements_createdAt_reason_idx";
