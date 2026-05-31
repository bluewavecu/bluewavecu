-- Admin-managed transfer verification steps per member.
CREATE TYPE "TransferOtpStepKey" AS ENUM (
  'IDENTITY_CHECK',
  'AMOUNT_CONFIRMATION',
  'BENEFICIARY_VERIFICATION',
  'SECURITY_CLEARANCE',
  'FINAL_RELEASE'
);

CREATE TABLE "MemberTransferOtpStep" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stepKey" "TransferOtpStepKey" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "code" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,
  CONSTRAINT "MemberTransferOtpStep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MemberTransferOtpStep_userId_stepKey_key" ON "MemberTransferOtpStep"("userId", "stepKey");
CREATE INDEX "MemberTransferOtpStep_userId_idx" ON "MemberTransferOtpStep"("userId");
CREATE INDEX "MemberTransferOtpStep_enabled_idx" ON "MemberTransferOtpStep"("enabled");

ALTER TABLE "MemberTransferOtpStep"
  ADD CONSTRAINT "MemberTransferOtpStep_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
