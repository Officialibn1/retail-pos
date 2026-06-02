-- AlterTable: update defaults and precision for store_info
ALTER TABLE "store_info"
  ALTER COLUMN "name" SET DEFAULT 'POS Store',
  ALTER COLUMN "address" SET DEFAULT '',
  ALTER COLUMN "phone" SET DEFAULT '',
  ALTER COLUMN "primaryColor" SET DEFAULT '#7c3aed',
  ALTER COLUMN "primaryColor" SET NOT NULL,
  ALTER COLUMN "secondaryColor" SET DEFAULT '#a78bfa',
  ALTER COLUMN "secondaryColor" SET NOT NULL,
  ALTER COLUMN "logoUrl" SET DEFAULT '/pos_logo.png',
  ALTER COLUMN "logoUrl" SET NOT NULL;

ALTER TABLE "store_info" ALTER COLUMN "taxRate" TYPE DECIMAL(5,4);
