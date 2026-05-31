-- CreateEnum
CREATE TYPE "IdDocumentType" AS ENUM ('DRIVERS_LICENSE', 'PASSPORT', 'STATE_ID', 'NATIONAL_ID');

-- CreateEnum
CREATE TYPE "IdVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DECLINED');

-- CreateTable
CREATE TABLE "IdVerificationSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "IdDocumentType" NOT NULL,
    "frontPhotoUrl" TEXT NOT NULL,
    "backPhotoUrl" TEXT,
    "status" "IdVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdVerificationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdVerificationSubmission_userId_idx" ON "IdVerificationSubmission"("userId");

-- CreateIndex
CREATE INDEX "IdVerificationSubmission_status_idx" ON "IdVerificationSubmission"("status");

-- CreateIndex
CREATE INDEX "IdVerificationSubmission_submittedAt_idx" ON "IdVerificationSubmission"("submittedAt");

-- AddForeignKey
ALTER TABLE "IdVerificationSubmission" ADD CONSTRAINT "IdVerificationSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
