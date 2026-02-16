-- CreateEnum
CREATE TYPE "ResetType" AS ENUM ('LINK', 'OTP');

-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "type" "ResetType" NOT NULL DEFAULT 'LINK';

-- CreateIndex
CREATE INDEX "password_reset_tokens_otp_idx" ON "password_reset_tokens"("otp");
