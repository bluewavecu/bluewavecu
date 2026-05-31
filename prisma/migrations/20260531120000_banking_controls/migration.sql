-- Extend member status controls and banking policy settings.
ALTER TYPE "UserStatus" ADD VALUE 'ON_HOLD';
ALTER TYPE "UserStatus" ADD VALUE 'DISABLED';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "transactionsUnrestricted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "transactionPinHash" TEXT,
  ADD COLUMN IF NOT EXISTS "statusNote" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "delayedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "TransactionOtp" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransactionOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TransactionOtp_userId_idx" ON "TransactionOtp"("userId");
CREATE INDEX IF NOT EXISTS "TransactionOtp_expiresAt_idx" ON "TransactionOtp"("expiresAt");

ALTER TABLE "TransactionOtp"
  ADD CONSTRAINT "TransactionOtp_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "BankingPolicy" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "requireTransactionOtp" BOOLEAN NOT NULL DEFAULT true,
  "requireTransferReview" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,
  CONSTRAINT "BankingPolicy_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BankingPolicy" ("id", "requireTransactionOtp", "requireTransferReview", "updatedAt")
VALUES ('default', true, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
