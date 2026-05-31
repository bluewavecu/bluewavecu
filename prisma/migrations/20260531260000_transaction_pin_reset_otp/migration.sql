-- CreateTable
CREATE TABLE "TransactionPinResetOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionPinResetOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionPinResetOtp_userId_idx" ON "TransactionPinResetOtp"("userId");

-- CreateIndex
CREATE INDEX "TransactionPinResetOtp_expiresAt_idx" ON "TransactionPinResetOtp"("expiresAt");

-- AddForeignKey
ALTER TABLE "TransactionPinResetOtp" ADD CONSTRAINT "TransactionPinResetOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
