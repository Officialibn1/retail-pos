-- CreateTable
CREATE TABLE "cash_drawer_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openingFloat" DECIMAL(10,2) NOT NULL,
    "declaredClose" DECIMAL(10,2),
    "expectedClose" DECIMAL(10,2),
    "variance" DECIMAL(10,2),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "cash_drawer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_drawer_sessions_userId_idx" ON "cash_drawer_sessions"("userId");

-- CreateIndex
CREATE INDEX "cash_drawer_sessions_openedAt_idx" ON "cash_drawer_sessions"("openedAt");

-- CreateIndex
CREATE INDEX "cash_drawer_sessions_closedAt_idx" ON "cash_drawer_sessions"("closedAt");

-- AddForeignKey
ALTER TABLE "cash_drawer_sessions" ADD CONSTRAINT "cash_drawer_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
