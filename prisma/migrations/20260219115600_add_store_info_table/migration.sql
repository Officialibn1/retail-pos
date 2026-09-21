-- CreateTable
CREATE TABLE "store_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'John Doe Store',
    "address" TEXT NOT NULL DEFAULT 'John Doe Street',
    "phone" TEXT NOT NULL DEFAULT '1100092223',
    "email" TEXT,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_info_pkey" PRIMARY KEY ("id")
);
