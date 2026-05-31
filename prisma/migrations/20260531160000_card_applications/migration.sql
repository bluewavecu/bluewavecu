-- CreateEnum
CREATE TYPE "CardApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN "panPrefix" TEXT NOT NULL DEFAULT '552901';
ALTER TABLE "Card" ADD COLUMN "network" TEXT NOT NULL DEFAULT 'MASTERCARD';
ALTER TABLE "Card" ADD COLUMN "expiryMonth" INTEGER;
ALTER TABLE "Card" ADD COLUMN "expiryYear" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "cardId" TEXT;

-- CreateTable
CREATE TABLE "CardApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "cardholderName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "status" "CardApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "cardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardApplication_cardId_key" ON "CardApplication"("cardId");

-- CreateIndex
CREATE INDEX "CardApplication_userId_idx" ON "CardApplication"("userId");

-- CreateIndex
CREATE INDEX "CardApplication_accountId_idx" ON "CardApplication"("accountId");

-- CreateIndex
CREATE INDEX "CardApplication_status_idx" ON "CardApplication"("status");

-- CreateIndex
CREATE INDEX "CardApplication_createdAt_idx" ON "CardApplication"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_cardId_idx" ON "Transaction"("cardId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardApplication" ADD CONSTRAINT "CardApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardApplication" ADD CONSTRAINT "CardApplication_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardApplication" ADD CONSTRAINT "CardApplication_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
