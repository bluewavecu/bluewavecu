-- Scheduled admin credits/debits with effective transaction dates.
ALTER TYPE "AdjustmentStatus" ADD VALUE 'SCHEDULED';

ALTER TABLE "AdjustmentRequest"
  ADD COLUMN IF NOT EXISTS "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "AdjustmentRequest_effectiveAt_idx" ON "AdjustmentRequest"("effectiveAt");
